# Our Little World — fixes applied

## Fixed
- Today tasks can be edited and deleted.
- Today task completion can be checked and unchecked through Firestore.
- Task writes have loading/error handling.
- Task listener no longer depends on a Firestore orderBy index and tolerates older tasks without `createdAt`.
- Desktop/laptop floating navigation no longer relies on a CSS transform that conflicts with Framer Motion.
- Mobile navigation is responsive and page content gets bottom space for the fixed nav.
- `/join?invite=...` now loads and validates the invite for the signed-in email.
- Invite acceptance switches the user's active `spaceId` and the app detects that change in realtime.
- Invite creation/acceptance security rules keep Spaces limited to two members.
- Invite queries no longer require the extra composite status index.
- Existing UI/theme/fonts/backend architecture were preserved.

## Firebase rules
The updated `firestore.rules` must be deployed to the Firebase project after deploying the frontend.

## Local setup
1. Delete any copied `node_modules` from the old project.
2. Run `npm install`.
3. Run `npm run dev`.
4. For production, run `npm run build` and deploy the generated app with your normal Vercel workflow.
<<<<<<< HEAD


## UI stabilization pass — 2026-09-16
- Scoped Today page `.editorial-heading` and `.eyebrow` styles so they no longer override every other page.
- Renamed Today support modal classes so they no longer collide with Memories `.memory-modal` styles.
- Renamed Today support button class so it no longer collides with Diary `.diary-save`.
- Removed Today page `overflow: hidden` that could clip fixed modals.
- Restored sufficient mobile bottom padding so the fixed mobile navigation does not cover Today content.
=======
>>>>>>> 4d6d17f0bcfc445e3ab177b42bfaa8437e09c75c
