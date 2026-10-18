"use strict";

/* ---------- Exercise library ---------- */
const EX = {
  "back-squat": { name: "Barbell Back Squat", muscles: ["Quads", "Glutes"], lower: true, gear: "Barbell + rack",
    cues: ["Take a big breath into your belly and brace before every rep.", "Let your knees travel forward and out over your toes.", "Go as deep as you can while keeping your back position, then drive the floor away."] },
  "goblet-squat": { name: "Goblet Squat", muscles: ["Quads", "Glutes"], lower: true, gear: "One dumbbell",
    cues: ["Hold the dumbbell vertically against your chest, elbows underneath.", "Sit straight down between your hips; elbows track inside your knees.", "Put small plates under your heels if your ankles are stiff."] },
  "split-squat-bw": { name: "Tempo Split Squat", muscles: ["Quads", "Glutes"], bw: true, reps: [10, 20], gear: "Bodyweight",
    cues: ["Take a long stance so both knees bend to about 90° at the bottom.", "Lower over three seconds; slow lowering is what makes bodyweight hard enough.", "Push through the front foot's whole sole to stand."] },
  "rdl": { name: "Romanian Deadlift", muscles: ["Hamstrings", "Glutes"], lower: true, gear: "Barbell",
    cues: ["Unlock your knees, then push your hips straight back.", "Keep the bar dragging along your thighs and shins.", "Stop when your hips stop moving back, usually around mid-shin, and stand by squeezing your glutes."] },
  "db-rdl": { name: "Dumbbell Romanian Deadlift", muscles: ["Hamstrings", "Glutes"], lower: true, gear: "Dumbbells",
    cues: ["Hold the dumbbells against the front of your thighs.", "Hinge at the hips with a long spine until you feel a strong hamstring stretch.", "Keep the weights close to your legs the whole way."] },
  "sl-hip-thrust": { name: "Single-Leg Hip Thrust", muscles: ["Glutes", "Hamstrings"], bw: true, reps: [10, 20], gear: "Bodyweight + couch",
    cues: ["Upper back on a couch edge, one foot flat under your knee.", "Tuck your chin and ribs, then drive your hips up until your torso is level.", "Pause one second at the top on every rep."] },
  "bss": { name: "Bulgarian Split Squat", muscles: ["Quads", "Glutes"], lower: true, gear: "Dumbbells + bench",
    cues: ["Rear foot laces-down on the bench, front foot far enough forward that your heel stays down.", "Drop your back knee straight down toward the floor.", "Lean your torso slightly forward to load the glutes more."] },
  "bss-bw": { name: "Bulgarian Split Squat (bodyweight)", muscles: ["Quads", "Glutes"], bw: true, reps: [8, 20], gear: "Bodyweight + chair",
    cues: ["Rear foot on a chair or couch.", "Lower for three seconds, pause at the bottom, stand up under control.", "Hold a filled backpack once you pass 20 reps."] },
  "leg-curl": { name: "Seated Leg Curl", muscles: ["Hamstrings"], gear: "Machine",
    cues: ["Set the pad just above your heels and the thigh pad snug.", "Lean your torso forward a little to stretch the hamstrings more.", "Lower over two to three seconds; don't let the stack touch down between reps."] },
  "slider-curl": { name: "Slider Leg Curl", muscles: ["Hamstrings", "Glutes"], bw: true, reps: [8, 15], gear: "Towel or sliders",
    cues: ["Lie on your back with heels on a towel on a smooth floor.", "Lift your hips and pull your heels toward your glutes.", "Slide back out slowly while keeping your hips off the floor."] },
  "leg-ext": { name: "Leg Extension", muscles: ["Quads"], gear: "Machine",
    cues: ["Line your knee up with the machine's pivot point.", "Kick up to full lockout and squeeze for a second.", "Lower until your knees are bent past 90°."] },
  "step-up": { name: "Dumbbell Step-Up", muscles: ["Quads", "Glutes"], gear: "Dumbbells + bench",
    cues: ["Use a box or bench about knee height.", "Drive through the top foot; don't push off the bottom one.", "Lower yourself slowly instead of dropping down."] },
  "heel-elev-squat": { name: "Heels-Elevated Squat", muscles: ["Quads"], bw: true, reps: [12, 25], gear: "Bodyweight + book",
    cues: ["Heels on a thick book or plate, feet narrow.", "Keep your torso upright and let your knees travel far forward.", "Take three seconds on the way down."] },
  "calf-machine": { name: "Standing Calf Raise", muscles: ["Calves"], gear: "Machine or Smith",
    cues: ["Pause for two seconds at the bottom stretch; no bouncing.", "Rise as high as you can onto your big toe.", "Keep your knees straight but not locked."] },
  "sl-calf": { name: "Single-Leg Calf Raise", muscles: ["Calves"], bw: true, reps: [10, 20], gear: "Step + optional dumbbell",
    cues: ["Stand on one foot on a step and hold a wall for balance.", "Drop your heel as low as it goes and pause.", "Hold a dumbbell once 20 reps is easy."] },
  "bench": { name: "Barbell Bench Press", muscles: ["Chest", "Triceps"], gear: "Barbell + bench",
    cues: ["Pinch your shoulder blades back and down, then keep them there.", "Lower to your lower chest with forearms vertical.", "Keep your feet planted and press the bar back toward your face slightly."] },
  "db-bench": { name: "Dumbbell Bench Press", muscles: ["Chest", "Triceps"], gear: "Dumbbells + bench",
    cues: ["Kick the dumbbells up off your knees as you lie back.", "Lower until you feel a deep chest stretch, elbows about 45° from your body.", "Press up and slightly together without clanging them."] },
  "push-up": { name: "Push-Up", muscles: ["Chest", "Triceps"], bw: true, reps: [8, 20], gear: "Bodyweight",
    cues: ["Hands just wider than your shoulders, body in one straight line.", "Tuck your elbows to about 45°.", "Touch your chest to a fist-height target on every rep."] },
  "incline-db": { name: "Incline Dumbbell Press", muscles: ["Chest", "Shoulders"], gear: "Dumbbells + incline bench",
    cues: ["Set the bench to about 30°; higher turns it into a shoulder press.", "Lower to your upper chest.", "Press up in a slight arc toward your eye line."] },
  "feet-elev-pushup": { name: "Feet-Elevated Push-Up", muscles: ["Chest", "Shoulders"], bw: true, reps: [8, 20], gear: "Bodyweight + chair",
    cues: ["Feet on a chair, hands on the floor.", "Keep your hips in line with your shoulders.", "Raise your feet higher to make it harder."] },
  "db-ohp": { name: "Seated Dumbbell Shoulder Press", muscles: ["Shoulders", "Triceps"], gear: "Dumbbells + bench",
    cues: ["Back supported, dumbbells at ear height with palms forward.", "Press straight up without arching your lower back.", "Lower until your elbows are just below your shoulders."] },
  "pike-pushup": { name: "Pike Push-Up", muscles: ["Shoulders", "Triceps"], bw: true, reps: [6, 15], gear: "Bodyweight",
    cues: ["Hips high so your body makes an upside-down V.", "Lower the top of your head toward a point in front of your hands.", "Elevate your feet to progress."] },
  "cs-row": { name: "Chest-Supported Row", muscles: ["Back", "Biceps"], gear: "Machine or incline bench",
    cues: ["Chest stays on the pad so your lower back doesn't do the work.", "Pull your elbows toward your hips.", "Let your shoulder blades spread forward at the bottom for a full stretch."] },
  "db-row": { name: "One-Arm Dumbbell Row", muscles: ["Back", "Biceps"], gear: "Dumbbell + bench",
    cues: ["One hand and knee on the bench, back flat.", "Row the dumbbell toward your back pocket.", "Lower all the way until your arm is straight."] },
  "inverted-row": { name: "Inverted Row", muscles: ["Back", "Biceps"], bw: true, reps: [8, 15], gear: "Sturdy table or rings",
    cues: ["Lie under a sturdy table and grip its edge.", "Keep your body straight and pull your chest to the edge.", "Walk your feet forward to make it easier."] },
  "pulldown": { name: "Lat Pulldown", muscles: ["Back", "Biceps"], gear: "Cable machine",
    cues: ["Grip slightly wider than your shoulders and lock your thighs under the pad.", "Pull your elbows down toward your back pockets.", "Let the bar rise until your arms are fully straight."] },
  "pullup": { name: "Pull-Up", muscles: ["Back", "Biceps"], bw: true, reps: [4, 10], gear: "Pull-up bar",
    cues: ["Start from a dead hang with your arms straight.", "Pull your chest toward the bar.", "Can't do 4 yet? Jump up and lower yourself over five seconds."] },
  "cable-lateral": { name: "Cable Lateral Raise", muscles: ["Shoulders"], gear: "Cable machine",
    cues: ["Stand side-on to the cable with the handle behind your leg.", "Raise out to the side, leading with your elbow.", "Stop at shoulder height and lower slowly."] },
  "db-lateral": { name: "Dumbbell Lateral Raise", muscles: ["Shoulders"], gear: "Dumbbells",
    cues: ["Lean forward slightly with a soft bend in your elbows.", "Raise the dumbbells out and slightly forward.", "Use a weight you can control for 10 or more clean reps."] },
  "band-lateral": { name: "Band Lateral Raise", muscles: ["Shoulders"], bw: true, reps: [12, 25], gear: "Resistance band",
    cues: ["Stand on the band and hold one end in each hand.", "Raise out to the sides until your arms are level with your shoulders.", "Pause at the top, where the band is hardest."] },
  "reverse-pec-deck": { name: "Reverse Pec Deck", muscles: ["Shoulders", "Back"], gear: "Machine",
    cues: ["Set the handles so your arms are level with your shoulders.", "Sweep your arms back in a wide arc.", "Keep your shoulder blades from pinching hard; let the rear delts do it."] },
  "db-rear-fly": { name: "Dumbbell Rear Delt Fly", muscles: ["Shoulders", "Back"], gear: "Dumbbells + bench",
    cues: ["Lie chest-down on an incline bench.", "Raise the dumbbells out wide with your pinkies leading.", "Use light weight and a full range."] },
  "band-pull-apart": { name: "Band Pull-Apart", muscles: ["Shoulders", "Back"], bw: true, reps: [15, 25], gear: "Resistance band",
    cues: ["Hold the band at shoulder height with straight arms.", "Pull it apart until it touches your chest.", "Return slowly."] },
  "incline-curl": { name: "Incline Dumbbell Curl", muscles: ["Biceps"], gear: "Dumbbells + incline bench",
    cues: ["Sit back on a 45–60° bench and let your arms hang straight.", "Curl without letting your elbows drift forward.", "Lower all the way; the stretched position does a lot of the work."] },
  "band-curl": { name: "Band Curl", muscles: ["Biceps"], bw: true, reps: [12, 25], gear: "Resistance band",
    cues: ["Stand on the band, palms forward.", "Keep your elbows pinned at your sides.", "Squeeze at the top and lower over two seconds."] },
  "cable-oh-ext": { name: "Overhead Cable Triceps Extension", muscles: ["Triceps"], gear: "Cable machine",
    cues: ["Face away from the cable with the rope behind your head.", "Keep your elbows pointing forward.", "Reach a deep stretch at the bottom, then lock out fully."] },
  "db-oh-ext": { name: "Overhead Dumbbell Extension", muscles: ["Triceps"], gear: "One dumbbell",
    cues: ["Hold one dumbbell with both hands overhead.", "Lower it behind your head with your elbows pointing up.", "Extend until your arms are straight."] },
  "close-pushup": { name: "Close-Grip Push-Up", muscles: ["Triceps", "Chest"], bw: true, reps: [8, 20], gear: "Bodyweight",
    cues: ["Hands under your shoulders.", "Elbows brush your ribs on the way down.", "Do them with hands on a bench if the floor is too hard."] },
  "cable-crunch": { name: "Cable Crunch", muscles: ["Core"], gear: "Cable machine",
    cues: ["Kneel and hold the rope beside your head.", "Curl your ribs toward your pelvis; don't just bow at the hips.", "Hold the squeezed position for a second."] },
  "dead-bug": { name: "Dead Bug", muscles: ["Core"], bw: true, reps: [8, 15], gear: "Bodyweight",
    cues: ["Lie on your back with arms up and knees over hips.", "Press your lower back into the floor and keep it there.", "Extend the opposite arm and leg slowly; reps are per side."] },
};

const PICK = {
  squat: { gym: "back-squat", db: "goblet-squat", bw: "split-squat-bw" },
  hinge: { gym: "rdl", db: "db-rdl", bw: "sl-hip-thrust" },
  lunge: { gym: "bss", db: "bss", bw: "bss-bw" },
  kneeFlex: { gym: "leg-curl", db: "slider-curl", bw: "slider-curl" },
  quadIso: { gym: "leg-ext", db: "step-up", bw: "heel-elev-squat" },
  calf: { gym: "calf-machine", db: "sl-calf", bw: "sl-calf" },
  hPush: { gym: "bench", db: "db-bench", bw: "push-up" },
  inclinePush: { gym: "incline-db", db: "incline-db", bw: "feet-elev-pushup" },
  vPush: { gym: "db-ohp", db: "db-ohp", bw: "pike-pushup" },
  hPull: { gym: "cs-row", db: "db-row", bw: "inverted-row" },
  vPull: { gym: "pulldown", db: "pullup", bw: "pullup" },
  lateral: { gym: "cable-lateral", db: "db-lateral", bw: "band-lateral" },
  rearDelt: { gym: "reverse-pec-deck", db: "db-rear-fly", bw: "band-pull-apart" },
  biceps: { gym: "incline-curl", db: "incline-curl", bw: "band-curl" },
  triceps: { gym: "cable-oh-ext", db: "db-oh-ext", bw: "close-pushup" },
  core: { gym: "cable-crunch", db: "dead-bug", bw: "dead-bug" },
};
const ISOLATION = new Set(["kneeFlex", "quadIso", "calf", "lateral", "rearDelt", "biceps", "triceps", "core"]);
const MUSCLES = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Quads", "Glutes", "Hamstrings", "Calves", "Core"];
const EQUIP_LABEL = { gym: "Full gym", db: "Dumbbells", bw: "Bodyweight" };

const SPLITS = {
  3: { name: "Full Body", days: [
    { key: "fbA", name: "Full Body A", slots: ["squat", "hPush", "hPull", "kneeFlex", "lateral", "biceps"] },
    { key: "fbB", name: "Full Body B", slots: ["hinge", "inclinePush", "vPull", "lunge", "rearDelt", "triceps"] },
    { key: "fbC", name: "Full Body C", slots: ["squat", "vPush", "hPull", "hinge", "calf", "core"] },
  ] },
  4: { name: "Upper / Lower", days: [
    { key: "upA", name: "Upper A", slots: ["hPush", "hPull", "vPush", "vPull", "lateral", "triceps"] },
    { key: "loA", name: "Lower A", slots: ["squat", "hinge", "quadIso", "calf", "core"] },
    { key: "upB", name: "Upper B", slots: ["inclinePush", "vPull", "hPull", "lateral", "rearDelt", "biceps"] },
    { key: "loB", name: "Lower B", slots: ["hinge", "lunge", "kneeFlex", "quadIso", "calf"] },
  ] },
  5: { name: "Upper / Lower / Push / Pull / Legs", days: [
    { key: "up", name: "Upper", slots: ["hPush", "hPull", "vPush", "vPull", "biceps", "triceps"] },
    { key: "lo", name: "Lower", slots: ["squat", "hinge", "quadIso", "calf", "core"] },
    { key: "push", name: "Push", slots: ["inclinePush", "vPush", "lateral", "triceps", "core"] },
    { key: "pull", name: "Pull", slots: ["vPull", "hPull", "rearDelt", "biceps"] },
    { key: "legs", name: "Legs", slots: ["lunge", "hinge", "kneeFlex", "quadIso", "calf"] },
  ] },
};

function buildProgram(p) {
  const split = SPLITS[p.days];
  const beg = p.level === "beginner";
  const days = split.days.map((d) => ({
    key: d.key, name: d.name,
    slots: d.slots.map((pattern, i) => {
      const id = PICK[pattern][p.equip];
      const ex = EX[id];
      const iso = ISOLATION.has(pattern);
      const main = i === 0;
      const sets = iso ? (beg ? 2 : 3) : (main && !beg ? 4 : 3);
      let reps = main ? (beg ? [8, 12] : [6, 10]) : iso ? [10, 15] : [8, 12];
      if (ex.reps) reps = ex.reps;
      const rir = iso ? (beg ? "1–2" : "0–1") : (beg ? "2–3" : "1–2");
      const rest = iso ? 75 : main ? 150 : 120;
      return { pattern, id, sets, reps, rir, rest, iso };
    }),
  }));
  return { name: split.name, days };
}

/* ---------- State ---------- */
const LS_KEY = "overload.v1";
const KG_PER_LB = 0.45359237;
let S;
let ui = { tab: "plan", day: null, libQuery: "", libMuscle: "", trendEx: null, confirm: null };

function isoDate(d) { const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return z.toISOString().slice(0, 10); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return isoDate(d); }
function parseDate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }

function defaults() {
  return {
    v: 1, unit: "kg",
    profile: { goal: "build", level: "intermediate", equip: "gym", days: 4 },
    body: { sex: "male", age: 28, heightCm: 178, activity: 1.55 },
    sessions: [], weights: [], drafts: {},
    deleted: {}, settingsAt: 0,
  };
}

function seedExamples(st) {
  const prog = buildProgram(st.profile);
  const base = { bench: 70, "cs-row": 55, "db-ohp": 22, pulldown: 60, "cable-lateral": 7.5, "cable-oh-ext": 22.5,
    "back-squat": 90, rdl: 85, "leg-ext": 50, "calf-machine": 70, "cable-crunch": 35, "incline-db": 26,
    "reverse-pec-deck": 35, "incline-curl": 12, bss: 18, "leg-curl": 40 };
  const plan = [[10, 0, 0], [9, 1, 0], [7, 2, 0], [6, 3, 0], [3, 0, 1], [2, 1, 1]];
  st.sessions = plan.map(([ago, di, k], n) => {
    const day = prog.days[di];
    return {
      id: "ex" + n, date: daysAgo(ago), dayKey: day.key, dayName: day.name, example: true,
      exercises: day.slots.map((s, i) => ({
        id: s.id,
        sets: Array.from({ length: s.sets }, (_, j) => {
          const [lo, hi] = s.reps;
          let r = hi - 1 - (j >= 2 ? 1 : 0) + k;
          if (k === 1 && i === 0 && day.key === "loA") r = hi;
          return { kg: base[s.id] || 20, reps: Math.max(lo, Math.min(hi, r)) };
        }),
      })),
    };
  });
  st.weights = [[35, 76.6], [28, 76.9], [21, 77.0], [14, 77.3], [7, 77.4], [1, 77.7]]
    .map(([ago, kg]) => ({ date: daysAgo(ago), kg, example: true }));
  return st;
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const st = Object.assign(defaults(), JSON.parse(raw));
      if (!Array.isArray(st.sessions) || !Array.isArray(st.weights)) throw new Error("bad");
      return st;
    }
  } catch (e) { /* fall through to a fresh state */ }
  return seedExamples(defaults());
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
/* Saves a change that should reach the user's other devices. */
function persist(settingsChanged) {
  if (settingsChanged) S.settingsAt = Date.now();
  save();
  queueSync();
}

/* ---------- Units & formatting ---------- */
function toDisp(kg) { return S.unit === "kg" ? kg : kg / KG_PER_LB; }
function fromDisp(v, unit = S.unit) { return unit === "kg" ? v : v * KG_PER_LB; }
function fmtW(kg) { const v = toDisp(kg); return String(Math.round(v * 2) / 2).replace(/\.0$/, ""); }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function fmtRest(sec) { return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0"); }
function fmtDate(s) { return parseDate(s).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }
function shortDate(s) { return parseDate(s).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }

/* ---------- Training logic ---------- */
const program = () => buildProgram(S.profile);
const sessionsDesc = () => [...S.sessions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

function lastFor(exId) {
  for (const s of sessionsDesc()) {
    const e = s.exercises.find((x) => x.id === exId);
    if (e && e.sets.length) return { session: s, sets: e.sets };
  }
  return null;
}

function nextDayKey(prog) {
  const keys = prog.days.map((d) => d.key);
  const last = sessionsDesc().find((s) => keys.includes(s.dayKey));
  return last ? keys[(keys.indexOf(last.dayKey) + 1) % keys.length] : keys[0];
}

function increment(ex, slot) {
  const kg = S.unit === "kg";
  if (slot.iso) return kg ? 1 : 2.5;
  return ex.lower ? (kg ? 5 : 10) : (kg ? 2.5 : 5);
}

/* Double progression: work up to the top of the rep range on every set, then add load. */
function suggest(slot) {
  const ex = EX[slot.id];
  const [lo, hi] = slot.reps;
  const last = lastFor(slot.id);
  const unit = S.unit;
  if (!last) {
    return { tone: "new", w: ex.bw ? 0 : null, r: lo,
      title: "First session",
      text: ex.bw ? `Use bodyweight. Aim for ${lo}–${hi} reps with ${slot.rir} left in the tank.`
        : `Pick a weight you could lift about ${hi + 2} times, then do ${lo}–${hi} reps.` };
  }
  const topKg = Math.max(...last.sets.map((s) => s.kg));
  const topSets = last.sets.filter((s) => s.kg === topKg);
  const reps = topSets.map((s) => s.reps);
  const ex_ = last.session.example ? " (example)" : "";
  const lastTxt = `${fmtW(topKg)} ${unit} × ${reps.join(", ")}${ex_}`;
  if (reps.length >= slot.sets && reps.every((r) => r >= hi)) {
    if (ex.bw) {
      return { tone: "up", w: toDisp(topKg), r: lo, last: lastTxt, title: "Make it harder",
        text: "You hit the top of the range on every set. Add load (a backpack or dumbbell) or slow the lowering to 3–4 seconds." };
    }
    const next = Math.round((toDisp(topKg) + increment(ex, slot)) * 2) / 2;
    return { tone: "up", w: next, r: lo, last: lastTxt, title: `Go up to ${String(next).replace(/\.0$/, "")} ${unit}`,
      text: `Every set reached ${hi}. Start back at ${lo}+ reps with the new weight.` };
  }
  if (reps.some((r) => r < lo)) {
    return { tone: "hold", w: toDisp(topKg), r: lo, last: lastTxt, title: `Stay at ${fmtW(topKg)} ${unit}`,
      text: `Some sets fell below ${lo}. Repeat the weight; if it happens again, drop 5–10%.` };
  }
  const best = Math.min(hi, Math.max(...reps) + 1);
  return { tone: "hold", w: toDisp(topKg), r: best, last: lastTxt, title: `Beat last time at ${fmtW(topKg)} ${unit}`,
    text: `Add a rep to at least one set. Move up once every set reaches ${hi}.` };
}

function e1rm(kg, reps) { return reps <= 0 ? 0 : kg * (1 + Math.min(reps, 12) / 30); }

function weeklySets(prog) {
  const out = Object.fromEntries(MUSCLES.map((m) => [m, 0]));
  prog.days.forEach((d) => d.slots.forEach((s) => EX[s.id].muscles.forEach((m) => { out[m] += s.sets; })));
  return out;
}
function loggedSetsLast7() {
  const cutoff = daysAgo(6);
  const out = Object.fromEntries(MUSCLES.map((m) => [m, 0]));
  S.sessions.filter((s) => s.date >= cutoff).forEach((s) =>
    s.exercises.forEach((e) => EX[e.id] && EX[e.id].muscles.forEach((m) => { out[m] += e.sets.length; })));
  return out;
}

/* ---------- Shared view pieces ---------- */
function seg(action, key, value, options) {
  return `<div class="seg" role="group">${options.map(([v, label]) =>
    `<button type="button" data-action="${action}" data-key="${key}" data-val="${v}" aria-pressed="${String(v) === String(value)}">${label}</button>`).join("")}</div>`;
}
function field(label, inner) { return `<div class="field-group"><span class="label">${label}</span>${inner}</div>`; }

function volumeBars(map) {
  const max = Math.max(24, ...Object.values(map));
  const pct = (v) => (v / max) * 100;
  return `<div class="bars">${MUSCLES.map((m) => `
    <div class="bar-row"><span>${m}</span>
      <div class="bar-track"><div class="bar-zone" style="left:${pct(10)}%;width:${pct(10)}%"></div>
      <div class="bar-fill" style="width:${pct(map[m])}%"></div></div>
      <span class="num">${map[m]}</span></div>`).join("")}</div>
    <div class="legend"><span>Hard sets per week</span><span class="zone">10–20 set range</span></div>`;
}

function lineChart(points, unitLabel) {
  if (points.length < 2) return `<div class="empty">Log at least two entries to see a trend.</div>`;
  const W = 600, H = 210, L = 46, R = 14, T = 14, B = 26;
  const xs = points.map((p) => parseDate(p.date).getTime());
  const ys = points.map((p) => p.y);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = Math.max((y1 - y0) * 0.15, 0.5); y0 -= pad; y1 += pad;
  const x0 = xs[0], x1 = xs[xs.length - 1] === x0 ? x0 + 1 : xs[xs.length - 1];
  const X = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R);
  const Y = (y) => T + (1 - (y - y0) / (y1 - y0)) * (H - T - B);
  const ticks = [0, 0.5, 1].map((f) => y0 + f * (y1 - y0));
  const path = points.map((p, i) => `${i ? "L" : "M"}${X(xs[i]).toFixed(1)},${Y(p.y).toFixed(1)}`).join("");
  const area = `${path}L${X(xs[xs.length - 1]).toFixed(1)},${H - B}L${X(xs[0]).toFixed(1)},${H - B}Z`;
  const last = points.length - 1;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend in ${unitLabel}">
    ${ticks.map((t) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="axis" x="${L - 8}" y="${Y(t) + 4}" text-anchor="end">${(Math.round(t * 10) / 10).toFixed(1)}</text>`).join("")}
    <path class="area" d="${area}"/><path class="line" d="${path}"/>
    ${points.map((p, i) => i === last ? "" : `<circle class="dot" cx="${X(xs[i])}" cy="${Y(p.y)}" r="3"/>`).join("")}
    <circle class="end" cx="${X(xs[last])}" cy="${Y(points[last].y)}" r="5"/>
    <text class="axis" x="${L}" y="${H - 6}">${shortDate(points[0].date)}</text>
    <text class="axis" x="${W - R}" y="${H - 6}" text-anchor="end">${shortDate(points[last].date)}</text>
  </svg>`;
}

/* ---------- Views ---------- */
const GOAL_NOTE = {
  lose: ["Keep lifting heavy while you diet", "Heavy training is the signal that keeps your muscle in a deficit. Add 8,000–10,000 daily steps instead of long cardio sessions."],
  build: ["Gain slowly", "Aim to gain 0.25–0.5% of your body weight per week. Gaining faster mostly adds fat."],
  recomp: ["Eat near maintenance", "High protein at maintenance calories lets beginners and returning lifters lose fat and gain muscle at the same time."],
};

function viewPlan() {
  const p = S.profile, prog = program();
  const g = GOAL_NOTE[p.goal];
  return `
  <section class="block">
    <h2 class="h">Your program</h2>
    <p class="lede">Choose a goal, experience level, equipment and schedule. The plan, rep targets and weight suggestions update as you change them.</p>
    <div class="form-grid">
      ${field("Goal", seg("profile", "goal", p.goal, [["lose", "Lose fat"], ["build", "Build muscle"], ["recomp", "Recomp"]]))}
      ${field("Experience", seg("profile", "level", p.level, [["beginner", "Beginner"], ["intermediate", "Intermediate"]]))}
      ${field("Equipment", seg("profile", "equip", p.equip, [["gym", "Full gym"], ["db", "Dumbbells"], ["bw", "Bodyweight"]]))}
      ${field("Days per week", seg("profile", "days", p.days, [[3, "3 days"], [4, "4 days"], [5, "5 days"]]))}
    </div>
  </section>
  <section class="block">
    <div class="spread"><h2 class="h">${prog.name}</h2><span class="muted">${p.days} days · ${EQUIP_LABEL[p.equip]} · 8-week block</span></div>
    ${prog.days.map((d, i) => `
      <div class="card day">
        <div class="day-head"><span class="h3">${d.name}</span><span class="label">Day ${i + 1}</span></div>
        ${d.slots.map((s) => `
          <div class="ex-line"><span class="name">${EX[s.id].name}</span>
            <span class="rx">${s.sets} × ${s.reps[0]}–${s.reps[1]}</span>
            <span class="meta">${s.rir} reps in reserve · rest ${fmtRest(s.rest)} · ${EX[s.id].muscles.join(", ")}</span></div>`).join("")}
      </div>`).join("")}
    <div class="row"><button class="btn primary" data-action="tab" data-tab="train">Start training</button></div>
  </section>
  <section class="block">
    <h2 class="h">Weekly volume</h2>
    <p class="lede">Hard sets this plan gives each muscle per week. Compound lifts count toward both muscles they train most.</p>
    <div class="card">${volumeBars(weeklySets(prog))}</div>
  </section>
  <section class="block">
    <h2 class="h">How it works</h2>
    <div class="principles">
      <div class="principle"><b>Progressive overload</b><p>Each exercise has a rep range. When every set reaches the top of it, add weight and work back up. The Train tab does this for you.</p></div>
      <div class="principle"><b>Effort</b><p>End most sets with 1–3 reps left in reserve (RIR). Isolation moves can go closer to failure than heavy compound lifts.</p></div>
      <div class="principle"><b>Volume</b><p>About 10–20 hard sets per muscle per week works for most people. Beginners grow well at the low end.</p></div>
      <div class="principle"><b>Rest</b><p>Rest 2–3 minutes on big lifts and 60–90 seconds on small ones. Short rests on compound lifts cost you reps.</p></div>
      <div class="principle"><b>Deload</b><p>Every 6–8 weeks, or when your lifts drop two sessions in a row, train for one week with half the sets.</p></div>
      <div class="principle"><b>${g[0]}</b><p>${g[1]}</p></div>
    </div>
  </section>
  <section class="block">
    <h2 class="h">Settings</h2>
    ${viewAccount()}
    <div class="card">
      ${field("Units", seg("unit", "unit", S.unit, [["kg", "Kilograms"], ["lb", "Pounds"]]))}
      ${viewInstall()}
      <div class="field-group"><span class="label">Backup</span>
        <p class="muted">${Sync.user ? "Your data is saved to your account. You can also copy a backup as text." : "Your data stays in this browser. Copy a backup to keep it safe or move it to another device."}</p>
        <div class="row"><button class="btn small" data-action="copy-backup">Copy backup</button></div>
        <textarea class="backup" id="restore-text" placeholder="Paste a backup here to restore it"></textarea>
        <div class="row"><button class="btn small" data-action="restore">Restore backup</button>
          ${ui.confirm === "reset"
            ? `<button class="btn small danger" data-action="reset-yes">Yes, erase everything</button><button class="btn small ghost" data-action="cancel">Keep my data</button>`
            : `<button class="btn small ghost danger" data-action="reset">${Sync.user ? "Erase all data on every device" : "Erase all data"}</button>`}</div>
      </div>
    </div>
  </section>`;
}

function viewTrain() {
  const prog = program();
  const next = nextDayKey(prog);
  if (!ui.day || !prog.days.some((d) => d.key === ui.day)) ui.day = next;
  const day = prog.days.find((d) => d.key === ui.day);
  const draft = S.drafts[day.key] || {};
  return `
  <section class="block">
    <h2 class="h">Today's workout</h2>
    <div class="day-pick" role="group" aria-label="Workout day">
      ${prog.days.map((d) => `<button type="button" data-action="pick-day" data-day="${d.key}" aria-pressed="${d.key === day.key}">
        <span class="${d.key === next ? "next" : ""}">${d.key === next ? "Next up" : "Day " + (prog.days.indexOf(d) + 1)}</span><b>${d.name}</b></button>`).join("")}
    </div>
    <p class="lede">Tap ✓ to log a set and start your rest timer. Empty fields use the suggested numbers.</p>
  </section>
  ${day.slots.map((s) => {
    const ex = EX[s.id], sg = suggest(s);
    const rows = draft[s.id] || [];
    const n = Math.max(s.sets, rows.length);
    const wPh = sg.w == null ? "" : String(Math.round(sg.w * 2) / 2);
    return `
    <section class="card exercise" data-ex="${s.id}">
      <div class="ex-top"><span class="h3">${ex.name}</span><span class="chip">${ex.gear}</span></div>
      <div class="rx-line">${s.sets} × ${s.reps[0]}–${s.reps[1]} · ${s.rir} RIR · rest ${fmtRest(s.rest)}</div>
      <div class="hint ${sg.tone}">${sg.last ? `<span class="muted">Last time: <span class="num">${esc(sg.last)}</span></span>` : ""}<b>${sg.title}</b><span>${sg.text}</span></div>
      <div class="sets">
        ${Array.from({ length: n }, (_, i) => {
          const r = rows[i] || {};
          return `<div class="setrow ${r.done ? "is-done" : ""}" data-i="${i}">
            <span class="setno">${i + 1}</span>
            <label class="inp"><input id="w-${s.id}-${i}" inputmode="decimal" autocomplete="off" aria-label="Set ${i + 1} weight" data-bind="w" data-ex="${s.id}" data-i="${i}" value="${esc(r.w ?? "")}" placeholder="${wPh}"><span>${ex.bw ? "+" + S.unit : S.unit}</span></label>
            <label class="inp"><input id="r-${s.id}-${i}" inputmode="numeric" autocomplete="off" aria-label="Set ${i + 1} reps" data-bind="r" data-ex="${s.id}" data-i="${i}" value="${esc(r.r ?? "")}" placeholder="${sg.r}"><span>reps</span></label>
            <button type="button" class="check" data-action="done" data-ex="${s.id}" data-i="${i}" data-rest="${s.rest}" aria-pressed="${!!r.done}" aria-label="Log set ${i + 1}">✓</button>
          </div>`;
        }).join("")}
      </div>
      <div class="spread">
        <details class="cues"><summary>Form cues</summary><ul>${ex.cues.map((c) => `<li>${c}</li>`).join("")}</ul></details>
        <button class="btn small ghost" data-action="add-set" data-ex="${s.id}">+ Add set</button>
      </div>
    </section>`;
  }).join("")}
  <section class="block">
    <div class="sticky-actions">
      <button class="btn primary" data-action="finish">Finish ${day.name}</button>
      ${ui.confirm === "discard"
        ? `<button class="btn danger" data-action="discard-yes">Yes, clear it</button><button class="btn ghost" data-action="cancel">Keep logging</button>`
        : `<button class="btn ghost" data-action="discard">Clear workout</button>`}
    </div>
  </section>`;
}

function viewProgress() {
  const hasEx = S.sessions.some((s) => s.example) || S.weights.some((w) => w.example);
  const cutoff = daysAgo(6);
  const recent = S.sessions.filter((s) => s.date >= cutoff);
  const setsWeek = recent.reduce((a, s) => a + s.exercises.reduce((b, e) => b + e.sets.length, 0), 0);
  const weights = [...S.weights].sort((a, b) => (a.date < b.date ? -1 : 1));
  const wPts = weights.map((w) => ({ date: w.date, y: toDisp(w.kg) }));
  const last7 = weights.filter((w) => w.date >= cutoff);
  const avg7 = last7.length ? toDisp(last7.reduce((a, w) => a + w.kg, 0) / last7.length) : null;
  const change = weights.length > 1 ? toDisp(weights[weights.length - 1].kg - weights[0].kg) : null;

  const trained = [...new Set(S.sessions.flatMap((s) => s.exercises.map((e) => e.id)))].filter((id) => EX[id]);
  if (!ui.trendEx || !trained.includes(ui.trendEx)) ui.trendEx = trained[0] || null;
  const trendPts = ui.trendEx ? [...S.sessions].sort((a, b) => (a.date < b.date ? -1 : 1)).flatMap((s) => {
    const e = s.exercises.find((x) => x.id === ui.trendEx);
    if (!e || !e.sets.length) return [];
    return [{ date: s.date, y: toDisp(Math.max(...e.sets.map((x) => e1rm(x.kg, x.reps)))) }];
  }) : [];

  return `
  ${hasEx ? `<div class="banner"><p>These are example entries so you can see how tracking works. They're removed when you log your first workout or weigh-in.</p><button class="btn small" data-action="clear-examples">Remove examples</button></div>` : ""}
  <section class="block">
    <h2 class="h">Last 7 days</h2>
    <div class="tiles">
      <div class="tile"><span class="label">Workouts</span><span class="num">${recent.length}<span class="muted"> / ${S.profile.days}</span></span></div>
      <div class="tile"><span class="label">Hard sets</span><span class="num">${setsWeek}</span></div>
      <div class="tile"><span class="label">All-time</span><span class="num">${S.sessions.length}</span></div>
    </div>
    <div class="card">${volumeBars(loggedSetsLast7())}</div>
  </section>
  <section class="block">
    <h2 class="h">Body weight</h2>
    <div class="card">
      <div class="kv">
        <div><span class="label">7-day average</span><div class="num" style="font-size:22px">${avg7 == null ? "–" : avg7.toFixed(1) + " " + S.unit}</div></div>
        <div><span class="label">Change since first entry</span><div class="num" style="font-size:22px">${change == null ? "–" : (change >= 0 ? "+" : "") + change.toFixed(1) + " " + S.unit}</div></div>
      </div>
      ${lineChart(wPts, S.unit)}
      <form class="inline-form" data-form="weigh">
        <label class="inp"><input id="weigh-in" inputmode="decimal" autocomplete="off" aria-label="Today's body weight" placeholder="Today's weight"><span>${S.unit}</span></label>
        <button class="btn primary" type="submit">Log weigh-in</button>
      </form>
      <p class="muted" style="font-size:14px">Weigh in each morning after the bathroom. Daily numbers swing 1–2 ${S.unit === "kg" ? "kg" : "lb"}; the weekly average is what counts.</p>
    </div>
  </section>
  <section class="block">
    <h2 class="h">Strength trend</h2>
    <div class="card">
      ${trained.length ? `<select class="sel" id="trend-ex" data-bind="trend" aria-label="Exercise">${trained.map((id) => `<option value="${id}" ${id === ui.trendEx ? "selected" : ""}>${EX[id].name}</option>`).join("")}</select>
      <p class="muted" style="font-size:14px">Estimated one-rep max (${S.unit}) from your best set each session.</p>
      ${lineChart(trendPts, S.unit)}` : `<div class="empty">Finish a workout to start tracking strength.</div>`}
    </div>
  </section>
  <section class="block">
    <h2 class="h">History</h2>
    ${S.sessions.length ? `<div class="card history">${sessionsDesc().map((s) => {
      const sets = s.exercises.reduce((a, e) => a + e.sets.length, 0);
      return `<div class="hist-row">
        <div><b>${esc(s.dayName)}</b>${s.example ? `<span class="tag">Example</span>` : ""}
        <div class="meta">${fmtDate(s.date)} · ${s.exercises.length} exercises · ${sets} sets</div></div>
        ${ui.confirm === "del:" + s.id
          ? `<div class="row"><button class="btn small danger" data-action="del-yes" data-id="${esc(s.id)}">Delete</button><button class="btn small ghost" data-action="cancel">Keep</button></div>`
          : `<button class="btn small ghost" data-action="del" data-id="${esc(s.id)}" aria-label="Delete workout">Remove</button>`}
      </div>`;
    }).join("")}</div>` : `<div class="empty">No workouts yet. Open the Train tab to log your first one.</div>`}
  </section>`;
}

function nutrition() {
  const b = S.body, p = S.profile;
  const latest = [...S.weights].sort((a, c) => (a.date < c.date ? 1 : -1))[0];
  const kg = b.weightKg || (latest ? latest.kg : 75);
  const bmr = 10 * kg + 6.25 * b.heightCm - 5 * b.age + (b.sex === "male" ? 5 : -161);
  const tdee = bmr * b.activity;
  const cal = p.goal === "lose" ? tdee * 0.8 : p.goal === "build" ? tdee * 1.1 : tdee;
  const protein = kg * (p.goal === "lose" ? 2.2 : p.goal === "build" ? 1.8 : 2.0);
  const fat = Math.max((cal * 0.25) / 9, kg * 0.6);
  const carbs = Math.max(0, (cal - protein * 4 - fat * 9) / 4);
  return { kg, tdee, cal, protein, fat, carbs };
}

function viewFuel() {
  const b = S.body, p = S.profile, n = nutrition();
  const r = (x) => Math.round(x);
  const rate = p.goal === "lose" ? [0.005, 0.01] : p.goal === "build" ? [0.0025, 0.005] : null;
  const pc = (n.protein * 4) / n.cal * 100, fc = (n.fat * 9) / n.cal * 100;
  const hDisp = S.unit === "kg" ? r(b.heightCm) : Math.round(b.heightCm / 2.54);
  return `
  <section class="block">
    <h2 class="h">Daily targets</h2>
    <p class="lede">Estimated with the Mifflin–St Jeor equation, then adjusted for your goal (${p.goal === "lose" ? "20% deficit" : p.goal === "build" ? "10% surplus" : "maintenance"}). Change your goal on the Plan tab.</p>
    <div class="card">
      <div class="macro-grid">
        <div class="macro"><span class="label">Calories</span><span class="num">${r(n.cal / 10) * 10}<small class="muted"> kcal</small></span></div>
        <div class="macro"><span class="label">Protein</span><span class="num">${r(n.protein)}<small class="muted"> g</small></span></div>
        <div class="macro"><span class="label">Fat</span><span class="num">${r(n.fat)}<small class="muted"> g</small></span></div>
        <div class="macro"><span class="label">Carbs</span><span class="num">${r(n.carbs)}<small class="muted"> g</small></span></div>
      </div>
      <div class="macro-bar" aria-hidden="true"><i style="width:${pc}%"></i><i style="width:${fc}%"></i><i style="width:${100 - pc - fc}%"></i></div>
      <div class="legend"><span>Protein</span><span class="c-fat">Fat</span><span class="c-carb">Carbs</span></div>
      <div class="kv">
        <div><span class="label">Maintenance</span><div class="num">${r(n.tdee / 10) * 10} kcal</div></div>
        <div><span class="label">Target rate</span><div class="num">${rate ? `${p.goal === "lose" ? "−" : "+"}${toDisp(n.kg * rate[0]).toFixed(2)} to ${toDisp(n.kg * rate[1]).toFixed(2)} ${S.unit}/wk` : "Hold steady"}</div></div>
      </div>
    </div>
  </section>
  <section class="block">
    <h2 class="h">About you</h2>
    <div class="card">
      <div class="form-grid">
        ${field("Sex", seg("body", "sex", b.sex, [["male", "Male"], ["female", "Female"]]))}
        ${field("Activity outside training", seg("body", "activity", b.activity, [[1.35, "Desk job"], [1.55, "On my feet"], [1.75, "Physical job"]]))}
        <div class="field-group"><span class="label">Age</span><label class="inp"><input id="age" inputmode="numeric" data-bind="age" value="${b.age}"><span>yrs</span></label></div>
        <div class="field-group"><span class="label">Height</span><label class="inp"><input id="height" inputmode="decimal" data-bind="height" value="${hDisp}"><span>${S.unit === "kg" ? "cm" : "in"}</span></label></div>
        <div class="field-group"><span class="label">Weight</span><label class="inp"><input id="bw" inputmode="decimal" data-bind="bodyweight" value="${toDisp(n.kg).toFixed(1)}"><span>${S.unit}</span></label></div>
      </div>
    </div>
  </section>
  <section class="block">
    <h2 class="h">Adjusting</h2>
    <div class="principles">
      <div class="principle"><b>Check every two weeks</b><p>Compare your weekly average body weight with the target rate. If it hasn't moved the right way after two weeks, change calories by 100–200 kcal.</p></div>
      <div class="principle"><b>Protein first</b><p>Spread protein over 3–5 meals of roughly 0.4 g per kg of body weight each. Hit this number every day, even when calories run over.</p></div>
      <div class="principle"><b>Estimates, not rules</b><p>Equations can be off by 10% or more. Your scale trend tells you your real maintenance after 2–3 weeks.</p></div>
    </div>
  </section>`;
}

function viewLibrary() {
  const q = ui.libQuery.trim().toLowerCase();
  const usedIn = (id) => Object.keys(EQUIP_LABEL).filter((eq) => Object.values(PICK).some((p) => p[eq] === id)).map((eq) => EQUIP_LABEL[eq]);
  const list = Object.entries(EX).filter(([, e]) =>
    (!ui.libMuscle || e.muscles.includes(ui.libMuscle)) && (!q || e.name.toLowerCase().includes(q) || e.muscles.join(" ").toLowerCase().includes(q)));
  return `
  <section class="block">
    <h2 class="h">Exercise library</h2>
    <input class="search" id="lib-search" type="search" data-bind="lib" placeholder="Search ${Object.keys(EX).length} exercises" value="${esc(ui.libQuery)}" aria-label="Search exercises">
    <div class="chips"><button class="chip ${!ui.libMuscle ? "on" : ""}" data-action="lib-muscle" data-val="">All</button>
      ${MUSCLES.map((m) => `<button class="chip ${ui.libMuscle === m ? "on" : ""}" data-action="lib-muscle" data-val="${m}">${m}</button>`).join("")}</div>
    <div class="lib" id="lib-list">
      ${list.length ? list.map(([id, e]) => `
        <details><summary><b>${e.name}</b><span class="muted" style="font-size:14px">${e.muscles.join(" · ")}</span></summary>
          <div class="body"><div class="chips"><span class="chip">${e.gear}</span>${usedIn(id).map((u) => `<span class="chip on">${u} plan</span>`).join("")}</div>
          <ul class="lib-cues">${e.cues.map((c) => `<li>${c}</li>`).join("")}</ul></div></details>`).join("")
        : `<div class="empty">No exercises match “${esc(ui.libQuery)}”.</div>`}
    </div>
  </section>`;
}

const VIEWS = { plan: viewPlan, train: viewTrain, progress: viewProgress, fuel: viewFuel, library: viewLibrary };

function render() {
  document.querySelectorAll("nav.tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === ui.tab)));
  document.getElementById("main").innerHTML = VIEWS[ui.tab]();
}

/* ---------- Rest timer & toast ---------- */
const T = { end: 0, dur: 0, iv: null, ac: null };
function startRest(sec) {
  try { T.ac = T.ac || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { /* no audio */ }
  T.dur = sec; T.end = Date.now() + sec * 1000;
  document.getElementById("timer").hidden = false;
  clearInterval(T.iv); T.iv = setInterval(tick, 250); tick();
}
function tick() {
  const left = Math.max(0, T.end - Date.now());
  const s = Math.ceil(left / 1000);
  document.getElementById("timer-t").textContent = fmtRest(s);
  document.getElementById("timer-bar").style.width = (100 - (left / (T.dur * 1000)) * 100) + "%";
  document.getElementById("timer-label").textContent = left > 0 ? "Rest before your next set" : "Rest done. Start your next set.";
  if (left <= 0) {
    clearInterval(T.iv); T.iv = null; beep();
    setTimeout(() => { if (!T.iv) document.getElementById("timer").hidden = true; }, 5000);
  }
}
function beep() {
  try {
    const ac = T.ac; if (!ac) return;
    [0, 0.25].forEach((t) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.0001, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.18);
      o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.2);
    });
  } catch (e) { /* ignore */ }
  try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { /* ignore */ }
}
let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ---------- Accounts & sync ---------- */
const Sync = { available: false, checked: false, user: null, status: "idle", lastAt: 0, timer: null, inflight: false, again: false };
let auth = { mode: "signin", error: "", busy: false, deleting: false, deleteError: "" };

async function api(route, opts = {}) {
  const res = await fetch("api/" + route, {
    method: opts.method || "GET",
    headers: opts.body ? { "Content-Type": "application/json" } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body */ }
  if (!res.ok) throw Object.assign(new Error((data && data.error) || "The server didn't respond as expected."), { status: res.status });
  return data;
}

function syncDoc() {
  return {
    sessions: S.sessions.filter((s) => !s.example),
    weights: S.weights.filter((w) => !w.example),
    deleted: S.deleted || {},
    settings: { unit: S.unit, profile: S.profile, body: S.body },
    settingsAt: S.settingsAt || 0,
  };
}

/* Merges a server document into local state, keeping any edits made while the request was in flight. */
function applyDoc(doc) {
  const local = syncDoc();
  const m = OverloadSync.merge(local, doc);
  S.sessions = m.sessions;
  S.weights = m.weights;
  S.deleted = m.deleted;
  if (m.settings && m.settingsAt > local.settingsAt) {
    if (m.settings.unit !== S.unit) convertUnit(m.settings.unit);
    S.profile = m.settings.profile;
    S.body = m.settings.body;
  }
  S.settingsAt = m.settingsAt;
  save();
}

function setSyncStatus(status) {
  Sync.status = status;
  const chip = document.getElementById("sync-chip");
  if (chip) {
    const text = { syncing: "Syncing…", ok: "Synced", offline: "Offline", error: "Sync failed" }[status];
    chip.hidden = !Sync.user || !text;
    chip.textContent = text || "";
    chip.dataset.state = status;
  }
  const line = document.getElementById("sync-line");
  if (line) line.textContent = syncLine();
}

function syncLine() {
  if (Sync.status === "syncing") return "Syncing…";
  if (Sync.status === "offline") return "You're offline. Changes will sync when you reconnect.";
  if (Sync.status === "error") return "Last sync failed. It will retry automatically.";
  if (!Sync.lastAt) return "Not synced yet.";
  const mins = Math.round((Date.now() - Sync.lastAt) / 60000);
  return mins < 1 ? "Synced just now." : `Synced ${mins} min ago.`;
}

function quietRender() {
  const a = document.activeElement;
  if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT")) return;
  render();
}

async function syncNow() {
  if (!Sync.user) return;
  if (Sync.inflight) { Sync.again = true; return; }
  Sync.inflight = true;
  setSyncStatus("syncing");
  try {
    const doc = await api("sync", { method: "PUT", body: syncDoc() });
    applyDoc(doc);
    Sync.lastAt = Date.now();
    setSyncStatus("ok");
    quietRender();
  } catch (e) {
    if (e.status === 401) { setAccount(null); setSyncStatus("idle"); quietRender(); toast("You were signed out. Sign in again to keep syncing."); }
    else setSyncStatus(navigator.onLine === false ? "offline" : "error");
  } finally {
    Sync.inflight = false;
    if (Sync.again) { Sync.again = false; syncNow(); }
  }
}

function queueSync() {
  if (!Sync.user) return;
  clearTimeout(Sync.timer);
  Sync.timer = setTimeout(syncNow, 1200);
}

function setAccount(email) {
  Sync.user = email;
  S.account = email;
  save();
}

/* Checks the server and session. Offline, a remembered account stays signed in
   so the installed app works without a connection and syncs once it's back. */
async function connect() {
  let reachable = false;
  try { await api("health"); reachable = true; } catch (e) { /* offline or no server */ }
  if (reachable) {
    Sync.available = true;
    try { setAccount((await api("me")).email || null); } catch (e) { /* keep the remembered account */ }
  } else if (S.account) {
    Sync.available = true;
    Sync.user = S.account;
    setSyncStatus("offline");
  }
  Sync.checked = true;
  quietRender();
  if (reachable && Sync.user) syncNow();
}

// Static copies (opened from disk or hosted without the server) mark themselves device-only.
const DEVICE_ONLY = !location.protocol.startsWith("http") || !!document.querySelector('meta[name="overload:device-only"]');

function initSync() {
  if (DEVICE_ONLY) { Sync.checked = true; return; }
  connect();
  window.addEventListener("online", () => connect());
  window.addEventListener("offline", () => { if (Sync.user) setSyncStatus("offline"); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") syncNow(); });
}

function viewAccount() {
  if (!Sync.checked) return "";
  if (!Sync.available) {
    return `<div class="card"><div class="field-group"><span class="label">Account</span>
      <p class="muted">Accounts and sync need the Overload server. This copy keeps your data on this device only.</p></div></div>`;
  }
  if (Sync.user) {
    return `<div class="card"><div class="field-group"><span class="label">Account</span>
      <p>Signed in as <b>${esc(Sync.user)}</b></p>
      <p class="muted" id="sync-line">${syncLine()}</p>
      <div class="row"><button class="btn small" data-action="sync-now">Sync now</button>
        <button class="btn small ghost" data-action="sign-out">Sign out</button>
        ${auth.deleting ? "" : `<button class="btn small ghost danger" data-action="delete-account">Delete account</button>`}</div>
      ${auth.deleting ? `<form class="auth-form" data-form="delete-account">
        <p class="muted">This permanently deletes your account and synced data. Workouts on this device are kept.</p>
        <label class="inp"><input id="delete-password" type="password" autocomplete="current-password" aria-label="Password" placeholder="Enter your password to confirm"><span></span></label>
        ${auth.deleteError ? `<p class="form-error" role="alert">${esc(auth.deleteError)}</p>` : ""}
        <div class="row"><button class="btn small danger" type="submit">Delete my account</button><button class="btn small ghost" type="button" data-action="delete-cancel">Cancel</button></div>
      </form>` : ""}
    </div></div>`;
  }
  const signup = auth.mode === "signup";
  return `<div class="card"><div class="field-group"><span class="label">Account</span>
    <p class="muted">Sign in to back up your training and sync it between your phone and computer.</p>
    ${seg("auth-mode", "mode", auth.mode, [["signin", "Sign in"], ["signup", "Create account"]])}
    <form class="auth-form" data-form="auth">
      <label class="inp"><input id="auth-email" type="email" autocomplete="email" aria-label="Email" placeholder="Email" required><span></span></label>
      <label class="inp"><input id="auth-password" type="password" autocomplete="${signup ? "new-password" : "current-password"}" aria-label="Password" placeholder="${signup ? "Password (8+ characters)" : "Password"}" required minlength="${signup ? 8 : 1}"><span></span></label>
      ${auth.error ? `<p class="form-error" role="alert">${esc(auth.error)}</p>` : ""}
      <button class="btn primary" type="submit" ${auth.busy ? "disabled" : ""}>${auth.busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
      ${S.sessions.some((s) => !s.example) ? `<p class="muted" style="font-size:14px">Workouts already on this device will be added to your account.</p>` : ""}
    </form>
  </div></div>`;
}

async function submitAuth(form) {
  const email = form.querySelector("#auth-email").value.trim();
  const password = form.querySelector("#auth-password").value;
  auth.busy = true; auth.error = ""; render();
  try {
    const res = await api(auth.mode === "signup" ? "signup" : "login", { method: "POST", body: { email, password } });
    setAccount(res.email);
    dropExamples(); save();
    auth = { mode: "signin", error: "", busy: false, deleting: false, deleteError: "" };
    render();
    toast(`Signed in as ${res.email}.`);
    await syncNow();
  } catch (e) {
    auth.busy = false;
    auth.error = e.status ? e.message : "Can't reach the server. Check your connection and try again.";
    render();
    const f = document.getElementById("auth-email"); if (f) f.value = email;
  }
}

function clearLocalAccountData() {
  const keep = { unit: S.unit, profile: S.profile, body: S.body };
  S = Object.assign(defaults(), keep);
  save();
}

async function submitDeleteAccount(form) {
  const password = form.querySelector("#delete-password").value;
  try {
    await api("account/delete", { method: "POST", body: { password } });
    setAccount(null); auth.deleting = false; auth.deleteError = "";
    S.deleted = {}; S.settingsAt = 0; save();
    setSyncStatus("idle"); render(); toast("Account deleted.");
  } catch (e) {
    auth.deleteError = e.status ? e.message : "Can't reach the server. Try again when you're online.";
    render();
  }
}

/* ---------- Install as an app ---------- */
let installPrompt = null;
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

function initInstall() {
  if ("serviceWorker" in navigator && !DEVICE_ONLY) {
    navigator.serviceWorker.register("sw.js").catch(() => { /* not available here */ });
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    const btn = document.getElementById("install-btn");
    if (btn) btn.hidden = false;
    quietRender();
  });
  window.addEventListener("appinstalled", () => { installPrompt = null; const b = document.getElementById("install-btn"); if (b) b.hidden = true; quietRender(); toast("Overload installed."); });
  const btn = document.getElementById("install-btn");
  if (btn) btn.hidden = !installPrompt;
}

function viewInstall() {
  if (DEVICE_ONLY) return "";
  let body;
  if (isStandalone()) body = `<p class="muted">You're using the installed app.</p>`;
  else if (installPrompt) body = `<div class="row"><button class="btn small primary" data-action="install">Install Overload</button></div>`;
  else if (isIos()) body = `<p class="muted">In Safari, tap the Share button, then <b>Add to Home Screen</b>.</p>`;
  else body = `<p class="muted">Open your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</p>`;
  return `<div class="field-group"><span class="label">Install as an app</span>${body}</div>`;
}

/* ---------- Actions ---------- */
function draftRow(dayKey, exId, i) {
  const d = (S.drafts[dayKey] = S.drafts[dayKey] || {});
  d.unit = d.unit || S.unit;
  const rows = (d[exId] = d[exId] || []);
  while (rows.length <= i) rows.push({ w: "", r: "", done: false });
  return rows[i];
}
function dropExamples() {
  S.sessions = S.sessions.filter((s) => !s.example);
  S.weights = S.weights.filter((w) => !w.example);
}
function convertUnit(next) {
  // Drafts hold typed values, so convert them to keep in-progress workouts correct.
  Object.values(S.drafts).forEach((d) => {
    if (!d.unit || d.unit === next) return;
    Object.entries(d).forEach(([k, rows]) => {
      if (!Array.isArray(rows)) return;
      rows.forEach((r) => { const v = parseFloat(r.w); if (!isNaN(v)) r.w = String(Math.round((next === "kg" ? v * KG_PER_LB : v / KG_PER_LB) * 2) / 2); });
    });
    d.unit = next;
  });
  S.unit = next;
}

const actions = {
  tab(b) { ui.tab = b.dataset.tab; ui.confirm = null; render(); window.scrollTo(0, 0); try { history.replaceState(null, "", "#" + ui.tab); } catch (e) { /* ignore */ } },
  profile(b) {
    const v = b.dataset.key === "days" ? Number(b.dataset.val) : b.dataset.val;
    S.profile[b.dataset.key] = v; ui.day = null; persist(true); render();
  },
  unit(b) { convertUnit(b.dataset.val); persist(true); render(); },
  body(b) { S.body[b.dataset.key] = b.dataset.key === "activity" ? Number(b.dataset.val) : b.dataset.val; persist(true); render(); },
  "pick-day"(b) { ui.day = b.dataset.day; ui.confirm = null; render(); },
  done(b) {
    const { ex, i } = b.dataset;
    const row = draftRow(ui.day, ex, Number(i));
    const el = b.closest(".setrow");
    const wIn = el.querySelector('[data-bind="w"]'), rIn = el.querySelector('[data-bind="r"]');
    if (!row.done) {
      if (wIn.value === "" && wIn.placeholder !== "") { wIn.value = wIn.placeholder; row.w = wIn.value; }
      if (rIn.value === "") { rIn.value = rIn.placeholder; row.r = rIn.value; }
      if (wIn.value === "") { wIn.focus(); toast("Enter the weight you used."); return; }
      row.done = true; startRest(Number(b.dataset.rest));
    } else {
      row.done = false;
    }
    el.classList.toggle("is-done", row.done); b.setAttribute("aria-pressed", String(row.done));
    save();
  },
  "add-set"(b) {
    const slot = program().days.find((d) => d.key === ui.day).slots.find((s) => s.id === b.dataset.ex);
    const rows = (S.drafts[ui.day] || {})[b.dataset.ex] || [];
    draftRow(ui.day, b.dataset.ex, Math.max(slot.sets, rows.length));
    save(); render();
  },
  finish() {
    const prog = program(), day = prog.days.find((d) => d.key === ui.day), d = S.drafts[ui.day] || {};
    const unit = d.unit || S.unit;
    const exercises = day.slots.map((s) => ({
      id: s.id,
      sets: (d[s.id] || []).filter((r) => r.done || (r.r !== "" && r.w !== ""))
        .map((r) => ({ kg: Math.round(fromDisp(parseFloat(r.w) || 0, unit) * 100) / 100, reps: parseInt(r.r, 10) || 0 }))
        .filter((x) => x.reps > 0),
    })).filter((e) => e.sets.length);
    if (!exercises.length) { toast("Log at least one set first."); return; }
    dropExamples();
    S.sessions.push({ id: "s" + Date.now(), date: isoDate(new Date()), dayKey: day.key, dayName: day.name, exercises });
    delete S.drafts[ui.day]; ui.day = null; ui.confirm = null; persist(false);
    const n = exercises.reduce((a, e) => a + e.sets.length, 0);
    actions["timer-stop"]();
    toast(`${day.name} saved. ${n} ${n === 1 ? "set" : "sets"} logged.`);
    ui.tab = "progress"; render(); window.scrollTo(0, 0);
  },
  discard() { ui.confirm = "discard"; render(); },
  "discard-yes"() { delete S.drafts[ui.day]; ui.confirm = null; save(); render(); toast("Workout cleared."); },
  cancel() { ui.confirm = null; render(); },
  del(b) { ui.confirm = "del:" + b.dataset.id; render(); },
  "del-yes"(b) {
    const id = b.dataset.id;
    if (!S.sessions.some((s) => s.id === id && s.example)) S.deleted[id] = Date.now();
    S.sessions = S.sessions.filter((s) => s.id !== id); ui.confirm = null; persist(false); render(); toast("Workout removed.");
  },
  "clear-examples"() { dropExamples(); save(); render(); toast("Examples removed."); },
  "lib-muscle"(b) { ui.libMuscle = b.dataset.val; render(); },
  "copy-backup"() {
    const text = JSON.stringify(S);
    const ta = document.getElementById("restore-text");
    navigator.clipboard.writeText(text).then(() => toast("Backup copied."), () => { ta.value = text; ta.select(); toast("Copy the selected text to save your backup."); });
  },
  restore() {
    const ta = document.getElementById("restore-text");
    try {
      const data = JSON.parse(ta.value);
      if (!data || !Array.isArray(data.sessions) || !data.profile) throw new Error("bad");
      S = Object.assign(defaults(), data, { drafts: {}, account: Sync.user }); persist(true); render(); toast("Backup restored.");
    } catch (e) { toast("That isn't a valid backup. Paste the full text you copied."); }
  },
  reset() { ui.confirm = "reset"; render(); },
  "reset-yes"() {
    const now = Date.now(), deleted = Object.assign({}, S.deleted);
    S.sessions.forEach((s) => { if (!s.example) deleted[s.id] = now; });
    S.weights.forEach((w) => { if (!w.example) deleted["w:" + w.date] = now; });
    S = defaults();
    if (Sync.user) { S.deleted = deleted; S.account = Sync.user; }
    ui.confirm = null; persist(true); render(); toast("All data erased.");
  },
  "auth-mode"(b) { auth.mode = b.dataset.val; auth.error = ""; render(); },
  "sync-now"() { syncNow(); },
  async "sign-out"() {
    try { await api("logout", { method: "POST", body: {} }); } catch (e) { /* sign out locally anyway */ }
    setAccount(null); clearLocalAccountData(); setSyncStatus("idle"); render();
    toast("Signed out. Your data is safe in your account.");
  },
  "delete-account"() { auth.deleting = true; auth.deleteError = ""; render(); },
  "delete-cancel"() { auth.deleting = false; render(); },
  async install() {
    if (!installPrompt) return;
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch (e) { /* ignore */ }
    installPrompt = null; render();
  },
  "timer-add"() { T.end += 15000; T.dur += 15; if (!T.iv) { T.iv = setInterval(tick, 250); } tick(); },
  "timer-stop"() { clearInterval(T.iv); T.iv = null; document.getElementById("timer").hidden = true; },
};

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (b && actions[b.dataset.action]) { e.preventDefault(); actions[b.dataset.action](b, e); }
});

document.addEventListener("input", (e) => {
  const t = e.target, bind = t.dataset.bind;
  if (!bind) return;
  if (bind === "w" || bind === "r") { draftRow(ui.day, t.dataset.ex, Number(t.dataset.i))[bind] = t.value.replace(",", "."); save(); return; }
  if (bind === "lib") {
    ui.libQuery = t.value;
    const pos = t.selectionStart; render();
    const s = document.getElementById("lib-search"); s.focus(); try { s.setSelectionRange(pos, pos); } catch (er) { /* ignore */ }
    return;
  }
  const v = parseFloat(t.value.replace(",", "."));
  if (isNaN(v) || v <= 0) return;
  if (bind === "age") S.body.age = v;
  if (bind === "height") S.body.heightCm = S.unit === "kg" ? v : v * 2.54;
  if (bind === "bodyweight") S.body.weightKg = fromDisp(v);
  persist(true);
});
document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.bind === "trend") { ui.trendEx = t.value; render(); }
  if (["age", "height", "bodyweight"].includes(t.dataset.bind)) render();
});
document.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.dataset.form === "auth") { submitAuth(e.target); return; }
  if (e.target.dataset.form === "delete-account") { submitDeleteAccount(e.target); return; }
  if (e.target.dataset.form !== "weigh") return;
  const v = parseFloat(document.getElementById("weigh-in").value.replace(",", "."));
  if (isNaN(v) || v <= 0) { toast("Enter your weight as a number."); return; }
  dropExamples();
  const today = isoDate(new Date());
  S.weights = S.weights.filter((w) => w.date !== today);
  S.weights.push({ date: today, kg: Math.round(fromDisp(v) * 100) / 100, at: Date.now() });
  S.body.weightKg = fromDisp(v);
  persist(true); render(); toast("Weigh-in logged.");
});

S = load();
const hash = (location.hash || "").slice(1);
if (VIEWS[hash]) ui.tab = hash;
render();
initSync();
initInstall();
