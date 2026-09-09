import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import {
  addPeriodCycle, deletePeriodCycle, listenPeriodCycles,
  addWorkout, deleteWorkout, listenWorkouts,
  setTrackerMode, todayKey
} from "../services/data";
import "./MySpace.css";

const FLOW = ["light", "medium", "heavy"];
const SYMPTOMS = ["cramps", "headache", "fatigue", "bloating", "mood", "back pain"];
const WORKOUT_TYPES = ["strength", "cardio", "gym", "legs", "upper body", "full body", "other"];

export default function MySpace({ ctx }) {
  const { user, profile } = ctx;
  const [mode, setMode] = useState(profile?.trackerMode || "period");
  const [cycles, setCycles] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [periodForm, setPeriodForm] = useState({ startDate: todayKey(), duration: 5, flow: "medium", symptoms: [], notes: "" });
  const [workoutForm, setWorkoutForm] = useState({ date: todayKey(), exercise: "", type: "gym", duration: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = mode === "period"
      ? listenPeriodCycles(user.uid, setCycles)
      : listenWorkouts(user.uid, setWorkouts);
    return unsub;
  }, [mode, user.uid]);

  async function switchMode(next) {
    setMode(next);
    try { await setTrackerMode(user.uid, next); } catch (e) { setError(e.message || "Could not save tracker preference."); }
  }

  async function submitPeriod(e) {
    e.preventDefault();
    if (!periodForm.startDate) return;
    setBusy(true); setError("");
    try {
      await addPeriodCycle(user.uid, periodForm);
      setPeriodForm({ startDate: todayKey(), duration: 5, flow: "medium", symptoms: [], notes: "" });
    } catch (e) { setError(e.message || "Could not save your cycle."); }
    finally { setBusy(false); }
  }

  async function submitWorkout(e) {
    e.preventDefault();
    if (!workoutForm.exercise.trim()) return;
    setBusy(true); setError("");
    try {
      await addWorkout(user.uid, workoutForm);
      setWorkoutForm({ date: todayKey(), exercise: "", type: "gym", duration: "", notes: "" });
    } catch (e) { setError(e.message || "Could not save your workout."); }
    finally { setBusy(false); }
  }

  const averageCycle = useMemo(() => {
    if (cycles.length < 2) return null;
    const dates = cycles.map(c => new Date(`${c.startDate}T00:00:00`).getTime()).filter(Number.isFinite);
    dates.sort((a,b) => b-a);
    const gaps = [];
    for (let i = 0; i < dates.length - 1; i++) gaps.push(Math.round((dates[i] - dates[i+1]) / 86400000));
    return gaps.length ? Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length) : null;
  }, [cycles]);

  const nextPeriod = useMemo(() => {
    if (!cycles[0]?.startDate || !averageCycle) return null;
    const d = new Date(`${cycles[0].startDate}T00:00:00`);
    d.setDate(d.getDate() + averageCycle);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }, [cycles, averageCycle]);

  const last7 = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 6);
    return workouts.filter(w => new Date(`${w.date}T00:00:00`) >= cutoff).length;
  }, [workouts]);

  return (
    <div className={`page-container my-space-page ${mode === "workout" ? "mode-him" : "mode-samiha"}`}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow">my private space</p>
        <h1 className="editorial-heading">Your <em>corner</em></h1>
        <p className="my-space-sub">Personal trackers live here. Only your account can access this data.</p>
      </motion.div>

      <div className="tracker-switcher" role="tablist" aria-label="Private tracker">
        <button className={mode === "period" ? "is-active" : ""} onClick={() => switchMode("period")} type="button">🌸 Period Tracker</button>
        <button className={mode === "workout" ? "is-active" : ""} onClick={() => switchMode("workout")} type="button">🏋️ Workout Tracker</button>
      </div>

      {error && <div className="tracker-error">{error}</div>}

      {mode === "period" ? (
        <div className="tracker-layout">
          <GlassCard accent="samiha" className="tracker-main">
            <div className="tracker-heading-row"><div><p className="eyebrow">samiha's private log</p><h2>Cycle <em>tracker</em></h2></div><span className="tracker-symbol">✿</span></div>
            <form className="tracker-form" onSubmit={submitPeriod}>
              <label>Period start<input type="date" value={periodForm.startDate} onChange={e=>setPeriodForm({...periodForm,startDate:e.target.value})} /></label>
              <label>Duration (days)<input type="number" min="1" max="14" value={periodForm.duration} onChange={e=>setPeriodForm({...periodForm,duration:e.target.value})} /></label>
              <label>Flow<select value={periodForm.flow} onChange={e=>setPeriodForm({...periodForm,flow:e.target.value})}>{FLOW.map(x=><option key={x}>{x}</option>)}</select></label>
              <label className="wide">Symptoms<div className="choice-row">{SYMPTOMS.map(x=><button type="button" key={x} className={periodForm.symptoms.includes(x)?"choice is-active":"choice"} onClick={()=>setPeriodForm({...periodForm,symptoms:periodForm.symptoms.includes(x)?periodForm.symptoms.filter(s=>s!==x):[...periodForm.symptoms,x]})}>{x}</button>)}</div></label>
              <label className="wide">Private note<textarea rows="3" placeholder="Anything you want to remember…" value={periodForm.notes} onChange={e=>setPeriodForm({...periodForm,notes:e.target.value})}/></label>
              <button className="tracker-submit" disabled={busy}>{busy ? "Saving…" : "Save cycle"}</button>
            </form>
          </GlassCard>

          <GlassCard accent="samiha" className="tracker-side">
            <div className="stat-pair"><div><span>Average</span><strong>{averageCycle ? `${averageCycle} days` : "—"}</strong></div><div><span>Next estimate</span><strong>{nextPeriod || "Add 2 cycles"}</strong></div></div>
            <h3>Recent cycles</h3>
            <div className="tracker-list">{cycles.slice(0,8).map(c=><div className="tracker-row" key={c.id}><div><strong>{formatDate(c.startDate)}</strong><small>{c.flow} flow · {c.duration} days{c.symptoms?.length ? ` · ${c.symptoms.join(", ")}` : ""}</small></div><button onClick={()=>deletePeriodCycle(user.uid,c.id)} aria-label="Delete cycle">×</button></div>)}{!cycles.length && <p className="empty-copy">Your saved cycles will appear here.</p>}</div>
          </GlassCard>
        </div>
      ) : (
        <div className="tracker-layout">
          <GlassCard accent="him" className="tracker-main">
            <div className="tracker-heading-row"><div><p className="eyebrow">his private log</p><h2>Workout <em>tracker</em></h2></div><span className="tracker-symbol">◒</span></div>
            <form className="tracker-form" onSubmit={submitWorkout}>
              <label>Date<input type="date" value={workoutForm.date} onChange={e=>setWorkoutForm({...workoutForm,date:e.target.value})}/></label>
              <label>Workout / exercise<input required placeholder="e.g. Chest + triceps" value={workoutForm.exercise} onChange={e=>setWorkoutForm({...workoutForm,exercise:e.target.value})}/></label>
              <label>Type<select value={workoutForm.type} onChange={e=>setWorkoutForm({...workoutForm,type:e.target.value})}>{WORKOUT_TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Duration (min)<input type="number" min="1" value={workoutForm.duration} onChange={e=>setWorkoutForm({...workoutForm,duration:e.target.value})}/></label>
              <label className="wide">Notes<textarea rows="3" placeholder="Sets, reps, how it went…" value={workoutForm.notes} onChange={e=>setWorkoutForm({...workoutForm,notes:e.target.value})}/></label>
              <button className="tracker-submit" disabled={busy}>{busy ? "Saving…" : "Log workout"}</button>
            </form>
          </GlassCard>

          <GlassCard accent="him" className="tracker-side">
            <div className="workout-stat"><span>Last 7 days</span><strong>{last7}</strong><small>logged workouts</small></div>
            <h3>Recent workouts</h3>
            <div className="tracker-list">{workouts.slice(0,10).map(w=><div className="tracker-row" key={w.id}><div><strong>{w.exercise}</strong><small>{formatDate(w.date)} · {w.type}{w.duration ? ` · ${w.duration} min` : ""}</small></div><button onClick={()=>deleteWorkout(user.uid,w.id)} aria-label="Delete workout">×</button></div>)}{!workouts.length && <p className="empty-copy">Your workouts will appear here.</p>}</div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
function formatDate(value){ if(!value) return "—"; return new Date(`${value}T00:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); }
