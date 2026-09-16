/* =========================================================================
   DATA LAYER — Firebase is the source of truth for every collection here.
   Pattern everywhere: user action -> Firestore write -> onSnapshot listener
   -> UI re-render. Nothing in this file reads or writes localStorage.
   ========================================================================= */
import { db, storage } from "./firebase";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc, getDocs,
  onSnapshot, query, where, orderBy, limit, documentId,
  serverTimestamp, deleteField, increment, runTransaction
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "firebase/storage";

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const sp = (spaceId, ...path) => collection(db, "spaces", spaceId, ...path);
const spDoc = (spaceId, colName, id) => doc(db, "spaces", spaceId, colName, id);

function listenSafely(target, cb, label) {
  return onSnapshot(target,
    (snap) => cb(snap),
    (error) => {
      console.error(`[Firebase listener] ${label || "unknown"}`, error);
      window.dispatchEvent(new CustomEvent("firebase-listener-error", { detail: { label, error } }));
    }
  );
}

/* ---------------------------- TASKS (templates) ------------------------- */
export function listenTasks(spaceId, cb) {
  return listenSafely(sp(spaceId, "tasks"), (snap) => {
    const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    tasks.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds * 1000 ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds * 1000 ?? 0;
      return aTime - bTime;
    });
    cb(tasks);
  }, "tasks");
}
export async function addTask(spaceId, uid, { title, category, visibility = "private" }) {
  return addDoc(sp(spaceId, "tasks"), {
    title, category, visibility, ownerUid: uid,
    repeat: true, active: true, createdAt: serverTimestamp()
  });
}
export async function renameTask(spaceId, taskId, title) {
  const cleanTitle = (title || "").trim();
  if (!cleanTitle) throw new Error("Task title cannot be empty.");
  return updateDoc(spDoc(spaceId, "tasks", taskId), {
    title: cleanTitle,
    updatedAt: serverTimestamp()
  });
}
export async function deleteTask(spaceId, taskId) {
  return deleteDoc(spDoc(spaceId, "tasks", taskId));
}

/* ---------------------------- ROUTINES (templates) ----------------------- */
export function listenRoutines(spaceId, cb) {
  return listenSafely(query(sp(spaceId, "routines"), orderBy("createdAt", "asc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function addRoutine(spaceId, uid, { name, icon, items }) {
  return addDoc(sp(spaceId, "routines"), {
    name, icon, items, ownerUid: uid, createdAt: serverTimestamp()
  });
}
export async function updateRoutine(spaceId, routineId, patch) {
  return updateDoc(spDoc(spaceId, "routines", routineId), patch);
}
export async function deleteRoutine(spaceId, routineId) {
  return deleteDoc(spDoc(spaceId, "routines", routineId));
}

/* ------------------------------- HABITS ---------------------------------- */
export function listenHabits(spaceId, cb) {
  return listenSafely(query(sp(spaceId, "habits"), orderBy("createdAt", "asc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function addHabit(spaceId, uid, { name, icon }) {
  return addDoc(sp(spaceId, "habits"), {
    name, icon, ownerUid: uid, completions: {}, bestStreak: 0, createdAt: serverTimestamp()
  });
}
export async function deleteHabit(spaceId, habitId) {
  return deleteDoc(spDoc(spaceId, "habits", habitId));
}
export async function setHabitCompletion(spaceId, habitId, dateStr, done, bestStreak) {
  const patch = { [`completions.${dateStr}`]: done ? true : deleteField() };
  if (typeof bestStreak === "number") patch.bestStreak = bestStreak;
  return updateDoc(spDoc(spaceId, "habits", habitId), patch);
}

/* -------------------------------- GOALS ----------------------------------- */
export function listenGoals(spaceId, cb) {
  return listenSafely(query(sp(spaceId, "goals"), orderBy("createdAt", "desc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function addGoal(spaceId, uid, displayName, { title, description, targetDate, isWeeklyChecklist }) {
  return addDoc(sp(spaceId, "goals"), {
    title, description: description || "", progress: 0, targetDate: targetDate || null,
    isWeeklyChecklist: !!isWeeklyChecklist,
    createdByUid: uid, createdByName: displayName, createdAt: serverTimestamp()
  });
}
export async function updateGoalProgress(spaceId, goalId, progress) {
  return updateDoc(spDoc(spaceId, "goals", goalId), { progress });
}
export async function deleteGoal(spaceId, goalId) {
  return deleteDoc(spDoc(spaceId, "goals", goalId));
}

/* ------------------------------ MEMORIES ----------------------------------
   Images go to Firebase Storage at spaces/{spaceId}/memories/{memoryId}/{file}
   ---------------------------------------------------------------------- */
export function listenMemories(spaceId, cb) {
  return listenSafely(query(sp(spaceId, "memories"), orderBy("createdAt", "desc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function addMemory(spaceId, uid, displayName, { title, date, text, caption, file }) {
  const memRef = doc(sp(spaceId, "memories"));
  let imageUrl = null, storagePath = null;
  if (file) {
    storagePath = `spaces/${spaceId}/memories/${memRef.id}/${file.name}`;
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, file);
    imageUrl = await getDownloadURL(fileRef);
  }
  await setDoc(memRef, {
    title: title || "Untitled memory",
    date: date || todayKey(),
    text: text || "",
    caption: caption || "",
    imageUrl, storagePath,
    authorUid: uid, authorName: displayName,
    reactions: {},
    createdAt: serverTimestamp()
  });
  return memRef.id;
}
export async function deleteMemory(spaceId, memory) {
  if (memory.storagePath) {
    try { await deleteObject(ref(storage, memory.storagePath)); } catch (e) { /* already gone */ }
  }
  return deleteDoc(spDoc(spaceId, "memories", memory.id));
}
export async function setMemoryReaction(spaceId, memoryId, uid, emoji) {
  // Tapping the same emoji again removes it (toggle).
  const memSnap = await getDoc(spDoc(spaceId, "memories", memoryId));
  const current = memSnap.exists() ? (memSnap.data().reactions || {}) : {};
  const patch = current[uid] === emoji
    ? { [`reactions.${uid}`]: deleteField() }
    : { [`reactions.${uid}`]: emoji };
  return updateDoc(spDoc(spaceId, "memories", memoryId), patch);
}

/* --------------------------- DAILY CONNECTION ------------------------------
   spaces/{spaceId}/dailyConnections/{date}/entries/{uid}
   Each member writes only their own doc, so entries never overwrite
   each other. Both are readable by all space members.
   ---------------------------------------------------------------------- */
export function listenDailyConnection(spaceId, dateStr, cb) {
  return listenSafely(sp(spaceId, "dailyConnections", dateStr, "entries"), (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  });
}
export async function setMyDailyConnection(spaceId, dateStr, uid, displayName, { type, text }) {
  const entryRef = doc(db, "spaces", spaceId, "dailyConnections", dateStr, "entries", uid);
  return setDoc(entryRef, {
    type, text, uid, displayName, updatedAt: serverTimestamp()
  }, { merge: true });
}
/* Recent feed across the last N days, newest first (used on Home). */
export function listenRecentDailyConnections(spaceId, days, cb) {
  // dailyConnections is a collection of date-docs; list them, then fan out.
  // Simpler + realtime-safe: keep a lightweight index doc per date is
  // overkill here, so Home listens to "today" only and Our Corner/Week
  // pull historical days on demand via getDayEntries().
  return listenDailyConnection(spaceId, todayKey(), cb);
}
export async function getDayConnectionEntries(spaceId, dateStr) {
  const snap = await getDocs(sp(spaceId, "dailyConnections", dateStr, "entries"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function reactToDailyConnection(spaceId, dateStr, entryUid, reactorUid, emoji) {
  const entryRef = doc(db, "spaces", spaceId, "dailyConnections", dateStr, "entries", entryUid);
  const snap = await getDoc(entryRef);
  const current = snap.exists() ? (snap.data().reactions || {}) : {};
  const patch = current[reactorUid] === emoji
    ? { [`reactions.${reactorUid}`]: deleteField() }
    : { [`reactions.${reactorUid}`]: emoji };
  return updateDoc(entryRef, patch);
}

/* -------------------------------- NOTES ------------------------------------ */
export function listenNotes(spaceId, cb) {
  return listenSafely(query(sp(spaceId, "notes"), orderBy("createdAt", "desc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function addNote(spaceId, uid, displayName, text) {
  return addDoc(sp(spaceId, "notes"), {
    text, authorUid: uid, authorName: displayName, createdAt: serverTimestamp()
  });
}
export async function deleteNote(spaceId, noteId) {
  return deleteDoc(spDoc(spaceId, "notes", noteId));
}

/* ------------------------------ DAY PROGRESS --------------------------------
   spaces/{spaceId}/days/{date}/progress/{uid} — ONE DOCUMENT PER USER PER DAY.
   This (not a nested map) is what lets Firestore rules cleanly enforce
   "you may only ever write your own progress doc" while every Space member
   can still read all of them. This doc IS the daily snapshot: nothing
   destructive ever happens to a past date's doc, so history is naturally
   preserved and "today" always starts clean because it's simply a new doc.
   ---------------------------------------------------------------------- */
function progressDocRef(spaceId, dateStr, uid) {
  return doc(db, "spaces", spaceId, "days", dateStr, "progress", uid);
}
export function listenDay(spaceId, dateStr, cb) {
  return listenSafely(collection(db, "spaces", spaceId, "days", dateStr, "progress"), (snap) => {
    const users = {};
    snap.docs.forEach((d) => { users[d.id] = d.data(); });
    cb({ id: dateStr, users });
  });
}
export async function getDay(spaceId, dateStr) {
  const snap = await getDocs(collection(db, "spaces", spaceId, "days", dateStr, "progress"));
  const users = {};
  snap.docs.forEach((d) => { users[d.id] = d.data(); });
  return { id: dateStr, users };
}
async function patchDayUser(spaceId, dateStr, uid, patch) {
  const ref = progressDocRef(spaceId, dateStr, uid);
  const flat = { spaceId, date: dateStr, uid, updatedAt: serverTimestamp() };
  Object.assign(flat, patch);
  return setDoc(ref, flat, { merge: true });
}
export async function setTaskCompletion(spaceId, dateStr, uid, taskId, done) {
  // Use a transaction here. Multiple checklist clicks can happen before
  // onSnapshot has repainted the UI; a transaction merges each completion
  // with the latest Firestore state instead of allowing a stale write to
  // overwrite another task's check.
  const ref = progressDocRef(spaceId, dateStr, uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data() : {};
    const completions = { ...(current.taskCompletions || {}) };
    if (done) completions[taskId] = true;
    else delete completions[taskId];
    tx.set(ref, {
      spaceId, date: dateStr, uid,
      taskCompletions: completions,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
}
export async function setRoutineItemCompletion(spaceId, dateStr, uid, routineId, itemIdx, done) {
  // Same atomic merge for routine items so checking several items quickly
  // never loses an earlier check.
  const ref = progressDocRef(spaceId, dateStr, uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data() : {};
    const routineCompletions = JSON.parse(JSON.stringify(current.routineCompletions || {}));
    if (!routineCompletions[routineId]) routineCompletions[routineId] = {};
    if (done) routineCompletions[routineId][itemIdx] = true;
    else {
      delete routineCompletions[routineId][itemIdx];
      if (Object.keys(routineCompletions[routineId]).length === 0) delete routineCompletions[routineId];
    }
    tx.set(ref, {
      spaceId, date: dateStr, uid,
      routineCompletions,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
}
export async function saveTodayFocus(spaceId, dateStr, uid, text) {
  return patchDayUser(spaceId, dateStr, uid, { focus: text });
}
export async function saveMood(spaceId, dateStr, uid, emoji) {
  // Deprecated: superseded by the private Mood Zone (users/{uid}/moods/{date}).
  // Kept as a no-op export only so nothing throws if an old reference remains.
  return Promise.resolve();
}
export async function saveNightCheckin(spaceId, dateStr, uid, data) {
  return patchDayUser(spaceId, dateStr, uid, { nightCheckin: data });
}
export async function finalizeDay(spaceId, dateStr, uid) {
  return patchDayUser(spaceId, dateStr, uid, { finalized: true, finalizedAt: Date.now() });
}

/* Compute real aggregate percentages for a day and write them onto that
   day's progress doc, guarded against duplicate finalization. Called once,
   for YESTERDAY, when a date rollover is detected — never destroys the raw
   completion maps already on the doc, only adds summary fields to them. */
export async function computeAndFinalizeDaySnapshot(spaceId, dateStr, uid, { tasks, routines, habits, goals, hadDailyConnection }) {
  const ref = progressDocRef(spaceId, dateStr, uid);
  const existingSnap = await getDoc(ref);
  const existing = existingSnap.exists() ? existingSnap.data() : {};
  if (existing.isFinalized) return { alreadyFinalized: true };

  const pct = (c, t) => (t > 0 ? Math.round((c / t) * 100) : 0);

  const myTasks = tasks.filter((t) => t.ownerUid === uid);
  const tasksTotal = myTasks.length;
  const tasksCompleted = myTasks.filter((t) => (existing.taskCompletions || {})[t.id]).length;

  const myRoutines = routines.filter((r) => r.ownerUid === uid);
  let routinesTotal = 0, routinesCompleted = 0;
  myRoutines.forEach((r) => {
    const items = r.items || [];
    routinesTotal += items.length;
    routinesCompleted += items.filter((_, idx) => ((existing.routineCompletions || {})[r.id] || {})[idx]).length;
  });

  const myHabits = habits.filter((h) => h.ownerUid === uid);
  const habitsTotal = myHabits.length;
  const habitsCompleted = myHabits.filter((h) => (h.completions || {})[dateStr]).length;

  const myGoals = goals.filter((g) => g.createdByUid === uid);
  const goalsTotal = myGoals.length;
  const goalsCompleted = myGoals.filter((g) => g.progress >= 100).length;

  const tasksPercentage = pct(tasksCompleted, tasksTotal);
  const routinesPercentage = pct(routinesCompleted, routinesTotal);
  const habitsPercentage = pct(habitsCompleted, habitsTotal);
  const goalsPercentage = pct(goalsCompleted, goalsTotal);

  const parts = [
    tasksTotal > 0 ? tasksPercentage : null,
    routinesTotal > 0 ? routinesPercentage : null,
    habitsTotal > 0 ? habitsPercentage : null,
    goalsTotal > 0 ? goalsPercentage : null
  ].filter((v) => v !== null);
  const overallPercentage = parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0;

  const snapshot = {
    tasksTotal, tasksCompleted, tasksPercentage,
    routinesTotal, routinesCompleted, routinesPercentage,
    habitsTotal, habitsCompleted, habitsPercentage,
    goalsTotal, goalsCompleted, goalsPercentage,
    dailyConnection: !!hadDailyConnection,
    overallPercentage,
    isFinalized: true,
    finalizedAt: Date.now(),
    updatedAt: serverTimestamp()
  };
  await patchDayUser(spaceId, dateStr, uid, snapshot);
  return { alreadyFinalized: false, snapshot };
}

/* Tiny-wins counter lives on the user's own profile doc (owner-only write). */
export async function bumpTotalWins(uid, delta) {
  // The user document can be missing for older accounts or after a partial
  // signup. setDoc(..., {merge:true}) makes progress/check actions resilient.
  return setDoc(doc(db, "users", uid), { totalWins: increment(delta), uid }, { merge: true });
}

/* Range of progress docs for MY uid across a date range (Weekly Progress /
   mood history), via a collectionGroup query. Firestore will offer a
   one-click index-creation link the first time this runs if needed. */
export async function getDayRange(spaceId, startDateStr, endDateStr, uid) {
  const byDate = {};
  const startParts = startDateStr.split('-');
  const endParts = endDateStr.split('-');
  const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
  const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);
  
  const promises = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dStr = todayKey(d);
    const progressRef = doc(db, "spaces", spaceId, "days", dStr, "progress", uid);
    promises.push(getDoc(progressRef).then((snap) => {
      if (snap.exists()) {
        byDate[dStr] = { id: dStr, users: { [uid]: snap.data() } };
      }
    }));
  }
  await Promise.all(promises);
  return byDate;
}

/* ------------------------------ MOOD ZONE (PRIVATE) --------------------------
   users/{uid}/moods/{date} — private by default. Sharing writes a SEPARATE,
   minimal record under the Space so a private note can never leak.
   ---------------------------------------------------------------------- */
export function listenMood(uid, dateStr, cb) {
  return listenSafely(doc(db, "users", uid, "moods", dateStr), (snap) => cb(snap.exists() ? snap.data() : null));
}
export async function savePrivateMood(uid, dateStr, { mood, intensity, reason, note, visibility }) {
  const ref = doc(db, "users", uid, "moods", dateStr);
  const existing = await getDoc(ref);
  const payload = {
    mood, intensity: intensity || null, reason: reason || null, note: note || "",
    visibility: visibility || "private", date: dateStr, updatedAt: serverTimestamp()
  };
  if (!existing.exists()) payload.createdAt = serverTimestamp();
  await setDoc(ref, payload, { merge: true });
  return payload;
}
export async function getMoodRange(uid, startDateStr, endDateStr) {
  const q = query(
    collection(db, "users", uid, "moods"),
    where("date", ">=", startDateStr),
    where("date", "<=", endDateStr)
  );
  const snap = await getDocs(q);
  const out = {};
  snap.docs.forEach((d) => { out[d.id] = d.data(); });
  return out;
}

/* Shared mood status — only ever the emoji + optional reason, written to a
   SEPARATE Space-visible record. The private note above is never copied here. */
export async function setSharedMoodStatus(spaceId, dateStr, uid, displayName, { mood, intensity, reason }) {
  const ref = doc(db, "spaces", spaceId, "sharedMoods", dateStr, "entries", uid);
  return setDoc(ref, { mood, intensity: intensity || null, reason: reason || null, uid, displayName, updatedAt: serverTimestamp() }, { merge: true });
}
export async function clearSharedMoodStatus(spaceId, dateStr, uid) {
  return deleteDoc(doc(db, "spaces", spaceId, "sharedMoods", dateStr, "entries", uid));
}
export function listenSharedMoodsToday(spaceId, dateStr, cb) {
  return listenSafely(collection(db, "spaces", spaceId, "sharedMoods", dateStr, "entries"), (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  });
}

/* --------------------------- PERIOD TRACKER (PRIVATE) -------------------------
   users/{uid}/periodCycles/{cycleId} — owner-only, never exposed to a Space.
   ---------------------------------------------------------------------- */
export function listenPeriodCycles(uid, cb) {
  return listenSafely(query(collection(db, "users", uid, "periodCycles"), orderBy("startDate", "desc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function addPeriodCycle(uid, { startDate, duration, notes, symptoms, flow }) {
  return addDoc(collection(db, "users", uid, "periodCycles"), {
    startDate, duration: duration || 5, notes: notes || "", symptoms: symptoms || [], flow: flow || "medium",
    createdAt: serverTimestamp()
  });
}
export async function updatePeriodCycle(uid, cycleId, patch) {
  return updateDoc(doc(db, "users", uid, "periodCycles", cycleId), patch);
}
export async function deletePeriodCycle(uid, cycleId) {
  return deleteDoc(doc(db, "users", uid, "periodCycles", cycleId));
}

/* --------------------------- PRIVATE DIARY -------------------------------
   users/{uid}/diaryEntries/{dateStr} — owner-only, never exposed to a Space.
   One entry per day, keyed by date so re-opening "today" edits in place.
   ---------------------------------------------------------------------- */
export function listenDiaryEntries(uid, cb) {
  return listenSafely(query(collection(db, "users", uid, "diaryEntries"), orderBy("date", "desc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function saveDiaryEntry(uid, dateStr, { mood, whatHappened, thinking, remember }) {
  const ref = doc(db, "users", uid, "diaryEntries", dateStr);
  const existing = await getDoc(ref);
  const payload = {
    date: dateStr, mood: mood || null,
    whatHappened: whatHappened || "", thinking: thinking || "", remember: remember || "",
    updatedAt: serverTimestamp()
  };
  if (!existing.exists()) payload.createdAt = serverTimestamp();
  await setDoc(ref, payload, { merge: true });
  return payload;
}
export async function deleteDiaryEntry(uid, dateStr) {
  return deleteDoc(doc(db, "users", uid, "diaryEntries", dateStr));
}

/* --------------------------- FITNESS TRACKER (PRIVATE) ------------------------
   users/{uid}/workouts/{workoutId} — the alternative private tracker for
   whichever account doesn't want Period Tracker. Same owner-only rule shape.
   ---------------------------------------------------------------------- */
export function listenWorkouts(uid, cb) {
  return listenSafely(query(collection(db, "users", uid, "workouts"), orderBy("date", "desc")), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function addWorkout(uid, { date, exercise, type, duration, notes }) {
  return addDoc(collection(db, "users", uid, "workouts"), {
    date: date || todayKey(), exercise, type: type || "other", duration: duration || null,
    notes: notes || "", createdAt: serverTimestamp()
  });
}
export async function deleteWorkout(uid, workoutId) {
  return deleteDoc(doc(db, "users", uid, "workouts", workoutId));
}

/* Personal preference: which private tracker slot this account shows.
   Lives on the user's own profile doc — self-write only, never a Space
   or identity-based rule. */
export async function setTrackerMode(uid, mode) {
  return setDoc(doc(db, "users", uid), { trackerMode: mode, updatedAt: serverTimestamp() }, { merge: true });
}

/* ---------------------------- EMOTION SUPPORT ("I'm Here") ------------------
   spaces/{spaceId}/supportRequests/{id} — shared, real-time. Either member
   can see and respond to a request the other one sends.
   ---------------------------------------------------------------------- */
export function listenSupportRequests(spaceId, cb) {
  return listenSafely(query(sp(spaceId, "supportRequests"), orderBy("createdAt", "desc"), limit(10)), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function sendSupportRequest(spaceId, uid, displayName, { feeling, need }) {
  return addDoc(sp(spaceId, "supportRequests"), {
    uid, displayName, feeling, need, status: "open", response: null, createdAt: serverTimestamp()
  });
}
export async function respondToSupportRequest(spaceId, requestId, response) {
  return updateDoc(spDoc(spaceId, "supportRequests", requestId), { response, status: "responded", respondedAt: serverTimestamp() });
}

/* ---------------------------- THINKING OF YOU -------------------------------- */
export function listenPings(spaceId, cb) {
  return listenSafely(query(sp(spaceId, "pings"), orderBy("createdAt", "desc"), limit(5)), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
export async function sendPing(spaceId, uid, displayName) {
  return addDoc(sp(spaceId, "pings"), { uid, displayName, createdAt: serverTimestamp() });
}

/* --------------------------- DAILY QUESTION ("Question for Us") -------------
   spaces/{spaceId}/dailyQuestions/{date} — one shared doc per day, holding
   the question plus each member's answer keyed by uid. Answers are only
   ever read back once both members have answered (enforced in the UI).
   ---------------------------------------------------------------------- */
const QUESTION_BANK = [
  "What made you smile today?",
  "What is one thing you appreciate about me?",
  "What memory would you relive?",
  "What should we do together soon?",
  "What's something small I did that meant a lot?",
  "What are you looking forward to this week?"
];
export function pickDailyQuestion(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  return QUESTION_BANK[hash % QUESTION_BANK.length];
}
export function listenDailyQuestion(spaceId, dateStr, cb) {
  return listenSafely(doc(db, "spaces", spaceId, "dailyQuestions", dateStr), (snap) => cb(snap.exists() ? snap.data() : null));
}
export async function answerDailyQuestion(spaceId, dateStr, uid, question, answer) {
  const ref = doc(db, "spaces", spaceId, "dailyQuestions", dateStr);
  return setDoc(ref, { question, [`answers.${uid}`]: answer, updatedAt: serverTimestamp() }, { merge: true });
}

/* --------------------------- NIGHT CHECK-IN --------------------------------
   Reuses the existing days/{date}/progress/{uid}.nightCheckin field via
   saveNightCheckin() above, plus a listener for reading it back.
   ---------------------------------------------------------------------- */
export function listenNightCheckin(spaceId, dateStr, uid, cb) {
  return listenSafely(doc(db, "spaces", spaceId, "days", dateStr, "progress", uid), (snap) => {
    cb(snap.exists() ? snap.data().nightCheckin || null : null);
  });
}

/* ------------------------------- MIGRATION -----------------------------------
   One-time, explicit import of the OLD single-document architecture
   (coupleData/shared, tasksByIdentity.me/.him, etc.) into this Space's
   proper collections. Only runs when the space owner asks for it, and
   only once (space.legacyMigrated flips to true afterward).
   ---------------------------------------------------------------------- */
export async function migrateLegacyCoupleData(spaceId, meUid, meIdentity, meName, partnerUid, partnerName) {
  const legacySnap = await getDoc(doc(db, "coupleData", "shared"));
  if (!legacySnap.exists()) return { migrated: false, reason: "No legacy data found." };
  const legacy = legacySnap.data();
  const otherIdentity = meIdentity === "me" ? "him" : "me";

  const owners = [
    { uid: meUid, name: meName, identity: meIdentity },
    { uid: partnerUid, name: partnerName, identity: otherIdentity }
  ];

  // Personal, per-identity data -> tasks/routines/habits owned by the right uid.
  for (const owner of owners) {
    if (!owner.uid) continue;
    const legacyTasks = (legacy.tasksByIdentity || {})[owner.identity] || [];
    for (const t of legacyTasks) {
      await addDoc(sp(spaceId, "tasks"), {
        title: t.title, category: t.category, visibility: t.visibility || "private",
        ownerUid: owner.uid, repeat: true, active: true, createdAt: serverTimestamp()
      });
    }
    const legacyRoutines = (legacy.userRoutinesByIdentity || {})[owner.identity] || [];
    for (const r of legacyRoutines) {
      await addDoc(sp(spaceId, "routines"), {
        name: r.name, icon: r.icon,
        items: (r.items || []).map((i) => ({ text: i.text })),
        ownerUid: owner.uid, createdAt: serverTimestamp()
      });
    }
    const legacyHabits = (legacy.userHabitsByIdentity || {})[owner.identity] || [];
    for (const h of legacyHabits) {
      await addDoc(sp(spaceId, "habits"), {
        name: h.name, icon: h.icon, ownerUid: owner.uid,
        completions: h.completions || {}, bestStreak: h.bestStreak || 0, createdAt: serverTimestamp()
      });
    }
  }

  // Shared data -> straight copies.
  for (const m of legacy.userMemories || []) {
    await addDoc(sp(spaceId, "memories"), {
      title: m.title, date: m.date, text: m.text, caption: m.caption,
      imageUrl: m.image || null, storagePath: null,
      authorUid: meUid, authorName: meName, reactions: {},
      createdAt: serverTimestamp()
    });
  }
  for (const n of legacy.sharedNotes || []) {
    await addDoc(sp(spaceId, "notes"), {
      text: n.text, authorUid: meUid, authorName: meName, createdAt: serverTimestamp()
    });
  }
  for (const g of legacy.sharedGoals || []) {
    await addDoc(sp(spaceId, "goals"), {
      title: g.title, description: g.description || "", progress: g.progress || 0,
      targetDate: g.targetDate || null, createdByUid: meUid, createdByName: meName,
      createdAt: serverTimestamp()
    });
  }
  for (const dc of legacy.dailyConnections || []) {
    const dateStr = dc.timestamp ? todayKey(new Date(dc.timestamp)) : todayKey();
    const entryRef = doc(db, "spaces", spaceId, "dailyConnections", dateStr, "entries", meUid);
    await setDoc(entryRef, {
      type: dc.type, text: dc.text, uid: meUid, displayName: meName,
      updatedAt: dc.timestamp || Date.now()
    }, { merge: true });
  }

  await updateDoc(doc(db, "spaces", spaceId), { legacyMigrated: true });
  return { migrated: true };
}
