import React, { useState, useEffect, useMemo, useRef } from "react";

/* ============================================================
   100-MILE BUILD CONSOLE
   Race: Friday, January 15, 2027
   Block start: Monday, July 27, 2026 (25 weeks)
   ============================================================ */

const RACE_DATE = new Date(2027, 0, 15, 12, 0, 0);
const START = new Date(2026, 6, 27, 12, 0, 0);

const PHASES = [
  { id: 0, name: "Consistency", weeks: [1, 6], goal: "Kill the variance. Build the strength base.", tint: "#5B7C99" },
  { id: 1, name: "Volume", weeks: [7, 14], goal: "Back-to-backs. Gut training.", tint: "#4A8C6F" },
  { id: 2, name: "Specificity", weeks: [15, 21], goal: "Tune-up race. Night work. Simulations.", tint: "#B07A28" },
  { id: 3, name: "Taper", weeks: [22, 25], goal: "Shed fatigue. Hold sharpness.", tint: "#8A6BA8" },
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* Weekly mileage: [Mon, Tue, Wed, Thu, Fri, Sat, Sun] */
const WEEKS = [
  { n: 1, ph: 0, mi: [0, 6, 7, 6, 5, 14, 4], note: "Baseline week. Strength starts. Order bloodwork.",
    ov: { 4: "Easy run + Strength B — order lab panel this week" } },
  { n: 2, ph: 0, mi: [0, 7, 8, 6, 5, 16, 4], note: "Introduce cadence drills.",
    ov: { 3: "Easy run + cadence drills (4×3 min at +8 spm, 4×3 min at −5)" } },
  { n: 3, ph: 0, mi: [0, 8, 8, 7, 5, 17, 5], note: "First full three-shoe rotation week. Different model each run.", ov: {} },
  { n: 4, ph: 0, mi: [0, 6, 6, 6, 4, 12, 4], down: true, note: "Down week. Full rest Monday and Friday.", ov: {} },
  { n: 5, ph: 0, mi: [0, 7, 8, 7, 5, 18, 5], note: "First real tempo session.",
    ov: { 2: "Quality — 3×10 min steady-state, 2 min float between" } },
  { n: 6, ph: 0, mi: [0, 8, 9, 7, 6, 18, 6], note: "Long run on pre-fatigued legs.",
    ov: { 4: "Easy 6 — deliberate pre-fatigue for Saturday" } },

  { n: 7, ph: 1, mi: [0, 8, 9, 8, 5, 20, 8], note: "Run/walk 9:1 begins on every long run. Set the COROS interval timer.",
    ov: { 5: "Long run 20 — run/walk 9:1 from minute one" } },
  { n: 8, ph: 1, mi: [0, 9, 10, 8, 3, 22, 10], note: "Gut training starts. Fuel from minute 30, every long run.",
    ov: { 5: "Long run 22 — fuel from min 30, target 60 g carb/hr" } },
  { n: 9, ph: 1, mi: [0, 7, 8, 6, 4, 14, 6], down: true, note: "Down week.", ov: {} },
  { n: 10, ph: 1, mi: [0, 8, 9, 7, 2, 22, 12], note: "First true back-to-back weekend.",
    ov: { 5: "Long run 22", 6: "Back-to-back 12 — on unrecovered legs. Should feel bad." } },
  { n: 11, ph: 1, mi: [0, 9, 10, 7, 2, 24, 12], note: "Push fueling rate.",
    ov: { 5: "Long run 24 — push to 70 g carb/hr", 6: "Back-to-back 12" } },
  { n: 12, ph: 1, mi: [0, 10, 10, 8, 2, 26, 12], note: "First circadian-trough session. Normal sleep, early alarm.",
    ov: { 5: "Long run 26 — 3:30 AM start. Sleep normally, nap after.", 6: "Back-to-back 12" } },
  { n: 13, ph: 1, mi: [0, 8, 8, 6, 4, 16, 8], down: true, note: "Down week. Honest niggle audit — anything nagging?", ov: {} },
  { n: 14, ph: 1, mi: [0, 9, 9, 6, 2, 24, 12], note: "Full race kit dress rehearsal.",
    ov: { 5: "Long run 24 — full race kit. Pack, shoes, socks, everything.", 6: "Back-to-back 12" } },

  { n: 15, ph: 2, mi: [0, 10, 10, 8, 2, 26, 12], note: "Night running in the kit you'll actually wear in January.",
    ov: { 5: "Long run 26 — night run, full cold-weather kit, two headlamps", 6: "Back-to-back 12" } },
  { n: 16, ph: 2, mi: [0, 9, 10, 8, 4, 14, 10], note: "Taper into the tune-up race.", ov: {} },
  { n: 17, ph: 2, mi: [0, 6, 4, 2, 0, 50, 0], race: true, note: "Oakwood 24, Raleigh. Looped, flat, timed — a scale model of race day.",
    ov: { 5: "OAKWOOD 24 — run 50 miles at 100-mile effort, then stop." } },
  { n: 18, ph: 2, mi: [0, 7, 8, 6, 4, 12, 8], down: true, note: "Recovery week. Tart cherry juice this week only.", ov: {} },
  { n: 19, ph: 2, mi: [0, 10, 10, 8, 2, 26, 12], note: "Second circadian-trough session. Apply what the tune-up taught you.",
    ov: { 5: "Long run 26 — 3:30 AM start. Normal sleep, nap after.", 6: "Back-to-back 12" } },
  { n: 20, ph: 2, mi: [0, 9, 10, 8, 0, 40, 5], sim: true, note: "PEAK WEEK. Simulation 1.",
    ov: { 5: "SIM 1 — 11–12 hrs, 12:00 PM start. Mirrors race laps 1–5.", 6: "Shakeout 5 — very easy" } },
  { n: 21, ph: 2, mi: [0, 9, 10, 7, 0, 26, 18], sim: true, note: "Simulation 2 — back-to-back. Final hard block.",
    ov: { 5: "SIM 2a — 5 hrs moderate", 6: "SIM 2b — 3.5 hrs, 5:00 AM start on wrecked legs" } },

  { n: 22, ph: 3, mi: [0, 8, 9, 7, 4, 14, 10], note: "Taper begins. Nothing over 3 hours from here on.", ov: {} },
  { n: 23, ph: 3, mi: [0, 7, 8, 6, 3, 10, 8], note: "Drop bag list finalized. Crew briefed. Last strength session Dec 31.", ov: {} },
  { n: 24, ph: 3, mi: [0, 6, 6, 5, 2, 8, 5], note: "Caffeine taper starts Jan 5 (cut 50%). Bank sleep over training.", ov: {} },
  { n: 25, ph: 3, mi: [6, 5, 4, 0, 100, 0, 0], raceweek: true, note: "Race week. Nothing new. Not one thing.",
    ov: { 0: "Easy 6", 1: "Easy 5 with 6×1 min at race pace", 2: "Easy 4 — shakeout", 3: "Full rest. Zero caffeine from Jan 10.",
          4: "RACE — 100 miles", 5: "—", 6: "—" } },
];

const TEMPLATE = [
  "Rest, or 45–60 min easy spin",
  "Easy run + Strength A",
  "Quality — steady-state / tempo",
  "Easy run",
  "Easy run or bike + Strength B",
  "Long run",
  "Recovery run",
];

function dayLabel(w, d) {
  if (w.ov && w.ov[d]) return w.ov[d];
  if (d === 6 && w.ph >= 1 && w.mi[6] >= 10) return "Back-to-back medium-long";
  if (d === 5) return `Long run ${w.mi[5]}`;
  if (w.mi[d] === 0) return TEMPLATE[d];
  return TEMPLATE[d];
}

function dayType(w, d) {
  if (w.raceweek) {
    if (d === 4) return "race";
    if (d >= 5 || w.mi[d] === 0) return "rest";
    return "easy";
  }
  if (w.race && d === 5) return "race";
  if (w.sim && (d === 5 || (d === 6 && w.n === 21))) return "sim";
  if (d === 5) return "long";
  if (d === 6 && w.mi[6] >= 10) return "b2b";
  if (d === 2) return "quality";
  if (w.mi[d] === 0) return "rest";
  return "easy";
}

const TYPE_META = {
  rest: { label: "Rest", c: "#8A939C" },
  easy: { label: "Easy", c: "#5B7C99" },
  quality: { label: "Quality", c: "#0B4F8F" },
  long: { label: "Long", c: "#4A8C6F" },
  b2b: { label: "B2B", c: "#2F6B52" },
  sim: { label: "Sim", c: "#B07A28" },
  race: { label: "Race", c: "#C2321B" },
};

const hasStrength = (w, d) => (d === 1 || d === 4) && w.n <= 23 && !w.raceweek;

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fmtShort(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtLong(d) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
const dayDate = (wi, di) => addDays(START, wi * 7 + di);
const weekTotal = (w) => w.mi.reduce((a, b) => a + b, 0) - (w.raceweek ? 100 : 0);

/* ============================================================ */

export default function UltraConsole() {
  const [tab, setTab] = useState("today");
  const [done, setDone] = useState({});
  const [logs, setLogs] = useState({});
  const [openWeek, setOpenWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [logDate, setLogDate] = useState(iso(new Date()));
  const saveTimer = useRef(null);

  const today = new Date();
  const daysOut = Math.ceil((RACE_DATE - today) / 86400000);
  const elapsed = Math.floor((today - START) / 86400000);
  const curWeek = Math.max(0, Math.min(24, Math.floor(elapsed / 7)));
  const curDay = Math.max(0, Math.min(6, elapsed - curWeek * 7));
  const inBlock = elapsed >= 0 && daysOut >= 0;

  /* ---------- storage ---------- */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("ultra:progress");
        if (r?.value) setDone(JSON.parse(r.value).done || {});
      } catch (e) { /* first run */ }
      try {
        const r = await window.storage.get("ultra:logs");
        if (r?.value) setLogs(JSON.parse(r.value));
      } catch (e) { /* first run */ }
      setLoading(false);
    })();
  }, []);

  const persist = async (key, value) => {
    setStatus("Saving");
    try {
      await window.storage.set(key, JSON.stringify(value));
      setStatus("Saved");
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setStatus(""), 1600);
    } catch (e) {
      setStatus("Save failed — try again");
    }
  };

  const toggle = (wi, di) => {
    const k = `${wi}-${di}`;
    const next = { ...done, [k]: !done[k] };
    if (!next[k]) delete next[k];
    setDone(next);
    persist("ultra:progress", { done: next });
  };

  const updateLog = (date, field, value) => {
    const next = { ...logs, [date]: { ...(logs[date] || {}), [field]: value } };
    setLogs(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist("ultra:logs", next), 600);
  };

  /* ---------- derived ---------- */
  const actualByWeek = useMemo(() => {
    return WEEKS.map((w, wi) => {
      let sum = 0, any = false;
      for (let d = 0; d < 7; d++) {
        const v = parseFloat(logs[iso(dayDate(wi, d))]?.miles);
        if (!isNaN(v)) { sum += v; any = true; }
      }
      return any ? sum : null;
    });
  }, [logs]);

  const series = (field) => {
    const out = [];
    Object.keys(logs).sort().forEach((d) => {
      const v = parseFloat(logs[d]?.[field]);
      if (!isNaN(v)) out.push({ d, v });
    });
    return out;
  };

  const totalDone = Object.keys(done).length;
  const totalSessions = WEEKS.reduce((a, w) => a + w.mi.filter((m, i) => m > 0 || i === 0).length, 0);

  if (loading) {
    return (
      <div className="uc-root">
        <style>{CSS}</style>
        <div className="uc-boot">Loading log…</div>
      </div>
    );
  }

  return (
    <div className="uc-root">
      <style>{CSS}</style>

      {/* ---------- HEADER ---------- */}
      <header className="uc-head">
        <div className="uc-head-top">
          <div>
            <div className="uc-eyebrow">Southern Tour Ultra · 10 × 10 mi · noon Fri Jan 15 2027</div>
            <h1 className="uc-title">Build Console</h1>
          </div>
          <div className="uc-count">
            <span className="uc-count-n">{daysOut > 0 ? daysOut : 0}</span>
            <span className="uc-count-l">days out</span>
          </div>
        </div>
        <StripChart weeks={WEEKS} actual={actualByWeek} curWeek={inBlock ? curWeek : -1} />
        <div className="uc-head-meta">
          <span>Week {String(inBlock ? curWeek + 1 : 1).padStart(2, "0")} / 25</span>
          <span className="uc-dot" />
          <span style={{ color: PHASES[WEEKS[inBlock ? curWeek : 0].ph].tint }}>
            Phase {WEEKS[inBlock ? curWeek : 0].ph + 1} · {PHASES[WEEKS[inBlock ? curWeek : 0].ph].name}
          </span>
          <span className="uc-dot" />
          <span>{totalDone} sessions logged</span>
        </div>
      </header>

      {/* ---------- NAV ---------- */}
      <nav className="uc-nav" role="tablist">
        {[["today", "Today"], ["plan", "Plan"], ["trends", "Trends"], ["ref", "Reference"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k}
            className={"uc-tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>

      <div className="uc-body">
        {tab === "today" && (
          <TodayView
            curWeek={curWeek} curDay={curDay} inBlock={inBlock}
            done={done} toggle={toggle} logs={logs} updateLog={updateLog}
            logDate={logDate} setLogDate={setLogDate}
          />
        )}
        {tab === "plan" && (
          <PlanView done={done} toggle={toggle} openWeek={openWeek} setOpenWeek={setOpenWeek}
            curWeek={inBlock ? curWeek : -1} logs={logs} />
        )}
        {tab === "trends" && <TrendsView actual={actualByWeek} series={series} logs={logs} />}
        {tab === "ref" && <RefView />}
      </div>

      {status && <div className="uc-toast">{status}</div>}
    </div>
  );
}

/* ============================================================
   STRIP CHART — the signature. Setpoint bars, actual trace.
   ============================================================ */
function StripChart({ weeks, actual, curWeek }) {
  const W = 340, H = 54, PAD = 2;
  const max = 78;
  const bw = (W - PAD * 2) / 25;
  const y = (v) => H - 8 - (v / max) * (H - 14);

  let path = "", started = false;
  actual.forEach((a, i) => {
    if (a == null) { started = false; return; }
    const px = PAD + i * bw + bw / 2;
    path += (started ? " L" : " M") + px + "," + y(a);
    started = true;
  });

  return (
    <div className="uc-strip">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="uc-strip-svg" aria-label="Planned versus actual weekly mileage across the block">
        {PHASES.map((p) => {
          const a = p.weeks[0] - 1, b = p.weeks[1];
          return <rect key={p.id} x={PAD + a * bw} y={0} width={(b - a) * bw} height={H}
            fill={p.tint} opacity="0.07" />;
        })}
        {[20, 40, 60].map((g) => (
          <line key={g} x1={0} x2={W} y1={y(g)} y2={y(g)} stroke="#C4CBD2" strokeWidth="0.5" strokeDasharray="2 3" />
        ))}
        {weeks.map((w, i) => {
          const t = weekTotal(w);
          return <rect key={i} x={PAD + i * bw + 1} y={y(t)} width={bw - 2} height={H - 8 - y(t)}
            fill="#0B4F8F" opacity={curWeek === i ? 0.85 : 0.28} rx="1" />;
        })}
        {path && <path d={path} fill="none" stroke="#C2321B" strokeWidth="1.6" strokeLinejoin="round" />}
        {curWeek >= 0 && (
          <line x1={PAD + curWeek * bw + bw / 2} x2={PAD + curWeek * bw + bw / 2} y1={0} y2={H}
            stroke="#12161A" strokeWidth="1" />
        )}
      </svg>
      <div className="uc-strip-key">
        <span><i style={{ background: "#0B4F8F", opacity: 0.5 }} />planned</span>
        <span><i style={{ background: "#C2321B" }} />actual</span>
      </div>
    </div>
  );
}

/* ============================================================
   TODAY
   ============================================================ */
function TodayView({ curWeek, curDay, inBlock, done, toggle, logs, updateLog, logDate, setLogDate }) {
  const w = WEEKS[curWeek];
  const dt = new Date(logDate + "T12:00:00");
  const offset = Math.floor((dt - START) / 86400000);
  const lwi = Math.floor(offset / 7), ldi = offset - lwi * 7;
  const valid = lwi >= 0 && lwi < 25 && ldi >= 0 && ldi < 7;
  const lw = valid ? WEEKS[lwi] : null;
  const entry = logs[logDate] || {};

  if (!inBlock) {
    return (
      <div className="uc-card">
        <div className="uc-card-h">Block hasn't started</div>
        <p className="uc-p">Week 1 begins Monday, July 27, 2026. Open the Plan tab to see what's coming, or the Reference tab for the strength program and bloodwork panel.</p>
      </div>
    );
  }

  return (
    <>
      <section className="uc-card">
        <div className="uc-card-h">Today · {fmtLong(dayDate(curWeek, curDay))}</div>
        <DayRow w={w} wi={curWeek} di={curDay} done={done} toggle={toggle} big />
        {w.note && <p className="uc-weeknote">{w.note}</p>}
      </section>

      <section className="uc-card">
        <div className="uc-card-h">
          Daily log
          <input type="date" className="uc-date" value={logDate}
            onChange={(e) => setLogDate(e.target.value)} aria-label="Log date" />
        </div>

        {valid && lw && (
          <div className="uc-logplan">
            Week {lw.n} · {DAY_NAMES[ldi]} — {dayLabel(lw, ldi)}
          </div>
        )}

        <label className="uc-lbl" htmlFor="uc-note">Notes</label>
        <textarea id="uc-note" className="uc-ta" rows={7}
          placeholder="How it actually went. Legs, weather, fueling, what hurt, what you'd change, anything on your mind."
          value={entry.note || ""} onChange={(e) => updateLog(logDate, "note", e.target.value)} />

        <div className="uc-nums">
          <Num label="Miles" unit="mi" v={entry.miles} on={(v) => updateLog(logDate, "miles", v)} />
          <Num label="Sleep" unit="hr" v={entry.sleep} on={(v) => updateLog(logDate, "sleep", v)} />
          <Num label="Weight" unit="lb" v={entry.weight} on={(v) => updateLog(logDate, "weight", v)} />
        </div>

        <Scale label="Soreness" hint="1 fresh · 10 wrecked" v={entry.soreness}
          on={(v) => updateLog(logDate, "soreness", v)} c="#C2321B" />
        <Scale label="Energy" hint="1 flat · 10 excellent" v={entry.energy}
          on={(v) => updateLog(logDate, "energy", v)} c="#4A8C6F" />

        <p className="uc-fine">Every field is optional. The numbers are the ones you can't reconstruct later.</p>
      </section>
    </>
  );
}

function Num({ label, unit, v, on }) {
  return (
    <div className="uc-num">
      <label className="uc-lbl">{label}</label>
      <div className="uc-num-in">
        <input inputMode="decimal" value={v || ""} onChange={(e) => on(e.target.value)} placeholder="—" />
        <span>{unit}</span>
      </div>
    </div>
  );
}

function Scale({ label, hint, v, on, c }) {
  return (
    <div className="uc-scale">
      <div className="uc-scale-h">
        <span className="uc-lbl">{label}</span>
        <span className="uc-hint">{hint}</span>
      </div>
      <div className="uc-pills">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <button key={n} className={"uc-pill" + (String(v) === String(n) ? " on" : "")}
            style={String(v) === String(n) ? { background: c, borderColor: c } : undefined}
            onClick={() => on(String(v) === String(n) ? "" : String(n))}
            aria-pressed={String(v) === String(n)}>{n}</button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   PLAN
   ============================================================ */
function PlanView({ done, toggle, openWeek, setOpenWeek, curWeek, logs }) {
  return (
    <>
      {PHASES.map((p) => (
        <div key={p.id} className="uc-phase">
          <div className="uc-phase-h" style={{ borderColor: p.tint }}>
            <div>
              <div className="uc-phase-n" style={{ color: p.tint }}>Phase {p.id + 1} · {p.name}</div>
              <div className="uc-phase-g">{p.goal}</div>
            </div>
            <div className="uc-phase-w">W{p.weeks[0]}–{p.weeks[1]}</div>
          </div>

          {WEEKS.filter((w) => w.ph === p.id).map((w) => {
            const wi = w.n - 1;
            const open = openWeek === wi;
            const total = weekTotal(w);
            const dn = [0, 1, 2, 3, 4, 5, 6].filter((d) => done[`${wi}-${d}`]).length;
            return (
              <div key={w.n} className={"uc-week" + (curWeek === wi ? " now" : "")}>
                <button className="uc-week-h" onClick={() => setOpenWeek(open ? null : wi)} aria-expanded={open}>
                  <span className="uc-week-n">{String(w.n).padStart(2, "0")}</span>
                  <span className="uc-week-d">{fmtShort(dayDate(wi, 0))}</span>
                  <span className="uc-week-m">{total} mi</span>
                  {w.down && <span className="uc-tag down">down</span>}
                  {w.race && <span className="uc-tag race">race</span>}
                  {w.sim && <span className="uc-tag sim">sim</span>}
                  {w.raceweek && <span className="uc-tag race">RACE WEEK</span>}
                  <span className="uc-week-p">
                    <span className="uc-bar"><i style={{ width: `${(dn / 7) * 100}%`, background: p.tint }} /></span>
                    <span className="uc-week-c">{dn}/7</span>
                  </span>
                </button>
                {open && (
                  <div className="uc-week-b">
                    {w.note && <p className="uc-weeknote">{w.note}</p>}
                    {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                      <DayRow key={d} w={w} wi={wi} di={d} done={done} toggle={toggle} logged={!!logs[iso(dayDate(wi, d))]?.note} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

function DayRow({ w, wi, di, done, toggle, big, logged }) {
  const t = dayType(w, di);
  const m = TYPE_META[t];
  const isDone = !!done[`${wi}-${di}`];
  const mi = w.mi[di];
  return (
    <div className={"uc-day" + (isDone ? " done" : "") + (big ? " big" : "")}>
      <button className="uc-check" onClick={() => toggle(wi, di)} aria-pressed={isDone}
        aria-label={`Mark ${DAY_NAMES[di]} complete`}>
        {isDone && <svg viewBox="0 0 16 16" width="12" height="12"><path d="M2 8.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
      <div className="uc-day-main">
        <div className="uc-day-top">
          <span className="uc-day-n">{DAY_NAMES[di]}</span>
          <span className="uc-chip" style={{ color: m.c, borderColor: m.c }}>{m.label}</span>
          {big && <span className="uc-day-date">{fmtShort(dayDate(wi, di))}</span>}
          {logged && <span className="uc-logged" title="Notes written">●</span>}
        </div>
        <div className="uc-day-l">{dayLabel(w, di)}</div>
        {hasStrength(w, di) && <div className="uc-day-s">+ Strength {di === 1 ? "A" : "B"}</div>}
      </div>
      <div className="uc-day-mi">{mi > 0 ? mi : "—"}</div>
    </div>
  );
}

/* ============================================================
   TRENDS
   ============================================================ */
function TrendsView({ actual, series, logs }) {
  const sore = series("soreness"), en = series("energy"), sl = series("sleep"), wt = series("weight");
  const logged = Object.keys(logs).length;

  return (
    <>
      <section className="uc-card">
        <div className="uc-card-h">Planned vs actual — weekly miles</div>
        <BigStrip actual={actual} />
        <p className="uc-fine">Bars are the plan. The red trace is what you logged. Gaps mean no miles recorded that week.</p>
      </section>

      {logged < 5 && (
        <div className="uc-empty">
          Charts fill in as you log. Enter miles, sleep, soreness and energy on the Today tab and the traces build from there.
        </div>
      )}

      <Spark title="Soreness" data={sore} c="#C2321B" min={1} max={10} />
      <Spark title="Energy" data={en} c="#4A8C6F" min={1} max={10} />
      <Spark title="Sleep (hrs)" data={sl} c="#0B4F8F" min={3} max={11} />
      <Spark title="Weight (lb)" data={wt} c="#8A6BA8" />

      <section className="uc-card">
        <div className="uc-card-h">What to look for</div>
        <ul className="uc-ul">
          <li><strong>Actual running consistently under plan for 2+ weeks</strong> — the plan is too aggressive, or life is. Reset to the previous week's volume rather than chasing.</li>
          <li><strong>Soreness climbing while energy falls</strong> — the clearest early signal of accumulated fatigue. Take the down week early.</li>
          <li><strong>Sleep dropping below 7 during a build week</strong> — this predicts injury better than mileage does.</li>
          <li><strong>Weight trending down during Phase 2</strong> — you're underfueling the volume. Add calories before adding miles.</li>
        </ul>
      </section>
    </>
  );
}

function BigStrip({ actual }) {
  const W = 700, H = 200, L = 30, B = 26;
  const max = 80;
  const bw = (W - L - 8) / 25;
  const y = (v) => H - B - (v / max) * (H - B - 12);
  let path = "", started = false;
  actual.forEach((a, i) => {
    if (a == null) { started = false; return; }
    const px = L + i * bw + bw / 2;
    path += (started ? " L" : " M") + px + "," + y(a);
    started = true;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="uc-chart" role="img" aria-label="Planned versus actual weekly mileage">
      {PHASES.map((p) => {
        const a = p.weeks[0] - 1, b = p.weeks[1];
        return <g key={p.id}>
          <rect x={L + a * bw} y={0} width={(b - a) * bw} height={H - B} fill={p.tint} opacity="0.06" />
          <text x={L + a * bw + 4} y={12} className="uc-svg-ph" fill={p.tint}>{p.name}</text>
        </g>;
      })}
      {[0, 20, 40, 60, 80].map((g) => (
        <g key={g}>
          <line x1={L} x2={W - 8} y1={y(g)} y2={y(g)} stroke="#C4CBD2" strokeWidth="0.5" />
          <text x={L - 6} y={y(g) + 3} className="uc-svg-ax" textAnchor="end">{g}</text>
        </g>
      ))}
      {WEEKS.map((w, i) => {
        const t = weekTotal(w);
        return <rect key={i} x={L + i * bw + 1.5} y={y(t)} width={bw - 3} height={H - B - y(t)}
          fill="#0B4F8F" opacity="0.3" rx="1" />;
      })}
      {path && <path d={path} fill="none" stroke="#C2321B" strokeWidth="2" strokeLinejoin="round" />}
      {WEEKS.filter((_, i) => i % 4 === 0).map((w, k) => {
        const i = k * 4;
        return <text key={i} x={L + i * bw + bw / 2} y={H - 8} className="uc-svg-ax" textAnchor="middle">W{w.n}</text>;
      })}
    </svg>
  );
}

function Spark({ title, data, c, min, max }) {
  if (!data.length) return null;
  const W = 700, H = 110, L = 30, B = 18;
  const vals = data.map((d) => d.v);
  const lo = min != null ? min : Math.min(...vals) - 1;
  const hi = max != null ? max : Math.max(...vals) + 1;
  const y = (v) => H - B - ((v - lo) / (hi - lo || 1)) * (H - B - 10);
  const x = (i) => L + (i / Math.max(1, data.length - 1)) * (W - L - 10);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.v)}`).join(" ");
  const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  return (
    <section className="uc-card">
      <div className="uc-card-h">{title}<span className="uc-avg">avg {avg}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="uc-chart" role="img" aria-label={title}>
        <line x1={L} x2={W - 10} y1={y(lo)} y2={y(lo)} stroke="#C4CBD2" strokeWidth="0.5" />
        <line x1={L} x2={W - 10} y1={y(hi)} y2={y(hi)} stroke="#C4CBD2" strokeWidth="0.5" />
        <text x={L - 6} y={y(hi) + 3} className="uc-svg-ax" textAnchor="end">{hi}</text>
        <text x={L - 6} y={y(lo) + 3} className="uc-svg-ax" textAnchor="end">{lo}</text>
        <path d={path} fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.v)} r="2" fill={c} />)}
      </svg>
    </section>
  );
}

/* ============================================================
   REFERENCE
   ============================================================ */
function RefView() {
  const [open, setOpen] = useState("pace");
  const S = ({ id, title, children }) => (
    <div className="uc-acc">
      <button className={"uc-acc-h" + (open === id ? " on" : "")} onClick={() => setOpen(open === id ? "" : id)}
        aria-expanded={open === id}>
        {title}<span className="uc-acc-i">{open === id ? "–" : "+"}</span>
      </button>
      {open === id && <div className="uc-acc-b">{children}</div>}
    </div>
  );

  return (
    <>
      <S id="pace" title="Race day pacing — ten laps from noon">
        <p className="uc-p"><strong>Southern Tour Ultra, Wilmington.</strong> Scott's Hill Loop Rd / Poplar Grove Plantation. The 100-mile individual starts <strong>Friday at 12:00 PM</strong> — ten 10-mile loops, 31-hour cutoff. A 24-hour finish lands around noon Saturday with seven hours of margin. Your goal is a goal, not a constraint.</p>
        <p className="uc-p"><strong>The defining feature of this race is darkness.</strong> Wilmington sunset in mid-January falls around 5:20 PM, sunrise around 7:15 AM. You hit the dark near mile 25 and don't see daylight again until roughly mile 80. That's close to 14 hours — nearly 60% of a 24-hour run — at night. This is the single biggest thing separating your race from a typical morning-start 100.</p>
        <p className="uc-p"><strong>24 hours = 2:24 per lap average</strong>, including aid. Your 40-miler at 10:30/mile means the pace is well inside your fitness. The failure mode is going out too fast; the correct early pace will feel embarrassingly slow.</p>
        <table className="uc-tbl">
          <thead><tr><th>Lap</th><th>Mile</th><th>Clock</th><th>Split</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>10</td><td>1:55 PM</td><td>1:55 — daylight, feels too easy</td></tr>
            <tr><td>2</td><td>20</td><td>3:55 PM</td><td>2:00</td></tr>
            <tr><td>3</td><td>30</td><td>6:00 PM</td><td>2:05 — headlamp on mid-lap</td></tr>
            <tr><td>4</td><td>40</td><td>8:10 PM</td><td>2:10</td></tr>
            <tr><td>5</td><td>50</td><td>10:25 PM</td><td>2:15 — halfway, 10.5 hrs</td></tr>
            <tr><td>6</td><td>60</td><td>12:50 AM</td><td>2:25</td></tr>
            <tr><td>7</td><td>70</td><td>3:25 AM</td><td>2:35 — trough begins</td></tr>
            <tr><td>8</td><td>80</td><td>6:10 AM</td><td>2:45 — worst lap of the race</td></tr>
            <tr><td>9</td><td>90</td><td>9:05 AM</td><td>2:55 — daylight, big lift</td></tr>
            <tr><td>10</td><td>100</td><td>12:05 PM</td><td>3:00 — whatever's left</td></tr>
          </tbody>
        </table>
        <p className="uc-p"><strong>Lap 8 is the race.</strong> Roughly 3:25 to 6:10 AM, mile 70 to 80, deepest circadian trough, coldest and dampest hour, and still dark. Everything in this plan that looks like overkill is aimed at that one lap.</p>
        <p className="uc-p"><strong>Sunrise is your lever.</strong> You don't have to survive 100 miles. You have to survive until about 7:15 AM. Frame it that way in the dark.</p>
        <p className="uc-p"><strong>Run/walk 9:1 from mile one.</strong> Not a fallback — the plan. Walk breaks unload the calf, let you eat properly, and cost almost nothing. Reach mile 50 feeling like you haven't started.</p>
      </S>

      <S id="loop" title="Loop strategy — the part nobody plans for">
        <p className="uc-p">Ten laps past the same start/finish changes the race in two directions, one good and one dangerous.</p>
        <div className="uc-sub">The gift</div>
        <ul className="uc-ul">
          <li><strong>Full aid every 10 miles</strong>, roughly every 2–2.5 hours. You do not need a big pack. A handheld or minimal vest carrying one lap's fuel is enough.</li>
          <li><strong>Ten clothing-change opportunities.</strong> Dry socks and a dry base layer whenever you want them.</li>
          <li><strong>Shoe rotation mid-race is available.</strong> Swap models at lap 4 and lap 7 to shift load between calf and knee — the same variability principle that governs training, applied live.</li>
          <li><strong>Drop bag logistics are trivial.</strong> One bin, ten visits. Lay it out in labelled zip bags by lap.</li>
        </ul>
        <div className="uc-sub">The trap</div>
        <p className="uc-p">Looped courses have higher DNF rates than point-to-point races, and the reason is structural: you pass your car, your tent, your chair, and a bonfire every two hours. On a point-to-point you are physically committed to moving forward. Here, quitting is always eight feet away and warm.</p>
        <ul className="uc-ul">
          <li><strong>Do not sit down</strong> in the start/finish area before lap 9. Stand while you eat. A chair at 4 AM has ended more hundred-mile races than any injury.</li>
          <li><strong>Set a hard stop time</strong> for each transition — 3 minutes early, 5 minutes late. Have someone hold you to it.</li>
          <li><strong>Never make a quit decision at the tent.</strong> The rule is: leave for the next lap, then decide at the far end of the loop. Almost nobody quits a mile from the aid station; almost everybody quits standing in it.</li>
          <li><strong>The bonfire is a hazard.</strong> Warm, social, and directly on your route ten times. Plan to walk past it without stopping.</li>
        </ul>
        <p className="uc-p uc-cav">One thing to confirm: sources disagree on loop length between years — some list a 10-mile loop, one older listing shows 5-mile loops. Check the current course map before building your lap plan.</p>
      </S>

      <S id="str" title="Strength program">
        <p className="uc-p">Twice weekly, 30–40 min, through Week 23. Last session Dec 31. Progressive load — same weight in December as August means it isn't working.</p>
        <p className="uc-p"><strong>Why the soleus leads.</strong> It absorbs roughly 6–8× bodyweight per stride and is the primary propulsive contributor at slow paces. Slow pace is your entire race, and on a flat course it's the tissue most implicated in late pace collapse.</p>
        <div className="uc-sub">Session A — posterior chain &amp; soleus</div>
        <table className="uc-tbl">
          <tbody>
            <tr><td>Seated calf raise (bent knee)</td><td>3 × 8–12 heavy</td></tr>
            <tr><td>Romanian deadlift</td><td>3 × 8</td></tr>
            <tr><td>Bulgarian split squat</td><td>3 × 8 each</td></tr>
            <tr><td>Single-leg calf raise, slow eccentric</td><td>3 × 12 each</td></tr>
            <tr><td>Pallof press</td><td>3 × 10 each</td></tr>
          </tbody>
        </table>
        <div className="uc-sub">Session B — durability &amp; control</div>
        <table className="uc-tbl">
          <tbody>
            <tr><td>Step-down (eccentric control)</td><td>3 × 10 each</td></tr>
            <tr><td>Hip thrust</td><td>3 × 10</td></tr>
            <tr><td>Tibialis anterior raise</td><td>3 × 20</td></tr>
            <tr><td>Side plank with leg lift</td><td>3 × 30 sec each</td></tr>
            <tr><td>Single-leg glute bridge</td><td>3 × 12 each</td></tr>
          </tbody>
        </table>
      </S>

      <S id="rec" title="Recovery protocol">
        <p className="uc-p"><strong>Sleep &gt; fueling &gt; load management &gt; strength work &gt;&gt;&gt; everything else.</strong> The gadgets are the last few percent. Spend attention accordingly.</p>
        <div className="uc-sub">Supported</div>
        <ul className="uc-ul">
          <li><strong>Dynamic warm-up</strong>, 8–10 min before every run. Genuinely reduces injury risk.</li>
          <li><strong>Static stretching does not prevent injury.</strong> Well established. Keep it if you enjoy it; it isn't earning a slot.</li>
          <li><strong>Sauna</strong>, 15–20 min post-run, 2–3×/week. Drives plasma volume expansion with real endurance benefit. Not when already depleted or dehydrated.</li>
          <li><strong>Massage</strong>, monthly. Modest evidence, useful for catching tight spots early.</li>
        </ul>
        <div className="uc-sub">Use carefully</div>
        <ul className="uc-ul">
          <li><strong>Cold plunge — not within ~6 hours of strength training.</strong> Post-lifting cold immersion measurably blunts strength and hypertrophy adaptation. You lift to build tissue resilience; plunging after undoes part of it. Save it for after the Week 17 tune-up and after Sim 1, where recovery outranks adaptation.</li>
        </ul>
        <div className="uc-sub">Fine, oversold</div>
        <ul className="uc-ul">
          <li><strong>Massage gun</strong> — improves acute range of motion and perceived soreness. No demonstrated effect on actual performance recovery. Harmless, use it.</li>
          <li><strong>Compression boots</strong> — same verdict. Use them while you're already at the gym.</li>
        </ul>
      </S>

      <S id="sleep" title="Night sessions — why they changed">
        <p className="uc-p">The original plan stacked back-to-back long runs with deliberate sleep deprivation. Those are two different things and only one of them earns its place.</p>
        <p className="uc-p"><strong>Back-to-backs stay.</strong> Running long on depleted, mechanically fatigued legs is the core adaptation of ultra training. Requires zero sleep loss.</p>
        <p className="uc-p"><strong>Deliberate sleep deprivation is mostly cut.</strong> There is no physiological adaptation to sleep loss. What you get instead is elevated RPE at the same workload, impaired glycogen resynthesis and muscle protein synthesis, suppressed growth hormone, and meaningfully higher injury risk. Adding sleep debt during peak weeks works directly against everything else this plan is doing.</p>
        <p className="uc-p"><strong>What survives:</strong> two sessions, Weeks 12 and 19, both <strong>normal sleep with a 3:30 AM start</strong>. You still run through the circadian trough on a body that expects to be asleep — which is the rehearsal value — without sabotaging recovery. Nap afterward. That's the protocol, not a workaround.</p>
      </S>

      <S id="sim" title="Tune-up &amp; simulations">
        <div className="uc-sub">Week 17 — tune-up: Oakwood 24, Sat Nov 21</div>
        <p className="uc-p">Lakeside Retreats, 4521 Mial Plantation Rd, about 20 minutes east of downtown Raleigh. A timed event on a flat 2-mile loop, benefiting Healing Transitions, 8:00 AM start. Confirm the 2026 distance options when registration opens — recent years have offered 50-mile and 50K alongside the timed entries.</p>
        <p className="uc-p">This is close to an ideal rehearsal now that the race is confirmed. Looped, flat, campground atmosphere, timed rather than fixed-distance — the same structural conditions as Southern Tour, at a fraction of the length. Run 50 miles and stop.</p>
        <p className="uc-p"><strong>Rehearse the loop discipline specifically:</strong> stand while eating, hard transition times, and no quit decisions made at the aid table. Race it at goal 100-mile <em>effort</em>, deliberately slower than you could run a 50. Finishing feeling like you held back is a perfect execution.</p>
        <div className="uc-sub">Sim 1 — Saturday Dec 12</div>
        <ul className="uc-ul">
          <li><strong>12:00 PM start.</strong> Same clock as the race. You get roughly 5 hours of daylight, headlamp on around 5:20, then run deep into the dark.</li>
          <li>11–12 hours on feet, roughly 40–45 miles. Time matters more than distance. This maps almost exactly onto race laps 1 through 5.</li>
          <li><strong>Run a loop of 5–10 miles</strong> with your car as the aid station. Rehearse the transition discipline: stand, don't sit, hard stop time.</li>
          <li>Full race kit. Actual shoes, handheld or vest, two headlamps.</li>
          <li>One full clothing change mid-run — dry base layer, dry socks — cold, dark, tired.</li>
          <li>Practice a mid-run shoe swap. You'll have that option ten times on race day.</li>
          <li>Weigh before and after. Under 2–3% loss means fluid intake is about right.</li>
        </ul>
        <div className="uc-sub">Sim 2 — Sat/Sun Dec 19–20</div>
        <ul className="uc-ul">
          <li>Saturday 5 hours moderate. Sleep normally.</li>
          <li>Sunday 3.5 hours starting 5:00 AM on wrecked legs.</li>
          <li>Sunday is the mile-75 rehearsal. Most people discover their nutrition collapses after 12 hours of the same flavors.</li>
          <li>Bring three backup foods you haven't relied on. Broth, salted boiled potatoes, and a quesadilla have saved more finishes than any gel.</li>
        </ul>
      </S>

      <S id="fuel" title="Fueling &amp; supplements">
        <div className="uc-sub">In-race</div>
        <ul className="uc-ul">
          <li><strong>Carbohydrate 60–90 g/hr</strong>, 2:1 glucose:fructose. Build 5–10 g/hr per month.</li>
          <li><strong>Sodium 300–1000 mg/hr.</strong> Wide range because sweat sodium is individual — a sweat test would replace this with a number.</li>
          <li><strong>Caffeine 3–6 mg/kg total</strong>, in 50–100 mg doses. Save the largest for 2–4 AM.</li>
        </ul>
        <div className="uc-sub">Daily through the build</div>
        <ul className="uc-ul">
          <li><strong>Protein</strong> 1.6–2.0 g/kg daily.</li>
          <li><strong>Creatine monohydrate</strong> 3–5 g/day, timing irrelevant.</li>
          <li><strong>Omega-3 (EPA+DHA)</strong> 1–2 g/day.</li>
          <li><strong>Collagen 15 g + vitamin C 50 mg</strong>, 30–60 min before hard or long runs. Connective tissue support — the most overlooked piece, and tendon problems are what actually derail these builds.</li>
          <li><strong>Vitamin D</strong> pending your level.</li>
          <li><strong>Probiotic</strong> — 4–8 week trial during gut training. Modest evidence, variable response.</li>
          <li><strong>Magnesium glycinate</strong> at night if diet is light or sleep is rough.</li>
        </ul>
        <div className="uc-sub">Timing-restricted</div>
        <ul className="uc-ul">
          <li><strong>Tart cherry juice</strong> — Week 18 recovery, race week, and the 5 days after. Not during heavy training; the antioxidant load that speeds recovery also blunts adaptation.</li>
        </ul>
        <div className="uc-sub">Skip</div>
        <p className="uc-p">BCAAs, beta-alanine (buffers 1–10 min efforts, irrelevant here), glutamine, adaptogen blends, year-round high-dose vitamin C/E, ketone esters.</p>
        <p className="uc-p">Buy anything with an <strong>NSF Certified for Sport</strong> or <strong>Informed Sport</strong> label.</p>
      </S>

      <S id="blood" title="Bloodwork">
        <p className="uc-p">Self-ordered labs, venous draw. Finger-prick mail kits are noisier and testosterone, CMP and thyroid want venous blood. North Carolina has no restrictions on ordering your own.</p>
        <ul className="uc-ul">
          <li><strong>Labcorp OnDemand</strong> — buy, get physician review, walk into any Labcorp location. Dense Raleigh coverage.</li>
          <li><strong>Quest Health</strong> — same model, provider consult included. In-home phlebotomist available for about $79.</li>
          <li><strong>Ulta Lab Tests</strong> — usually cheapest for a custom marker list.</li>
        </ul>
        <div className="uc-sub">Panel</div>
        <ul className="uc-ul">
          <li>Complete blood count (CBC)</li>
          <li>Ferritin, serum iron, TIBC, transferrin saturation</li>
          <li>25-hydroxy vitamin D</li>
          <li>Comprehensive metabolic panel</li>
          <li>Thyroid — TSH, free T4</li>
          <li>Testosterone, total and free</li>
        </ul>
        <p className="uc-p"><strong>Draw 48–72 hours after your last hard session.</strong> Post-long-run bloodwork shows inflated CK and diluted hemoglobin and reads as alarming for no reason.</p>
        <p className="uc-p">Retest at Week 13 and Week 21. Falling ferritin during a volume build is common and correctable if caught early — it's also a leading cause of fatigue that gets misattributed to overtraining.</p>
      </S>

      <S id="rules" title="Non-negotiable rules">
        <ol className="uc-ol">
          <li>No single run exceeds <strong>40% of the week's volume</strong>, and no back-to-back weekend exceeds <strong>60%</strong>. Sims and the tune-up race are excepted — they're planned and tapered into. <em>(I first wrote this as 35% and then found eight weeks of the plan broke it. The honest number for ultra training is 40% — the risk that matters is the 60–90% spike, like your 40-miler in a 45-mile week, not the difference between 35 and 38.)</em></li>
          <li>Weekly volume increases no more than <strong>10%</strong>, with a down week every 3rd or 4th week.</li>
          <li><strong>Any pain that alters your gait ends the run.</strong> Not "finish easy." Stop. Flat-course overuse injuries announce themselves quietly and then stop announcing.</li>
          <li><strong>Strength training does not get dropped</strong> when volume gets hard. It's what keeps you healthy.</li>
          <li><strong>Nothing new after December 20.</strong> Not a shoe, gel, sock, or supplement.</li>
          <li>If you miss a week, <strong>do not make it up</strong>. Resume at the planned volume, or one step back.</li>
        </ol>
      </S>

      <S id="var" title="Why flat is its own problem">
        <p className="uc-p">Most 100-mile advice is written for mountain races and doesn't transfer. On a sub-5,000 ft course you never stop running — no climbing means no hiking means no stride variation. You'll load a near-identical pattern roughly 150,000 times.</p>
        <p className="uc-p">Mountain races break quads through eccentric descent loading. Flat races break the soleus, tibialis and plantar fascia through pure repetition. The countermeasure is <strong>deliberate variability</strong>:</p>
        <ul className="uc-ul">
          <li><strong>Rotate three shoe models</strong> across the week. Different stack heights and drops shift load between calf and knee. Never train only in your race shoe.</li>
          <li><strong>Vary surface constantly</strong> — road, crushed gravel, grass, treadmill, trail.</li>
          <li><strong>Cadence drills</strong> — 4×3 min at +8 spm, then 4×3 min at −5. Teaches your system to load differently on demand, which is how you buy relief at mile 70 without stopping.</li>
        </ul>
      </S>

      <S id="cross" title="Cross-training &amp; cold weather">
        <p className="uc-p"><strong>Bike, 2×/week in Phases 1–2</strong>, 45–75 min easy, strictly aerobic. This is the lever that lets running volume climb conservatively while aerobic stimulus stays high — impact-free load. Drops to 1×/week from Week 11 as specificity takes over.</p>
        <p className="uc-p"><strong>Swim</strong> is optional active recovery. Monday or after a hard Saturday. No intensity.</p>
        <div className="uc-sub">Coastal January — damp, not frigid</div>
        <p className="uc-p">Wilmington in mid-January typically runs lows in the mid-30s and highs in the mid-50s, cool and damp. That's milder than the Piedmont, and it is <em>not</em> less dangerous. Damp 35°F with coastal wind, on a body moving slowly at hour 18 in a sweat-soaked shirt, strips heat faster than dry 25°F does. Hypothermia is the realistic cold risk here, not frostbite.</p>
        <ul className="uc-ul">
          <li><strong>Wind shell over insulation.</strong> A light windproof layer beats a thicker fleece in damp coastal air.</li>
          <li><strong>Dry base layer at least twice</strong> — you have ten chances, use two of them. Around lap 4 and lap 7.</li>
          <li>Two headlamps, one carried as backup, spare batteries in the drop bin. You need light for close to 14 hours.</li>
          <li>Dry socks every other lap from lap 4. Damp feet over 14 hours of darkness is how you get macerated skin and lost toenails.</li>
          <li>Gloves and hat in the bin from lap 3 onward, whether you think you'll want them or not.</li>
          <li>Every night run from Week 15 uses the actual race kit.</li>
        </ul>
      </S>

      <S id="caf" title="Caffeine taper">
        <p className="uc-p">Habitual intake upregulates adenosine receptors, blunting the acute effect. Tapering for 7–10 days restores a meaningful portion of your sensitivity.</p>
        <ul className="uc-ul">
          <li><strong>Jan 5</strong> — cut daily intake by 50%.</li>
          <li><strong>Jan 10</strong> — zero.</li>
          <li>Expect headaches and irritability on days 2–4. That's why it starts early enough to resolve.</li>
          <li><strong>Race</strong> — 50–100 mg doses from roughly hour 10. Largest single dose held for the 2–4 AM window.</li>
        </ul>
        <p className="uc-p uc-cav">Receptor upregulation and partial resensitization are established. The optimal taper length isn't settled — 7–10 days is a reasonable middle estimate.</p>
      </S>

      <S id="open" title="Still unanswered">
        <p className="uc-p">These could change the plan materially:</p>
        <ol className="uc-ol">
          <li><strong>Injury history.</strong> Prior stress fractures, Achilles, plantar fascia, ITB? This plan nearly doubles your volume — prior injury sites change the progression rate and strength emphasis.</li>
          <li><strong>Work schedule.</strong> Anything blocking Saturday long runs or the 3:30 AM sessions?</li>
          <li><strong>Sweat rate and sodium.</strong> A test in the next month replaces the 300–1000 mg/hr range with an actual number.</li>
          <li><strong>Crew.</strong> A loop course makes crewing easy and makes it matter more — someone enforcing your transition times through the night is worth real minutes. Do you have anyone?</li>
        </ol>
      </S>
    </>
  );
}

/* ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Condensed:wght@600;700&display=swap');

.uc-root{--ground:#E9ECEF;--panel:#fff;--ink:#12161A;--mid:#5A646E;--rule:#C4CBD2;--sig:#0B4F8F;--trace:#C2321B;
  font-family:'IBM Plex Sans',system-ui,sans-serif;background:var(--ground);color:var(--ink);
  min-height:100vh;padding-bottom:48px;-webkit-font-smoothing:antialiased}
.uc-root *{box-sizing:border-box}
.uc-boot{padding:60px 20px;text-align:center;color:var(--mid);font-family:'IBM Plex Mono',monospace;font-size:13px}

.uc-head{background:var(--panel);border-bottom:1px solid var(--rule);padding:16px 16px 10px}
.uc-head-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
.uc-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--mid)}
.uc-title{font-family:'IBM Plex Sans Condensed',sans-serif;font-weight:700;font-size:27px;letter-spacing:-.01em;margin:2px 0 0;line-height:1}
.uc-count{text-align:right;line-height:1}
.uc-count-n{display:block;font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:34px;color:var(--sig);letter-spacing:-.03em}
.uc-count-l{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--mid)}
.uc-strip{border:1px solid var(--rule);background:#F7F8F9;padding:4px 4px 0;border-radius:2px}
.uc-strip-svg{width:100%;height:54px;display:block}
.uc-strip-key{display:flex;gap:12px;padding:3px 3px 4px;font-family:'IBM Plex Mono',monospace;font-size:9px;
  letter-spacing:.06em;text-transform:uppercase;color:var(--mid)}
.uc-strip-key span{display:flex;align-items:center;gap:4px}
.uc-strip-key i{width:9px;height:3px;border-radius:1px;display:block}
.uc-head-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:9px;
  font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.04em;color:var(--mid)}
.uc-dot{width:3px;height:3px;border-radius:50%;background:var(--rule)}

.uc-nav{display:flex;background:var(--panel);border-bottom:1px solid var(--rule);position:sticky;top:0;z-index:20}
.uc-tab{flex:1;padding:11px 4px;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;
  font-family:'IBM Plex Sans Condensed',sans-serif;font-weight:600;font-size:13.5px;letter-spacing:.03em;color:var(--mid)}
.uc-tab.on{color:var(--ink);border-bottom-color:var(--sig)}
.uc-tab:focus-visible{outline:2px solid var(--sig);outline-offset:-2px}

.uc-body{padding:14px 12px;max-width:820px;margin:0 auto}
.uc-card{background:var(--panel);border:1px solid var(--rule);border-radius:3px;padding:14px;margin-bottom:12px}
.uc-card-h{display:flex;justify-content:space-between;align-items:center;gap:8px;
  font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--mid);padding-bottom:9px;margin-bottom:11px;border-bottom:1px solid var(--rule)}
.uc-avg{font-size:10px;color:var(--sig)}
.uc-p{font-size:14px;line-height:1.62;margin:0 0 10px;color:#23292F}
.uc-p:last-child{margin-bottom:0}
.uc-cav{font-size:12.5px;color:var(--mid);font-style:italic}
.uc-fine{font-size:11.5px;color:var(--mid);line-height:1.5;margin:10px 0 0}
.uc-empty{background:#F7F8F9;border:1px dashed var(--rule);border-radius:3px;padding:16px;
  font-size:13px;line-height:1.55;color:var(--mid);margin-bottom:12px}

.uc-phase{margin-bottom:18px}
.uc-phase-h{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;
  border-left:3px solid;padding:1px 0 5px 9px;margin-bottom:7px}
.uc-phase-n{font-family:'IBM Plex Sans Condensed',sans-serif;font-weight:700;font-size:16px;letter-spacing:.01em}
.uc-phase-g{font-size:12.5px;color:var(--mid);margin-top:1px}
.uc-phase-w{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--mid);white-space:nowrap}

.uc-week{background:var(--panel);border:1px solid var(--rule);border-radius:3px;margin-bottom:5px;overflow:hidden}
.uc-week.now{border-color:var(--sig);box-shadow:0 0 0 1px var(--sig)}
.uc-week-h{width:100%;display:flex;align-items:center;gap:8px;padding:10px 11px;background:none;border:none;
  cursor:pointer;text-align:left;font-family:'IBM Plex Sans',sans-serif}
.uc-week-h:focus-visible{outline:2px solid var(--sig);outline-offset:-2px}
.uc-week-n{font-family:'IBM Plex Mono',monospace;font-weight:600;font-size:14px;color:var(--sig);min-width:22px}
.uc-week-d{font-size:12px;color:var(--mid);min-width:48px}
.uc-week-m{font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:500;min-width:46px}
.uc-tag{font-family:'IBM Plex Mono',monospace;font-size:8.5px;letter-spacing:.07em;text-transform:uppercase;
  padding:2px 5px;border-radius:2px;white-space:nowrap}
.uc-tag.down{background:#E4E9ED;color:#5A646E}
.uc-tag.race{background:#FBE7E3;color:#C2321B}
.uc-tag.sim{background:#FAF0DC;color:#8A5D14}
.uc-week-p{margin-left:auto;display:flex;align-items:center;gap:6px}
.uc-bar{width:44px;height:3px;background:#E4E9ED;border-radius:2px;overflow:hidden;display:block}
.uc-bar i{display:block;height:100%;border-radius:2px}
.uc-week-c{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--mid);min-width:22px}
.uc-week-b{border-top:1px solid var(--rule);padding:4px 0}
.uc-weeknote{font-size:12.5px;line-height:1.5;color:var(--mid);padding:8px 12px 4px;margin:0;font-style:italic}

.uc-day{display:flex;align-items:flex-start;gap:10px;padding:8px 12px;border-bottom:1px solid #EDF0F2}
.uc-day:last-child{border-bottom:none}
.uc-day.big{padding:4px 0;border:none}
.uc-day.done .uc-day-l{color:var(--mid);text-decoration:line-through;text-decoration-thickness:1px}
.uc-check{flex-shrink:0;width:21px;height:21px;border:1.5px solid var(--rule);border-radius:3px;background:#fff;
  cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;margin-top:1px;padding:0}
.uc-day.done .uc-check{background:var(--sig);border-color:var(--sig)}
.uc-check:focus-visible{outline:2px solid var(--sig);outline-offset:2px}
.uc-day-main{flex:1;min-width:0}
.uc-day-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.uc-day-n{font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase}
.uc-day-date{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--mid)}
.uc-chip{font-family:'IBM Plex Mono',monospace;font-size:8.5px;letter-spacing:.07em;text-transform:uppercase;
  border:1px solid;border-radius:2px;padding:1px 4px}
.uc-logged{color:var(--trace);font-size:8px;line-height:1}
.uc-day-l{font-size:13.5px;line-height:1.45;margin-top:2px}
.uc-day.big .uc-day-l{font-size:16px;font-weight:500;margin-top:4px}
.uc-day-s{font-family:'IBM Plex Mono',monospace;font-size:10.5px;color:var(--sig);margin-top:3px}
.uc-day-mi{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;color:var(--mid);
  min-width:30px;text-align:right;padding-top:1px}
.uc-day.big .uc-day-mi{font-size:20px;color:var(--ink)}

.uc-date{font-family:'IBM Plex Mono',monospace;font-size:11px;border:1px solid var(--rule);border-radius:2px;
  padding:3px 5px;color:var(--ink);background:#fff}
.uc-logplan{background:#F2F5F7;border-left:2px solid var(--sig);padding:7px 10px;font-size:12.5px;
  line-height:1.45;margin-bottom:11px;color:#23292F}
.uc-lbl{display:block;font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--mid);margin-bottom:5px}
.uc-ta{width:100%;border:1px solid var(--rule);border-radius:3px;padding:10px;font-family:'IBM Plex Sans',sans-serif;
  font-size:14px;line-height:1.6;resize:vertical;background:#fff;color:var(--ink)}
.uc-ta:focus{outline:2px solid var(--sig);outline-offset:-1px;border-color:var(--sig)}
.uc-nums{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}
.uc-num-in{display:flex;align-items:center;border:1px solid var(--rule);border-radius:3px;background:#fff;padding:0 7px}
.uc-num-in input{flex:1;min-width:0;border:none;outline:none;padding:8px 0;font-family:'IBM Plex Mono',monospace;
  font-size:15px;background:none;color:var(--ink)}
.uc-num-in span{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--mid)}
.uc-num-in:focus-within{outline:2px solid var(--sig);outline-offset:-1px}
.uc-scale{margin-top:14px}
.uc-scale-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.uc-hint{font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--mid)}
.uc-pills{display:flex;gap:3px}
.uc-pill{flex:1;min-width:0;padding:7px 0;border:1px solid var(--rule);border-radius:3px;background:#fff;
  font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mid);cursor:pointer}
.uc-pill.on{color:#fff;font-weight:600}
.uc-pill:focus-visible{outline:2px solid var(--sig);outline-offset:1px}

.uc-chart{width:100%;height:auto;display:block;overflow:visible}
.uc-svg-ax{font-family:'IBM Plex Mono',monospace;font-size:9px;fill:#8A939C}
.uc-svg-ph{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:.06em;text-transform:uppercase;opacity:.8}

.uc-acc{background:var(--panel);border:1px solid var(--rule);border-radius:3px;margin-bottom:5px;overflow:hidden}
.uc-acc-h{width:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 13px;
  background:none;border:none;cursor:pointer;text-align:left;
  font-family:'IBM Plex Sans Condensed',sans-serif;font-weight:600;font-size:15px;color:var(--ink)}
.uc-acc-h.on{background:#F2F5F7;border-bottom:1px solid var(--rule)}
.uc-acc-h:focus-visible{outline:2px solid var(--sig);outline-offset:-2px}
.uc-acc-i{font-family:'IBM Plex Mono',monospace;font-size:16px;color:var(--sig);line-height:1}
.uc-acc-b{padding:13px}
.uc-sub{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--sig);margin:16px 0 7px}
.uc-acc-b>.uc-sub:first-child{margin-top:0}
.uc-ul,.uc-ol{margin:0 0 10px;padding-left:19px;font-size:13.5px;line-height:1.6;color:#23292F}
.uc-ul li,.uc-ol li{margin-bottom:6px}
.uc-tbl{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:6px}
.uc-tbl th{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--mid);text-align:left;padding:5px 7px;border-bottom:1px solid var(--rule);font-weight:500}
.uc-tbl td{padding:6px 7px;border-bottom:1px solid #EDF0F2;line-height:1.4}
.uc-tbl td:last-child{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--mid)}
.uc-tbl thead+tbody td:last-child{font-family:'IBM Plex Sans',sans-serif;font-size:12.5px}

.uc-toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:var(--ink);color:#fff;
  font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;
  padding:7px 14px;border-radius:3px;z-index:60}

@media(min-width:640px){
  .uc-title{font-size:32px}
  .uc-count-n{font-size:42px}
  .uc-strip-svg{height:64px}
  .uc-body{padding:18px 16px}
}
@media(prefers-reduced-motion:reduce){.uc-root *{transition:none!important;animation:none!important}}
`;
