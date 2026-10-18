/* Sync document validation and merging, shared by the browser app and the server.
   A document holds only data that should follow the user across devices:
   finished workouts, weigh-ins, deletions (tombstones) and settings. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.OverloadSync = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const MAX_SESSIONS = 5000;
  const MAX_WEIGHTS = 5000;
  const MAX_TOMBSTONES = 20000;
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  const isStr = (v, max) => typeof v === "string" && v.length > 0 && v.length <= max;
  const num = (v, min, max) => (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null);
  const oneOf = (v, list, fallback) => (list.includes(v) ? v : fallback);

  function emptyDoc() {
    return { sessions: [], weights: [], deleted: {}, settings: null, settingsAt: 0 };
  }

  function cleanSession(s) {
    if (!s || typeof s !== "object" || s.example) return null;
    if (!isStr(s.id, 64) || !DATE_RE.test(s.date) || !isStr(s.dayKey, 32) || !isStr(s.dayName, 64)) return null;
    if (!Array.isArray(s.exercises)) return null;
    const exercises = s.exercises.slice(0, 30).map((e) => {
      if (!e || !isStr(e.id, 64) || !Array.isArray(e.sets)) return null;
      const sets = e.sets.slice(0, 30)
        .map((x) => x && { kg: num(x.kg, 0, 2000), reps: num(x.reps, 0, 1000) })
        .filter((x) => x && x.kg !== null && x.reps !== null)
        .map((x) => ({ kg: x.kg, reps: Math.round(x.reps) }));
      return sets.length ? { id: e.id, sets } : null;
    }).filter(Boolean);
    if (!exercises.length) return null;
    return { id: s.id, date: s.date, dayKey: s.dayKey, dayName: s.dayName, exercises };
  }

  function cleanWeight(w) {
    if (!w || typeof w !== "object" || w.example || !DATE_RE.test(w.date)) return null;
    const kg = num(w.kg, 1, 1000);
    if (kg === null) return null;
    return { date: w.date, kg, at: num(w.at, 0, 1e14) || 0 };
  }

  function cleanSettings(st) {
    if (!st || typeof st !== "object") return null;
    const p = st.profile || {}, b = st.body || {};
    const body = {
      sex: oneOf(b.sex, ["male", "female"], "male"),
      age: num(b.age, 10, 110) || 28,
      heightCm: num(b.heightCm, 100, 250) || 178,
      activity: oneOf(b.activity, [1.35, 1.55, 1.75], 1.55),
      diet: oneOf(b.diet, ["any", "vegetarian", "vegan"], "any"),
    };
    const wk = num(b.weightKg, 20, 400);
    if (wk !== null) body.weightKg = wk;
    return {
      unit: oneOf(st.unit, ["kg", "lb"], "kg"),
      profile: {
        goal: oneOf(p.goal, ["lose", "build", "recomp"], "build"),
        level: oneOf(p.level, ["beginner", "intermediate"], "intermediate"),
        equip: oneOf(p.equip, ["gym", "db", "kb", "bw"], "gym"),
        days: oneOf(p.days, [3, 4, 5], 4),
      },
      body,
    };
  }

  /* Turns untrusted input into a well-formed document, dropping anything malformed. */
  function normalize(doc) {
    const out = emptyDoc();
    if (!doc || typeof doc !== "object") return out;
    if (doc.deleted && typeof doc.deleted === "object") {
      Object.entries(doc.deleted).slice(0, MAX_TOMBSTONES).forEach(([k, v]) => {
        const t = num(v, 0, 1e14);
        if (k.length <= 80 && t !== null) out.deleted[k] = t;
      });
    }
    if (Array.isArray(doc.sessions)) out.sessions = doc.sessions.slice(0, MAX_SESSIONS).map(cleanSession).filter(Boolean);
    if (Array.isArray(doc.weights)) out.weights = doc.weights.slice(0, MAX_WEIGHTS).map(cleanWeight).filter(Boolean);
    out.settings = cleanSettings(doc.settings);
    out.settingsAt = out.settings ? num(doc.settingsAt, 0, 1e14) || 0 : 0;
    return out;
  }

  /* Combines two documents. Workouts are unioned by id, weigh-ins keep the newest
     entry per date, deletions win over older data, and the newest settings win. */
  function merge(a, b) {
    a = normalize(a);
    b = normalize(b);
    const deleted = Object.assign({}, a.deleted);
    Object.entries(b.deleted).forEach(([k, t]) => { deleted[k] = Math.max(deleted[k] || 0, t); });

    const sessions = new Map();
    a.sessions.concat(b.sessions).forEach((s) => {
      if (!(s.id in deleted) && !sessions.has(s.id)) sessions.set(s.id, s);
    });

    const weights = new Map();
    a.weights.concat(b.weights).forEach((w) => {
      if (w.at <= (deleted["w:" + w.date] || -1)) return;
      const cur = weights.get(w.date);
      if (!cur || w.at > cur.at) weights.set(w.date, w);
    });

    const byDate = (x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0);
    const bNewer = b.settings && (!a.settings || b.settingsAt > a.settingsAt);
    return {
      sessions: [...sessions.values()].sort(byDate),
      weights: [...weights.values()].sort(byDate),
      deleted,
      settings: bNewer ? b.settings : a.settings,
      settingsAt: Math.max(a.settingsAt, b.settingsAt),
    };
  }

  return { emptyDoc, normalize, merge };
});
