import { useEffect, useState } from "react";
import { listenUserDoc } from "../services/auth";
import { listenToSpace, otherMembers } from "../services/space";

/**
 * Resolves the authenticated user's current Space from their live user
 * profile. This is intentionally realtime so accepting an invite immediately
 * updates the app's active space without requiring a refresh.
 */
export function useSpace(uid) {
  const [spaceId, setSpaceId] = useState(undefined); // undefined = loading, null = none
  const [space, setSpace] = useState(null);

  useEffect(() => {
    if (!uid) {
      setSpaceId(null);
      setSpace(null);
      return undefined;
    }

    let unsubscribeSpace = null;

    const unsubscribeUser = listenUserDoc(uid, (profile) => {
      const nextSpaceId = profile?.spaceId || null;
      setSpaceId(nextSpaceId);

      if (unsubscribeSpace) {
        unsubscribeSpace();
        unsubscribeSpace = null;
      }

      if (!nextSpaceId) {
        setSpace(null);
        return;
      }

      unsubscribeSpace = listenToSpace(nextSpaceId, (nextSpace) => {
        setSpace(nextSpace);
      });
    });

    return () => {
      if (unsubscribeSpace) unsubscribeSpace();
      unsubscribeUser?.();
    };
  }, [uid]);

  const partner = space ? otherMembers(space, uid)[0] || null : null;

  return {
    spaceId,
    space,
    partner,
    loading: spaceId === undefined
  };
}
