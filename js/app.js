import { GOAL_LIST, TEGENGOAL_LIST, HYPE, FULL, ALL_AUDIO } from './tracks.js';

const AUDIO_CACHE = 'lxd-audio-v1';
const FADE_SECONDS = 2.5;
const $ = (sel) => document.querySelector(sel);
const abs = (src) => new URL(src, location.href).href;

/* =========================================================
   Audio engine
   Every track gets its own <audio> element, routed through a
   Web Audio gain node so fades also work on iPhone (iOS ignores
   element.volume).
   ========================================================= */
const AC = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let master = null;

if (navigator.audioSession) {
  // iOS 17+: keep playing when the ring/silent switch is on
  try { navigator.audioSession.type = 'playback'; } catch (_) {}
}

function audioCtx() {
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC({ latencyHint: 'interactive' });
      master = ctx.createGain();
      master.connect(ctx.destination);
    } catch (_) { ctx = null; return null; }
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  return ctx;
}

const voices = new Map(); // src -> { el, gain, fadeTimer }

function voice(src) {
  let v = voices.get(src);
  if (v) return v;
  const el = new Audio();
  el.preload = 'auto';
  el.src = src;
  v = { el, gain: null, fadeTimer: 0, rafFade: 0 };
  const c = audioCtx();
  if (c) {
    try {
      const node = c.createMediaElementSource(el);
      v.gain = c.createGain();
      node.connect(v.gain);
      v.gain.connect(master);
    } catch (_) { v.gain = null; }
  }
  voices.set(src, v);
  return v;
}

function setLevel(v, value) {
  clearTimeout(v.fadeTimer);
  cancelAnimationFrame(v.rafFade);
  if (v.gain && ctx) {
    const g = v.gain.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(value, ctx.currentTime);
  } else {
    v.el.volume = value;
  }
}

// Ramp to silence, then pause. Resolves when done.
function fadeOutVoice(v, seconds) {
  clearTimeout(v.fadeTimer);
  cancelAnimationFrame(v.rafFade);
  return new Promise((resolve) => {
    const done = () => {
      v.el.pause();
      try { v.el.currentTime = 0; } catch (_) {}
      resolve();
    };
    if (seconds <= 0) { done(); return; }
    if (v.gain && ctx && ctx.state === 'running') {
      const g = v.gain.gain;
      const t = ctx.currentTime;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0.0001, t + seconds);
      v.fadeTimer = setTimeout(done, seconds * 1000 + 30);
    } else {
      const start = performance.now();
      const from = v.el.volume;
      const step = (now) => {
        const k = Math.min(1, (now - start) / (seconds * 1000));
        try { v.el.volume = from * (1 - k); } catch (_) {}
        if (k < 1) v.rafFade = requestAnimationFrame(step); else done();
      };
      v.rafFade = requestAnimationFrame(step);
    }
  });
}

/* =========================================================
   Playback state
   ========================================================= */
let current = null; // { track, v, ui, kind, fading }
const listeners = new Set();

function emit() { listeners.forEach((fn) => fn(current)); }

async function play(track, ui, kind = 'pad') {
  audioCtx();
  keepAwake();
  const v = voice(track.src);
  const previous = current;
  if (previous) {
    previous.v.el.onended = null;
    if (previous.v !== v) fadeOutVoice(previous.v, 0.15);
  }
  setLevel(v, 1);
  try { v.el.currentTime = 0; } catch (_) {}
  current = { track, v, ui, kind, fading: false };
  v.el.onended = () => { if (current && current.v === v) { current = null; emit(); } };
  emit();
  try {
    await v.el.play();
  } catch (err) {
    if (current && current.v === v) { current = null; emit(); }
    if (err && err.name !== 'AbortError') toast('Kon dit nummer niet afspelen. Check je verbinding.');
  }
}

function stop(seconds = 0.08) {
  if (!current) return;
  const v = current.v;
  v.el.onended = null;
  current = null;
  emit();
  fadeOutVoice(v, seconds);
}

function fadeOut() {
  if (!current || current.fading) return;
  const cur = current;
  cur.fading = true;
  emit();
  fadeOutVoice(cur.v, FADE_SECONDS).then(() => {
    if (current === cur) { current = null; emit(); }
  });
}

function toggle(track, ui) {
  if (current && current.ui === ui) {
    if (current.fading) stop(0.05); else stop(0.35);
    return;
  }
  play(track, ui, 'pad');
}

/* =========================================================
   UI: pads, rows, tabs
   ========================================================= */
const fmt = (s) => {
  if (!isFinite(s) || s < 0) return '–:––';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function eqGlyph() {
  const e = el('span', 'eq');
  e.setAttribute('aria-hidden', 'true');
  e.append(el('i'), el('i'), el('i'));
  return e;
}

function makePad(track, i) {
  const b = el('button', 'pad');
  b.type = 'button';
  b.setAttribute('aria-pressed', 'false');
  b.setAttribute('aria-label', `${track.title} – ${track.artist}`);
  b.append(
    el('span', 'pad-num', String(i + 1).padStart(2, '0')),
    eqGlyph(),
    el('span', 'pad-time'),
    el('span', 'pad-title', track.title),
    el('span', 'pad-artist', track.artist),
  );
  const bar = el('span', 'pad-bar'); bar.append(el('span')); b.append(bar);
  b.addEventListener('click', () => toggle(track, b));
  b.dataset.src = track.src;
  return b;
}

function makeRow(track) {
  const b = el('button', 'row');
  b.type = 'button';
  b.setAttribute('aria-pressed', 'false');
  b.setAttribute('aria-label', `${track.title} – ${track.artist}`);
  const icon = el('span', 'row-icon');
  icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>';
  icon.append(eqGlyph());
  const text = el('span', 'row-text');
  text.append(el('span', 'row-title', track.title), el('span', 'row-artist', track.artist));
  const meta = el('span', 'row-meta');
  b.append(icon, text, meta, el('span', 'row-bar'));
  b.addEventListener('click', () => toggle(track, b));
  b.dataset.src = track.src;
  return b;
}

const padBySrc = new Map();
HYPE.forEach((t, i) => { const p = makePad(t, i); padBySrc.set(t.src, p); $('#hypeGrid').append(p); });
FULL.forEach((t) => $('#fullList').append(makeRow(t)));

// Tabs
const tabs = [...document.querySelectorAll('.tab')];
const track = $('.tabs-track');
const tabsEl = $('.tabs');
const sentinel = el('div');
sentinel.style.height = '1px';
tabsEl.before(sentinel);
new IntersectionObserver(([e]) => tabsEl.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);

function selectTab(name) {
  tabs.forEach((t, i) => {
    const on = t.dataset.panel === name;
    t.classList.toggle('is-active', on);
    t.setAttribute('aria-selected', String(on));
    if (on) track.style.setProperty('--i', i);
    const panel = document.getElementById(`panel-${t.dataset.panel}`);
    panel.hidden = !on;
    panel.classList.toggle('is-active', on);
  });
  if (window.scrollY > sentinel.offsetTop) window.scrollTo(0, sentinel.offsetTop);
  try { localStorage.setItem('lxd-tab', name); } catch (_) {}
}
tabs.forEach((t) => t.addEventListener('click', () => selectTab(t.dataset.panel)));
try { const saved = localStorage.getItem('lxd-tab'); if (saved && document.getElementById(`panel-${saved}`)) selectTab(saved); } catch (_) {}

/* =========================================================
   Score buttons: GOAL! (wij scoren) and TEGENGOAL (zij scoren)
   Each list is shuffled when the app opens and played in that order. Once
   every song has had a turn the list is reshuffled, and the first song of
   the new round is never the one that just played.
   ========================================================= */
const goalBtn = $('#goalBtn');
const tegenBtn = $('#tegenBtn');

function shuffled(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function picker(list) {
  let queue = shuffled(list); // shuffled on load
  let last = null;
  const next = () => {
    if (list.length === 1) return list[0];
    if (!queue.length) {
      queue = shuffled(list);
      if (queue[0] === last) queue.push(queue.shift());
    }
    last = queue.shift();
    return last;
  };
  next.upcoming = () => queue.slice(); // for debugging: what's left this round
  return next;
}
const pickGoal = picker(GOAL_LIST);
const pickTegen = picker(TEGENGOAL_LIST);

function celebrate() {
  const c = $('#celebrate');
  c.classList.remove('is-on');
  void c.offsetWidth; // restart animation
  c.classList.add('is-on');
  if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
}

const lastPress = new WeakMap();
function debounced(btn) {
  const now = Date.now();
  if (now - (lastPress.get(btn) || 0) < 900) return true; // ignore accidental double taps
  lastPress.set(btn, now);
  return false;
}

function goal() {
  if (debounced(goalBtn)) return;
  play(pickGoal(), goalBtn, 'goal');
  celebrate();
}
function tegengoal() {
  if (debounced(tegenBtn)) return;
  play(pickTegen(), tegenBtn, 'tegengoal');
}
goalBtn.addEventListener('click', goal);
tegenBtn.addEventListener('click', tegengoal);

/* =========================================================
   Shuffle: random Hype snippet (never the goal song, no repeats until
   every snippet has had a turn)
   ========================================================= */
const shuffleBtn = $('#shuffleBtn');
const goalSrcs = new Set(GOAL_LIST.map((t) => t.src));
const hypePool = HYPE.filter((t) => !goalSrcs.has(t.src));
const pickHype = picker(hypePool);
let lastShuffle = 0;

function shuffleHype() {
  const now = Date.now();
  if (now - lastShuffle < 350) return; // accidental double tap
  lastShuffle = now;
  let t = pickHype();
  if (current && current.track.src === t.src && hypePool.length > 1) t = pickHype();
  const pad = padBySrc.get(t.src);
  play(t, pad || shuffleBtn, 'pad');
  shuffleBtn.classList.remove('is-spin'); void shuffleBtn.offsetWidth; shuffleBtn.classList.add('is-spin');
  if (pad && !$('#panel-hype').hidden) pad.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
shuffleBtn.addEventListener('click', shuffleHype);

/* =========================================================
   Now playing + render loop
   ========================================================= */
const nowEl = $('#now');
const nowTitle = $('#nowTitle');
const nowArtist = $('#nowArtist');
const nowBar = $('#nowBar').parentElement;
const nowElapsed = $('#nowElapsed');
const nowRemain = $('#nowRemain');
let activeUi = null;
let raf = 0;

listeners.add((cur) => {
  if (activeUi && (!cur || cur.ui !== activeUi)) {
    activeUi.classList.remove('is-playing', 'is-fading');
    activeUi.setAttribute('aria-pressed', 'false');
    activeUi.style.removeProperty('--p');
    const t = activeUi.querySelector('.pad-time, .row-meta');
    if (t) t.textContent = '';
    const sub = activeUi.querySelector('.score-sub');
    if (sub) sub.textContent = sub.dataset.idle;
    activeUi = null;
  }
  if (cur) {
    activeUi = cur.ui;
    activeUi.classList.add('is-playing');
    activeUi.classList.toggle('is-fading', !!cur.fading);
    activeUi.setAttribute('aria-pressed', 'true');
    nowTitle.textContent = cur.track.title;
    nowArtist.textContent = cur.track.artist;
    nowEl.hidden = false;
    nowEl.classList.toggle('is-fading', !!cur.fading);
    $('#fadeBtn span').textContent = cur.fading ? 'Fadet…' : 'Uitfaden';
    document.body.classList.add('has-now');
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  } else {
    nowEl.hidden = true;
    document.body.classList.remove('has-now');
    cancelAnimationFrame(raf);
  }
});

function tick() {
  if (!current) return;
  const a = current.v.el;
  const d = a.duration;
  const t = a.currentTime || 0;
  const p = isFinite(d) && d > 0 ? Math.min(1, t / d) : 0;
  const remain = isFinite(d) ? d - t : NaN;
  current.ui.style.setProperty('--p', p.toFixed(4));
  const prog = current.ui.querySelector('.score-progress');
  if (prog) prog.style.setProperty('--p', p.toFixed(4));
  nowBar.style.setProperty('--p', p.toFixed(4));
  nowElapsed.textContent = fmt(t);
  nowRemain.textContent = isFinite(remain) ? `-${fmt(remain)}` : '–:––';
  const timeEl = current.ui.querySelector('.pad-time, .row-meta');
  if (timeEl) timeEl.textContent = isFinite(remain) ? `-${fmt(remain)}` : '';
  const sub = current.ui.querySelector('.score-sub');
  if (sub) sub.textContent = current.track.title;
  raf = requestAnimationFrame(tick);
}

$('#fadeBtn').addEventListener('click', fadeOut);
$('#stopBtn').addEventListener('click', () => stop(0.08));

// Keyboard (laptop at the scorer's table): G = goal, T = tegengoal, R = shuffle hype, F = fade, Esc/Space = stop
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'g' || e.key === 'G') { e.preventDefault(); goal(); }
  else if (e.key === 't' || e.key === 'T') { e.preventDefault(); tegengoal(); }
  else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); shuffleHype(); }
  else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); fadeOut(); }
  else if (e.key === 'Escape' || (e.key === ' ' && e.target === document.body)) { e.preventDefault(); stop(0.08); }
});

/* =========================================================
   Keep the screen awake while the app is open
   ========================================================= */
let wakeLock = null;
async function keepAwake() {
  if (!('wakeLock' in navigator) || wakeLock || document.visibilityState !== 'visible') return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (_) { wakeLock = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
document.addEventListener('pointerdown', () => { audioCtx(); keepAwake(); }, { once: true, capture: true });

/* =========================================================
   Offline: service worker + audio cache
   ========================================================= */
const chip = $('#offlineChip');
const chipText = $('#offlineChipText');
const SNIPPET_SRCS = ALL_AUDIO.filter((s) => s.includes('snippets/'));
const FULL_SRCS = ALL_AUDIO.filter((s) => s.includes('original/'));
const ESSENTIALS = [...new Set([...GOAL_LIST, ...TEGENGOAL_LIST].map((t) => t.src))];
let downloading = false;

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

async function cachedSet() {
  if (!('caches' in window)) return null;
  try {
    const c = await caches.open(AUDIO_CACHE);
    return new Set((await c.keys()).map((r) => r.url));
  } catch (_) { return null; }
}

async function refreshOffline() {
  const set = await cachedSet();
  if (!set) { chip.hidden = true; return; }
  const sn = SNIPPET_SRCS.filter((s) => set.has(abs(s))).length;
  const fu = FULL_SRCS.filter((s) => set.has(abs(s))).length;
  $('#statSnippets').textContent = `${sn} / ${SNIPPET_SRCS.length}`;
  $('#statFull').textContent = `${fu} / ${FULL_SRCS.length}`;
  const all = sn === SNIPPET_SRCS.length && fu === FULL_SRCS.length;
  if (!downloading) {
    chip.classList.toggle('is-ready', all);
    chipText.textContent = all ? 'Offline klaar' : 'Offline';
    $('#downloadAll').textContent = all ? 'Alles staat offline ✓' : 'Alles offline bewaren';
    $('#downloadAll').disabled = all;
  }
  document.querySelectorAll('.row').forEach((r) => {
    if (r.classList.contains('is-playing')) return;
    const meta = r.querySelector('.row-meta');
    meta.innerHTML = set.has(abs(r.dataset.src)) ? '<span class="saved" title="Offline beschikbaar"></span>' : '';
  });
}

async function cacheOne(cache, src) {
  const url = abs(src);
  if (await cache.match(url)) return true;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(res.status);
  await cache.put(url, res);
  return true;
}

async function downloadAll() {
  if (downloading || !('caches' in window)) return;
  downloading = true;
  const btn = $('#downloadAll');
  btn.disabled = true;
  chip.classList.add('is-busy');
  $('#sheetProgress').hidden = false;
  const cache = await caches.open(AUDIO_CACHE);
  // Most important first: goal, tegengoal, hype, then full songs
  const order = [...new Set([...ESSENTIALS, ...SNIPPET_SRCS, ...FULL_SRCS])];
  let done = 0; let failed = 0;
  const update = () => {
    const p = done / order.length;
    $('#sheetBar').parentElement.style.setProperty('--p', p);
    chipText.textContent = `${Math.round(p * 100)}%`;
    btn.textContent = `Bezig… ${done}/${order.length}`;
  };
  update();
  const queue = order.slice();
  const worker = async () => {
    while (queue.length) {
      const src = queue.shift();
      try { await cacheOne(cache, src); } catch (_) { failed++; }
      done++; update();
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  downloading = false;
  chip.classList.remove('is-busy');
  $('#sheetProgress').hidden = true;
  if (failed) toast(`${failed} nummer(s) niet bewaard. Probeer opnieuw met wifi.`);
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  refreshOffline();
}

// Drop saved audio that is no longer in the lists (old cuts, removed songs)
async function pruneAudio(cache) {
  const keep = new Set(ALL_AUDIO.map(abs));
  for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
}

// Quietly keep the score-button songs on the device
async function warmEssentials() {
  if (!('caches' in window)) return;
  try {
    const cache = await caches.open(AUDIO_CACHE);
    await pruneAudio(cache);
    for (const src of ESSENTIALS) await cacheOne(cache, src);
  } catch (_) {}
  refreshOffline();
}

// Sheet
const sheet = $('#offlineSheet');
const scrim = $('#sheetScrim');
function openSheet() {
  refreshOffline();
  sheet.hidden = false; scrim.hidden = false;
  requestAnimationFrame(() => { sheet.classList.add('is-open'); scrim.classList.add('is-open'); });
}
function closeSheet() {
  sheet.classList.remove('is-open'); scrim.classList.remove('is-open');
  setTimeout(() => { sheet.hidden = true; scrim.hidden = true; }, 320);
}
chip.addEventListener('click', openSheet);
scrim.addEventListener('click', closeSheet);
$('#sheetClose').addEventListener('click', closeSheet);
$('#downloadAll').addEventListener('click', downloadAll);
if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
  $('#installNote').innerHTML = 'De soundboard staat als app op je beginscherm. Het scherm blijft aan zolang de app open is.';
}

/* =========================================================
   Toast
   ========================================================= */
let toastTimer = 0;
function toast(msg) {
  let t = $('.toast');
  if (!t) { t = el('div', 'toast'); t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('is-on'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
}

// Preload the score-button songs so they fire instantly
ESSENTIALS.forEach((src) => voice(src));
refreshOffline();
window.addEventListener('load', () => setTimeout(warmEssentials, 800));

// Expose for debugging
window.__lxd = {
  play, stop, fadeOut, goal, tegengoal, shuffleHype,
  get current() { return current; },
  upcoming: () => ({ goal: pickGoal.upcoming(), tegengoal: pickTegen.upcoming(), hype: pickHype.upcoming() }),
};
