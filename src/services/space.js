/* =========================================================================
   SPACE — resolves the authenticated user's current Space and handles
   invite-by-email joining. Ported 1:1 from js/space.js.
   ========================================================================= */
import { db } from "./firebase";
import {
  doc, getDoc, setDoc, onSnapshot,
  collection, query, where, addDoc, runTransaction, deleteDoc,
  serverTimestamp, arrayUnion
} from "firebase/firestore";

export async function resolveUserSpaceId(uid) {
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) return null;
  return userSnap.data().spaceId || null;
}

export async function createSpace(uid, email, displayName, spaceName) {
  const spaceRef = doc(collection(db, "spaces"));
  await setDoc(spaceRef, {
    name: spaceName || "Our Space",
    memberUids: [uid],
    members: {
      [uid]: { displayName, email: email.toLowerCase(), joinedAt: Date.now() }
    },
    legacyMigrated: false,
    createdBy: uid,
    createdAt: serverTimestamp()
  });
  await setDoc(doc(db, "users", uid), {
    uid,
    email: (email || "").trim().toLowerCase(),
    displayName: displayName || (email || "").split("@")[0] || "You",
    spaceId: spaceRef.id,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return spaceRef.id;
}

export function listenToSpace(spaceId, callback) {
  return onSnapshot(
    doc(db, "spaces", spaceId),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (error) => {
      console.error("[Firebase listener] space", error);
      window.dispatchEvent(new CustomEvent("firebase-listener-error", { detail: { label: "space", error } }));
    }
  );
}

export async function sendInvite(spaceId, spaceName, byUid, byName, invitedEmail) {
  invitedEmail = invitedEmail.trim().toLowerCase();
  const inviteRef = await addDoc(collection(db, "invites"), {
    spaceId, spaceName,
    invitedByUid: byUid,
    invitedByName: byName,
    invitedEmail,
    status: "pending",
    createdAt: serverTimestamp()
  });
  return inviteRef.id;
}

export function listenToMyInvites(email, callback) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    callback([]);
    return () => {};
  }

  // Keep this query to one equality filter so an extra composite Firestore
  // index is not required just to show pending invitations.
  const q = query(
    collection(db, "invites"),
    where("invitedEmail", "==", normalizedEmail)
  );

  return onSnapshot(q, (snap) => {
    callback(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((invite) => invite.status === "pending")
    );
  }, (error) => {
    console.error("[Firebase listener] my invites", error);
  });
}

export async function getInvite(inviteId) {
  if (!inviteId) return null;
  const snap = await getDoc(doc(db, "invites", inviteId));
  return snap.exists() ? snap.data() : null;
}

export async function acceptInvite(inviteId, uid, email, displayName) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!inviteId || !uid || !normalizedEmail) {
    throw new Error("Your invitation details are incomplete.");
  }

  console.log("[SPACE DEBUG] ACCEPT INVITE START");

  try {
    await runTransaction(db, async (tx) => {
      console.log("[SPACE DEBUG] STEP 1 → Reading invite");
      const inviteRef = doc(db, "invites", inviteId);
      const inviteSnap = await tx.get(inviteRef);
      if (!inviteSnap.exists()) throw new Error("This invite no longer exists.");

      console.log("[SPACE DEBUG] STEP 2 → Validating invite");
      const invite = inviteSnap.data();
      if (invite.status !== "pending") throw new Error("This invite was already used.");
      if ((invite.invitedEmail || "").toLowerCase() !== normalizedEmail) {
        throw new Error("This invite isn't for your account.");
      }
      if (!invite.spaceId) {
        throw new Error("This invite does not contain a valid Space ID.");
      }

      console.log("[SPACE DEBUG] STEP 3 → References prepared");
      const spaceRef = doc(db, "spaces", invite.spaceId);
      const userRef = doc(db, "users", uid);

      console.log("[SPACE DEBUG] STEP 4 → Queueing Space update");
      tx.update(spaceRef, {
        memberUids: arrayUnion(uid),
        [`members.${uid}`]: {
          displayName:
            displayName ||
            normalizedEmail.split("@")[0] ||
            "You",
          email: normalizedEmail,
          joinedAt: Date.now()
        },
        lastInviteId: inviteId
      });

      console.log("[SPACE DEBUG] STEP 5 → Queueing invite acceptance");
      tx.update(inviteRef, {
        status: "accepted",
        acceptedAt: Date.now(),
        acceptedByUid: uid
      });

      console.log("[SPACE DEBUG] STEP 6 → Queueing user update");
      tx.set(userRef, {
        uid,
        email: normalizedEmail,
        displayName:
          displayName ||
          normalizedEmail.split("@")[0] ||
          "You",
        spaceId: invite.spaceId,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    console.log("[SPACE DEBUG] ACCEPT INVITE SUCCESS");
  } catch (error) {
    console.error("[SPACE DEBUG ERROR] Error code:", error?.code || "N/A");
    console.error("[SPACE DEBUG ERROR] Error message:", error?.message || "Unknown error");
    console.error("[SPACE DEBUG ERROR] Full error:", error);
    throw error;
  }
}

export async function cancelInvite(inviteId) {
  await deleteDoc(doc(db, "invites", inviteId));
}

export function listenToMySentInvites(spaceId, byUid, callback) {
  const q = query(
    collection(db, "invites"),
    where("spaceId", "==", spaceId),
    where("invitedByUid", "==", byUid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), (error) => {
    console.error("[Firebase listener] sent invites", error);
  });
}

export function otherMembers(space, myUid) {
  if (!space || !space.members) return [];
  return Object.entries(space.members)
    .filter(([uid]) => uid !== myUid)
    .map(([uid, m]) => ({ uid, ...m }));
}
