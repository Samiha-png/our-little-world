import { useEffect, useState } from "react";
import { watchAuthState, getUserDoc, listenUserDoc } from "../services/auth";

/** Live Firebase auth state + the user's /users/{uid} profile doc. */
export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let stopProfile = null;
    const unsub = watchAuthState(async (fbUser) => {
      if (stopProfile) { stopProfile(); stopProfile = null; }
      setUser(fbUser || null);
      if (fbUser) {
        const initial = await getUserDoc(fbUser.uid);
        setProfile(initial);
        stopProfile = listenUserDoc(fbUser.uid, setProfile);
      } else {
        setProfile(null);
      }
    });
    return () => { if (stopProfile) stopProfile(); unsub(); };
  }, []);

  return { user, profile, loading: user === undefined };
}
