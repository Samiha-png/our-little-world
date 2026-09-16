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

  await runTransaction(db, async (tx) => {
    const inviteRef = doc(db, "invites", inviteId);
    const inviteSnap = await tx.get(inviteRef);
    if (!inviteSnap.exists()) throw new Error("This invite no longer exists.");

    const invite = inviteSnap.data();
    if (invite.status !== "pending") throw new Error("This invite was already used.");
    if ((invite.invitedEmail || "").toLowerCase() !== normalizedEmail) {
      throw new Error("This invite isn't for your account.");
    }

    const spaceRef = doc(db, "spaces", invite.spaceId);
    const spaceSnap = await tx.get(spaceRef);
    if (!spaceSnap.exists()) throw new Error("That Space no longer exists.");

    const space = spaceSnap.data();
    const memberUids = Array.isArray(space.memberUids) ? space.memberUids : [];

    if (memberUids.includes(uid)) {
      throw new Error("You are already a member of this Space.");
    }
    if (memberUids.length >= 2) {
      throw new Error("This Space already has two members.");
    }

    const userRef = doc(db, "users", uid);

    tx.update(spaceRef, {
      memberUids: arrayUnion(uid),
      [`members.${uid}`]: {
        displayName,
        email: normalizedEmail,
        joinedAt: Date.now()
      },
      lastInviteId: inviteId
    });

    tx.update(inviteRef, {
      status: "accepted",
      acceptedAt: Date.now(),
      acceptedByUid: uid
    });

    tx.set(userRef, {
      uid,
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split("@")[0] || "You",
      spaceId: invite.spaceId,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
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
