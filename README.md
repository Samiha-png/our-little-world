# Our Little World — React/Vite rewrite

This is your existing "Online Diary" project, rebuilt on React + Vite with the
new "Our Little World" design system. **No mock data, no new Firebase
project** — it talks to your existing `our-little-space-6f128` project using
the exact same collections your old `js/data.js` used.

## Run it

```bash
npm install
npm run dev
```

## Before you deploy: update Firestore rules

I added a few new collections for new features (private diary, daily
question, support requests). The updated `firestore.rules` in this folder
includes your original rules **plus** the additions — diff it against your
current rules if you want to review, then deploy:

```bash
firebase deploy --only firestore:rules
```

Nothing existing was removed or weakened — only new `match` blocks added for:
- `users/{uid}/diaryEntries/{date}` — owner-only, same pattern as your existing private collections
- `spaces/{id}/dailyQuestions/{date}` — shared, same pattern as dailyConnections
- `spaces/{id}/supportRequests/{id}` — shared, same pattern as pings

## What's built and wired to real Firebase

| Feature | Status |
|---|---|
| Auth (login/signup/logout) | ✅ ported from `js/auth.js` |
| Space create/join/invite | ✅ ported from `js/space.js` |
| Landing ("Our Little World" entrance) | ✅ new |
| Home ("Today, we…" editorial page) | ✅ new |
| Today (tasks, mood zone, "I'm Here" support) | ✅ new, real-time |
| Between Us (daily connection) | ✅ new, real-time, envelope animation, reactions |
| Dear Today… (private diary) | ✅ new collection, owner-only |
| Our Memories (polaroid grid + Our Story timeline) | ✅ reuses existing `memories` + Storage |
| Our Little World (shared goals, daily question, garden) | ✅ goals reused; daily question new; garden is a visual proxy off real activity |

## What's not built yet (honest list)

- **Samiha's Corner / His Corner** personal spaces — the period tracker and
  workout tracker data layer (`services/data.js`) is fully ported and ready
  (`listenPeriodCycles`, `listenWorkouts`, etc.), but the personal-space UI
  pages haven't been built.
- **Night Check-in** — `saveNightCheckin`/`listenNightCheckin` exist in the
  data layer; no dedicated page yet (currently folds into Today).
- **Weekly Recap** and **Surprise Box** — not started.
- **Routines / Habits** UI — data layer ported, no page yet.
- Mobile-specific polish pass and two-account testing checklist from the
  original brief.

## Architecture

```
src/
  services/   firebase.js, auth.js, space.js, data.js  — all real Firebase
  hooks/      useAuth, useSpace
  components/ AnimatedBackground, GlassCard, FloatingNav, PageTransition
  pages/      Auth, SpaceGate, Landing, Home, Today, Connection, Diary,
              Memories, OurWorld, ComingSoon
```

Continuing: the pattern for each new page is the same — a `services/data.js`
function (or new one following the existing style), a `listen*` hook call in
`useEffect`, and a `GlassCard`-based layout. The personal-space pages are the
natural next step and should be quick to build following that pattern.


## Space invites
Settings can create a Firebase invite and generate a `/join?invite=...` link. The link can be copied or opened through WhatsApp. The recipient must sign in with the same email address that was invited before accepting the invitation.
