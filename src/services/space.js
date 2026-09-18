/* =========================================================================
   SPACE SERVICE
   -------------------------------------------------------------------------
   Handles:
   - Current user's Space ID
   - Creating a Space
   - Listening to a Space
   - Sending invites
   - Receiving invites
   - Accepting invites
   - Cancelling invites
   - Sent invites
   - Other Space members

   Firebase is the source of truth.
   ========================================================================= */

import { db } from "./firebase";

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  addDoc,
  runTransaction,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";

/* =========================================================================
   HELPERS
========================================================================= */

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function safeDisplayName(displayName, email) {
  return (
    displayName ||
    (email || "").split("@")[0] ||
    "You"
  );
}

/* =========================================================================
   RESOLVE CURRENT USER'S SPACE
========================================================================= */

export async function resolveUserSpaceId(uid) {
  if (!uid) return null;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();

    return data?.spaceId || null;
  } catch (error) {
    console.error(
      "[Firebase] Failed to resolve user's Space:",
      error
    );

    throw error;
  }
}

/* =========================================================================
   CREATE SPACE
========================================================================= */

export async function createSpace(
  uid,
  email,
  displayName,
  spaceName
) {
  if (!uid) {
    throw new Error("You must be signed in to create a Space.");
  }

  const normalizedEmail = normalizeEmail(email);
  const finalDisplayName = safeDisplayName(
    displayName,
    normalizedEmail
  );

  const finalSpaceName =
    (spaceName || "").trim() || "Our Space";

  try {
    // Create a new document ID under /spaces
    const spaceRef = doc(collection(db, "spaces"));

    /* ---------------------------------------------------------------------
       Create Space document
    --------------------------------------------------------------------- */

    await setDoc(spaceRef, {
      name: finalSpaceName,

      memberUids: [uid],

      members: {
        [uid]: {
          displayName: finalDisplayName,
          email: normalizedEmail,
          joinedAt: Date.now(),
        },
      },

      legacyMigrated: false,

      createdBy: uid,

      createdAt: serverTimestamp(),
    });

    /* ---------------------------------------------------------------------
       Link current user to this Space
    --------------------------------------------------------------------- */

    await setDoc(
      doc(db, "users", uid),
      {
        uid,
        email: normalizedEmail,
        displayName: finalDisplayName,
        spaceId: spaceRef.id,
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return spaceRef.id;
  } catch (error) {
    console.error(
      "[Firebase] Failed to create Space:",
      error
    );

    throw error;
  }
}

/* =========================================================================
   LISTEN TO CURRENT SPACE
========================================================================= */

export function listenToSpace(spaceId, callback) {
  if (!spaceId) {
    callback(null);
    return () => {};
  }

  const spaceRef = doc(db, "spaces", spaceId);

  return onSnapshot(
    spaceRef,

    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }

      callback({
        id: snap.id,
        ...snap.data(),
      });
    },

    (error) => {
      console.error(
        "[Firebase listener] space:",
        error
      );

      window.dispatchEvent(
        new CustomEvent("firebase-listener-error", {
          detail: {
            label: "space",
            error,
          },
        })
      );
    }
  );
}

/* =========================================================================
   SEND INVITE
========================================================================= */

export async function sendInvite(
  spaceId,
  spaceName,
  byUid,
  byName,
  invitedEmail
) {
  if (!spaceId) {
    throw new Error("Space ID is missing.");
  }

  if (!byUid) {
    throw new Error("Your account information is missing.");
  }

  const normalizedEmail = normalizeEmail(invitedEmail);

  if (!normalizedEmail) {
    throw new Error("Please enter an email address.");
  }

  const finalSpaceName =
    (spaceName || "").trim() || "Our Space";

  const finalByName =
    byName || "Your partner";

  try {
    const inviteRef = await addDoc(
      collection(db, "invites"),
      {
        spaceId,

        spaceName: finalSpaceName,

        invitedByUid: byUid,

        invitedByName: finalByName,

        invitedEmail: normalizedEmail,

        status: "pending",

        createdAt: serverTimestamp(),
      }
    );

    return inviteRef.id;
  } catch (error) {
    console.error(
      "[Firebase] Failed to send invite:",
      error
    );

    throw error;
  }
}

/* =========================================================================
   LISTEN TO MY RECEIVED INVITES
========================================================================= */

export function listenToMyInvites(
  email,
  callback
) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    callback([]);
    return () => {};
  }

  const invitesRef = collection(
    db,
    "invites"
  );

  /*
    Only one Firestore equality filter.

    We filter status === pending locally so we don't
    require an additional composite index.
  */

  const invitesQuery = query(
    invitesRef,
    where(
      "invitedEmail",
      "==",
      normalizedEmail
    )
  );

  return onSnapshot(
    invitesQuery,

    (snap) => {
      const invites = snap.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter(
          (invite) =>
            invite.status === "pending"
        );

      callback(invites);
    },

    (error) => {
      console.error(
        "[Firebase listener] my invites:",
        error
      );

      callback([]);
    }
  );
}

/* =========================================================================
   GET SINGLE INVITE
========================================================================= */

export async function getInvite(inviteId) {
  if (!inviteId) {
    return null;
  }

  try {
    const inviteRef = doc(
      db,
      "invites",
      inviteId
    );

    const snap = await getDoc(inviteRef);

    if (!snap.exists()) {
      return null;
    }

    return {
      id: snap.id,
      ...snap.data(),
    };
  } catch (error) {
    console.error(
      "[Firebase] Failed to get invite:",
      error
    );

    throw error;
  }
}

/* =========================================================================
   ACCEPT INVITE
   -------------------------------------------------------------------------
   IMPORTANT:

   We intentionally DO NOT do:

       tx.get(spaceRef)

   before the invited user becomes a member.

   The invited user is not yet a Space member, so Firestore rules may
   reject that read.

   Instead, the transaction reads the invite and directly performs the
   validated Space update. Your Firestore rules validate the invitation
   and membership change.
========================================================================= */

export async function acceptInvite(
  inviteId,
  uid,
  email,
  displayName
) {
  const normalizedEmail = normalizeEmail(email);

  if (!inviteId) {
    throw new Error(
      "Invitation ID is missing."
    );
  }

  if (!uid) {
    throw new Error(
      "Your account information is missing."
    );
  }

  if (!normalizedEmail) {
    throw new Error(
      "Your email information is missing."
    );
  }

  const finalDisplayName = safeDisplayName(
    displayName,
    normalizedEmail
  );

  try {
    await runTransaction(
      db,
      async (tx) => {
        /* -----------------------------------------------------------------
           Read invite
        ----------------------------------------------------------------- */

        const inviteRef = doc(
          db,
          "invites",
          inviteId
        );

        const inviteSnap =
          await tx.get(inviteRef);

        if (!inviteSnap.exists()) {
          throw new Error(
            "This invite no longer exists."
          );
        }

        const invite =
          inviteSnap.data();

        /* -----------------------------------------------------------------
           Validate invite
        ----------------------------------------------------------------- */

        if (invite.status !== "pending") {
          throw new Error(
            "This invite was already used."
          );
        }

        const invitedEmail =
          normalizeEmail(
            invite.invitedEmail
          );

        if (
          invitedEmail !==
          normalizedEmail
        ) {
          throw new Error(
            "This invite isn't for your account."
          );
        }

        if (!invite.spaceId) {
          throw new Error(
            "This invitation is missing its Space."
          );
        }

        /* -----------------------------------------------------------------
           References
        ----------------------------------------------------------------- */

        const spaceRef = doc(
          db,
          "spaces",
          invite.spaceId
        );

        const userRef = doc(
          db,
          "users",
          uid
        );

        /* -----------------------------------------------------------------
           Add invited user to Space

           DO NOT READ spaceRef here.

           Firestore rules handle the validation.
        ----------------------------------------------------------------- */

        tx.update(spaceRef, {
          memberUids: arrayUnion(uid),

          [`members.${uid}`]: {
            displayName: finalDisplayName,
            email: normalizedEmail,
            joinedAt: Date.now(),
          },

          lastInviteId: inviteId,
        });

        /* -----------------------------------------------------------------
           Mark invite accepted
        ----------------------------------------------------------------- */

        tx.update(inviteRef, {
          status: "accepted",

          acceptedAt: Date.now(),

          acceptedByUid: uid,
        });

        /* -----------------------------------------------------------------
           Link user account to Space
        ----------------------------------------------------------------- */

        tx.set(
          userRef,
          {
            uid,

            email: normalizedEmail,

            displayName: finalDisplayName,

            spaceId: invite.spaceId,

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          }
        );
      }
    );

    return true;
  } catch (error) {
    console.error(
      "[Firebase] Failed to accept invite:",
      error
    );

    throw error;
  }
}

/* =========================================================================
   CANCEL INVITE
========================================================================= */

export async function cancelInvite(
  inviteId
) {
  if (!inviteId) {
    throw new Error(
      "Invitation ID is missing."
    );
  }

  try {
    await deleteDoc(
      doc(
        db,
        "invites",
        inviteId
      )
    );
  } catch (error) {
    console.error(
      "[Firebase] Failed to cancel invite:",
      error
    );

    throw error;
  }
}

/* =========================================================================
   LIST MY SENT INVITES
========================================================================= */

export function listenToMySentInvites(
  spaceId,
  byUid,
  callback
) {
  if (!spaceId || !byUid) {
    callback([]);
    return () => {};
  }

  const invitesQuery = query(
    collection(db, "invites"),

    where(
      "spaceId",
      "==",
      spaceId
    ),

    where(
      "invitedByUid",
      "==",
      byUid
    ),

    where(
      "status",
      "==",
      "pending"
    )
  );

  return onSnapshot(
    invitesQuery,

    (snap) => {
      callback(
        snap.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })
        )
      );
    },

    (error) => {
      console.error(
        "[Firebase listener] sent invites:",
        error
      );

      callback([]);
    }
  );
}

/* =========================================================================
   GET OTHER SPACE MEMBERS
========================================================================= */

export function otherMembers(
  space,
  myUid
) {
  if (
    !space ||
    !space.members
  ) {
    return [];
  }

  return Object.entries(
    space.members
  )
    .filter(
      ([uid]) => uid !== myUid
    )
    .map(
      ([uid, member]) => ({
        uid,
        ...member,
      })
    );
}