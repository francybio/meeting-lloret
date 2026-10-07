/* ==========================================================
   MEETING — interacciones
   Caja de pizza que se abre (1990 → hoy), rueda de pizzas que
   monta cada pizza con sus ingredientes, baraja de fotos,
   tele retro con los vídeos de Instagram y horario en vivo.
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
// si el navegador congela los frames (pestaña oculta), se completa la animación
const watchdog = (tl, ms) => { setTimeout(() => { if (tl.progress() < 1) tl.progress(1); }, ms); return tl; };
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ----------------------------------------------------------
   DATOS
   ---------------------------------------------------------- */
// minutos desde medianoche · 0 = domingo · lunes descanso
const SERVICE = [[780, 1020], [1140, 1380]];
const HOURS = { 0: SERVICE, 1: null, 2: SERVICE, 3: SERVICE, 4: SERVICE, 5: SERVICE, 6: SERVICE };
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// t = ingredientes que se dibujan · m / f = mediana / familiar
const PIZZAS = [
  { n: 'Margherita', d: 'Salsa de tomate y mozzarella.', m: '8,00', f: '14,00', t: ['mozz'] },
  { n: 'Salamino', d: 'Salsa de tomate, mozzarella y salami picante.', m: '8,00', f: '14,00', t: ['mozz', 'salami'] },
  { n: 'Viennese', d: 'Salsa de tomate, mozzarella y frankfurt.', m: '8,00', f: '14,00', t: ['mozz', 'frank'] },
  { n: 'Funghi', d: 'Salsa de tomate, mozzarella y champiñones.', m: '8,00', f: '14,00', t: ['mozz', 'funghi'] },
  { n: 'Prosciutto', d: 'Salsa de tomate, mozzarella y jamón dulce.', m: '8,00', f: '14,00', t: ['mozz', 'cotto'] },
  { n: '4 Quesos', s: '4 Formaggi', d: 'Cuatro quesos.', m: '10,00', f: '18,00', t: ['quattro'] },
  { n: 'Napoli', d: 'Salsa de tomate, mozzarella, alcaparras y anchoas.', m: '10,00', f: '18,00', t: ['mozz', 'anchoa', 'capers'] },
  { n: 'Prosciutto e funghi', s: 'Prosc. e funghi', d: 'Salsa de tomate, mozzarella, champiñones y jamón dulce.', m: '10,00', f: '18,00', t: ['mozz', 'cotto', 'funghi'] },
  { n: 'Atún y cebolla', d: 'Atún y cebolla sobre tomate y mozzarella.', m: '10,00', f: '18,00', t: ['mozz', 'tuna', 'onion'] },
  { n: 'Prosciutto bacon', s: 'Prosc. bacon', d: 'Jamón dulce y bacon sobre tomate y mozzarella.', m: '10,00', f: '18,00', t: ['mozz', 'cotto', 'bacon'] },
  { n: 'Capricciosa', d: 'Salsa de tomate, mozzarella, jamón dulce, champiñones, olivas y frankfurt.', m: '12,00', f: '22,00', t: ['mozz', 'cotto', 'funghi', 'olive', 'frank'] },
  { n: 'Meeting', d: 'La de la casa: salsa de tomate, mozzarella, jamón dulce, champiñones y salami picante.', m: '11,00', f: '20,00', t: ['mozz', 'cotto', 'funghi', 'salami'], hot: 1 },
  { n: 'Red Devil', d: 'Salsa de tomate, mozzarella, gorgonzola, salami picante y guindilla.', m: '11,00', f: '20,00', t: ['mozz', 'gorgo', 'salami', 'chili'] },
  { n: 'Parigina', d: 'Salsa de tomate, mozzarella, jamón italiano, rúcula y Grana Padano.', m: '13,00', f: '24,00', t: ['mozz', 'crudo', 'grana', 'rucola'] },
  { n: 'Bismark', d: 'Salsa de tomate, mozzarella, frankfurt, beicon y huevo.', m: '11,00', f: '20,00', t: ['mozz', 'frank', 'bacon', 'egg'] },
  { n: 'Pollo', d: 'Salsa de tomate, mozzarella y pechuga de pollo.', m: '10,00', f: '18,00', t: ['mozz', 'chicken'] },
  { n: 'Maialona', d: 'Salsa de tomate, mozzarella, jamón dulce, salami picante, frankfurt y beicon.', m: '12,00', f: '22,00', t: ['mozz', 'cotto', 'salami', 'frank', 'bacon'] },
  { n: 'Maialona con pollo', s: 'Maialona pollo', d: 'La Maialona, con pollo.', m: '14,00', f: '26,00', t: ['mozz', 'cotto', 'salami', 'frank', 'bacon', 'chicken'] },
  { n: 'Frutti di mare', d: 'Salsa de tomate, mozzarella y mix de mariscos.', m: '13,00', f: '24,00', t: ['mozz', 'mare'] },
  { n: 'Aceite, sal y orégano', s: 'Oli & orégano', d: 'Masa con aceite, sal y orégano.', m: '6,00', t: ['oil', 'oregano'], bianca: 1 },
  { n: 'Biancaneve', d: 'Aceite, sal, orégano y mozzarella.', m: '8,00', t: ['oil', 'mozz', 'oregano'], bianca: 1 },
  { n: 'Calzone', d: 'Cerrada: salsa de tomate, mozzarella y jamón dulce.', m: '10,00', t: [], calzone: 1 },
  { n: 'Focaccia con Nutella', s: 'Nutella', d: 'Focaccia con Nutella, para el final.', m: '15,00', t: ['nutella'], bianca: 1 },
  { n: 'Pizza di Giorgio', s: 'Di Giorgio', d: 'Tomate, gorgonzola, salami picante, cebolla y guindilla.', m: '15,00', t: ['gorgo', 'salami', 'onion', 'chili'], hot: 1 }
];

const PHOTOS = [
  { src: 'assets/img/pizza-speck.jpg', cap: '“¡Novedad! Pizza mascarpone e speck”' },
  { src: 'assets/img/spaghetti-calamari.jpg', cap: 'Spaghetti con calamari' },
  { src: 'assets/img/porchetta.jpg', cap: '“La nostra porchetta!”' },
  { src: 'assets/img/polenta-porcini.jpg', cap: '“Polenta con funghi porcini”' },
  { src: 'assets/img/terrina.jpg', cap: '“Terrina dello chef!”' },
  { src: 'assets/img/mejillones.jpg', cap: 'Mejillones y calamares' },
  { src: 'assets/img/pasta.jpg', cap: 'Pasta de la casa' },
  { src: 'assets/img/collage.jpg', cap: '“Ganas de Italia… ganas de Meeting”' },
  { src: 'assets/img/local.jpg', cap: 'La barra de @ilmeeting' },
  { src: 'assets/img/barra-bn.jpg', cap: 'Dentro de Meeting' }
];

const CHANNELS = [
  { src: 'assets/video/grazie.mp4', poster: 'assets/img/poster-grazie.jpg', name: 'CH 1 · Grazie' },
  { src: 'assets/video/lasagna.mp4', poster: 'assets/img/poster-lasagna.jpg', name: 'CH 2 · Lasagna di Emilio' }
];

/* ----------------------------------------------------------
   HORA DE LLORET
   ---------------------------------------------------------- */
function madridNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), min: (+get('hour') % 24) * 60 + +get('minute') };
}
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
function statusText() {
  const { day, min } = madridNow();
  for (const [a, b] of HOURS[day] || []) {
    if (min >= a && min < b) return b - min <= 30 ? ['soon', `Cierra pronto · ${hhmm(b)}`] : ['open', `Abierto · hasta las ${hhmm(b)}`];
    if (min < a) return a - min <= 60 ? ['soon', `Abre a las ${hhmm(a)}`] : ['closed', `Cerrado · abre a las ${hhmm(a)}`];
  }
  for (let k = 1; k <= 7; k++) {
    const d = (day + k) % 7;
    if (HOURS[d]) return ['closed', `Cerrado · abre ${k === 1 ? 'mañana' : 'el ' + DAYS[d].toLowerCase()} a las ${hhmm(HOURS[d][0][0])}`];
  }
  return ['closed', 'Cerrado'];
}
function paintStatus() {
  const [state, txt] = statusText();
  $$('[data-status]').forEach((el) => { el.dataset.state = state; $('b', el).textContent = txt; });
}
(function paintHours() {
  const t = $('#hours');
  const { day } = madridNow();
  [1, 2, 3, 4, 5, 6, 0].forEach((d) => {
    const tr = document.createElement('tr');
    if (d === day) tr.className = 'is-today';
    tr.innerHTML = `<td>${DAYS[d]}</td><td>${HOURS[d] ? HOURS[d].map(([a, b]) => `${hhmm(a)} – ${hhmm(b)}`).join(' · ') : 'Cerrado (descanso)'}</td>`;
    t.appendChild(tr);
  });
})();
paintStatus();
setInterval(paintStatus, 60000);

/* ----------------------------------------------------------
   SCROLL + NAV
   ---------------------------------------------------------- */
let lenis = null;
if (motion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const nav = $('#nav'), links = $('#navLinks'), burger = $('#burger');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('is-solid', y > 40);
  nav.classList.toggle('is-hidden', y > lastY && y > 700 && !links.classList.contains('is-open'));
  lastY = y;
}, { passive: true });
burger.addEventListener('click', () => {
  const open = !links.classList.contains('is-open');
  links.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
});
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  const target = id.length > 1 ? $(id) : document.body;
  if (!target) return;
  e.preventDefault();
  links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
  if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -60, duration: 1.4 });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

/* ----------------------------------------------------------
   VÍDEO: carga perezosa
   ---------------------------------------------------------- */
const vio = new IntersectionObserver((entries) => entries.forEach((e) => {
  const v = e.target;
  if (e.isIntersecting) {
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    if (!reduced) v.play().catch(() => {});
  } else v.pause();
}), { rootMargin: '250px 0px', threshold: 0.01 });
$$('video[data-auto]').forEach((v) => vio.observe(v));

/* ----------------------------------------------------------
   INTRO · la caja se abre
   ---------------------------------------------------------- */
const word = $('.hero__word');
word.innerHTML = [...word.textContent].map((c) => `<span class="ch">${c}</span>`).join('');

function heroIn() {
  if (!motion) return;
  return watchdog(gsap.timeline({ defaults: { ease: 'expo.out' } })
    .from('.hero__word .ch', { yPercent: 110, rotation: 12, opacity: 0, duration: 1.2, stagger: 0.05 })
    .from('.ribbon', { scaleX: 0, transformOrigin: 'left', duration: 0.9 }, 0.1)
    .from('.hero__lead, .hero__cta, .hero__note', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.4)
    .from('.pol', { y: -160, opacity: 0, rotation: (i) => [-30, 25, 20, -25][i], duration: 1.3, stagger: 0.12, ease: 'back.out(1.4)' }, 0.2)
    .from('.seal', { scale: 0, rotation: -120, duration: 1.2, ease: 'back.out(2)' }, 0.9), 4500);
}

const box = $('#box');
let seen = false;
try { seen = sessionStorage.getItem('meeting-intro') === '1'; sessionStorage.setItem('meeting-intro', '1'); } catch (e) { /* sin storage */ }
if (!motion || seen) { box.remove(); heroIn(); }
else {
  document.body.classList.add('is-locked');
  const yr = $('#year');
  const thisYear = new Date().getFullYear();
  const o = { y: 1990 };
  const tl = gsap.timeline({ onComplete: () => { box.remove(); document.body.classList.remove('is-locked'); } });
  watchdog(tl, 8000);
  tl.from('.box__stamp', { scale: 1.6, opacity: 0, rotation: -20, duration: 0.7, ease: 'back.out(1.6)' })
    .to(o, { y: thisYear, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { yr.textContent = Math.round(o.y); } }, '+=0.1')
    .to('.box__lid', { rotationX: 105, duration: 1.15, ease: 'power3.in' }, '+=0.25')
    .to('.box__lid', { opacity: 0, duration: 0.3 }, '-=0.3')
    .from('.box__inside span', { scale: 0.7, opacity: 0, duration: 0.6, ease: 'expo.out' }, '-=0.5')
    .to('.box__inside', { clipPath: 'circle(0% at 50% 50%)', duration: 0.9, ease: 'expo.inOut' }, '+=0.25')
    .add(heroIn, '-=0.55');
  box.addEventListener('click', () => tl.progress(1));
}

/* parallax del muro de polaroids */
const wall = $('#wall');
if (motion && matchMedia('(pointer: fine)').matches) {
  const items = $$('[data-depth]', wall).map((el) => ({ el, d: +el.dataset.depth, x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }) }));
  $('.hero').addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    items.forEach((it) => { it.x(nx * it.d); it.y(ny * it.d); });
  });
}

/* ----------------------------------------------------------
   LA RUOTA · pizzas dibujadas con sus ingredientes
   ---------------------------------------------------------- */
const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs, parent) => {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function scatter(n, rMax, minD, R, avoid = []) {
  const pts = [];
  let tries = 0;
  while (pts.length < n && tries < n * 60) {
    tries++;
    const a = R() * Math.PI * 2, r = Math.sqrt(R()) * rMax;
    const p = { x: Math.cos(a) * r, y: Math.sin(a) * r, a: R() * 360 };
    if ([...pts, ...avoid].every((q) => Math.hypot(q.x - p.x, q.y - p.y) > minD)) pts.push(p);
  }
  return pts;
}
const blob = (cx, cy, r, R, k = 0.28, pts = 9) => {
  let d = '';
  const P = [];
  for (let i = 0; i < pts; i++) { const a = (i / pts) * Math.PI * 2; const rr = r * (1 - k / 2 + R() * k); P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  for (let i = 0; i < pts; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % pts];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    d += i === 0 ? `M${mx.toFixed(1)} ${my.toFixed(1)}` : '';
    const [x2, y2] = P[(i + 1) % pts], [x3, y3] = P[(i + 2) % pts];
    d += ` Q${x2.toFixed(1)} ${y2.toFixed(1)} ${((x2 + x3) / 2).toFixed(1)} ${((y2 + y3) / 2).toFixed(1)}`;
  }
  return d + 'Z';
};

const DRAW = {
  mozz(g, R, n = 8) { scatter(n, 62, 26, R).forEach((p) => svgEl('path', { d: blob(p.x, p.y, 12 + R() * 5, R, 0.4), fill: '#FFF7E4', stroke: '#EADAB9', 'stroke-width': 1 }, g)); },
  salami(g, R, n = 9) {
    scatter(n, 66, 24, R).forEach((p) => {
      const s = svgEl('g', { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, g);
      svgEl('circle', { r: 10, fill: '#A9302A', stroke: '#7B1E19', 'stroke-width': 1.4 }, s);
      for (let k = 0; k < 4; k++) svgEl('circle', { cx: (R() - 0.5) * 11, cy: (R() - 0.5) * 11, r: 1.4 + R(), fill: '#F0BFA9' }, s);
    });
  },
  frank(g, R, n = 14) { scatter(n, 68, 15, R).forEach((p) => { svgEl('circle', { cx: p.x, cy: p.y, r: 5.6, fill: '#D98267', stroke: '#B45F48', 'stroke-width': 1 }, g); svgEl('circle', { cx: p.x, cy: p.y, r: 3, fill: 'none', stroke: '#EDB09A', 'stroke-width': 0.8 }, g); }); },
  funghi(g, R, n = 12) { scatter(n, 66, 17, R).forEach((p) => svgEl('path', { d: 'M-8 1 Q-8 -8 0 -8 Q8 -8 8 1 L3 1 L3.5 7 L-3.5 7 L-3 1 Z', fill: '#D3B791', stroke: '#8F7350', 'stroke-width': 1, transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})` }, g)); },
  cotto(g, R, n = 7) { scatter(n, 60, 28, R).forEach((p) => svgEl('path', { d: blob(p.x, p.y, 13, R, 0.55, 7), fill: '#F2A9A1', stroke: '#D9867D', 'stroke-width': 1.2 }, g)); },
  crudo(g, R, n = 6) {
    scatter(n, 58, 30, R).forEach((p) => {
      const t = `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})`;
      svgEl('path', { d: 'M-18 -4 Q-9 -12 0 -5 Q9 2 18 -6 L18 4 Q9 12 0 5 Q-9 -2 -18 6 Z', fill: '#C24F57', transform: t }, g);
      svgEl('path', { d: 'M-18 5 Q-9 -1 0 5 Q9 11 18 4', fill: 'none', stroke: '#F6DCD3', 'stroke-width': 2, transform: t }, g);
    });
  },
  rucola(g, R, n = 14) { scatter(n, 64, 14, R).forEach((p) => svgEl('path', { d: 'M0 0 L4 -4 L3 -9 L7 -12 L5 -17 L9 -21 L2 -19 L-1 -14 L-4 -16 L-3 -10 L-6 -8 L-1 -5 Z', fill: R() > 0.5 ? '#4D8A38' : '#3A6E2A', transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})` }, g)); },
  grana(g, R, n = 12) { scatter(n, 66, 12, R).forEach((p) => svgEl('path', { d: 'M-4 -2 L3 -4 L5 1 L0 4 L-5 2 Z', fill: '#F2E1A8', stroke: '#D7C17E', 'stroke-width': 0.8, transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})` }, g)); },
  anchoa(g, R, n = 7) { scatter(n, 60, 22, R).forEach((p) => svgEl('rect', { x: -12, y: -2, width: 24, height: 4, rx: 2, fill: '#8B5A3B', transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})` }, g)); },
  capers(g, R, n = 14) { scatter(n, 66, 10, R).forEach((p) => svgEl('circle', { cx: p.x, cy: p.y, r: 2.8, fill: '#6E7F39', stroke: '#4F5D25', 'stroke-width': 0.7 }, g)); },
  olive(g, R, n = 10) { scatter(n, 66, 14, R).forEach((p) => svgEl('circle', { cx: p.x, cy: p.y, r: 4.4, fill: 'none', stroke: '#2B2A26', 'stroke-width': 3 }, g)); },
  tuna(g, R, n = 10) { scatter(n, 62, 18, R).forEach((p) => svgEl('path', { d: blob(p.x, p.y, 7, R, 0.6, 6), fill: '#C9A27E', stroke: '#A3805E', 'stroke-width': 1 }, g)); },
  onion(g, R, n = 10) { scatter(n, 64, 15, R).forEach((p) => svgEl('path', { d: 'M-9 0 A9 9 0 0 1 9 0', fill: 'none', stroke: '#CFA2CF', 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})` }, g)); },
  bacon(g, R, n = 6) {
    scatter(n, 58, 26, R).forEach((p) => {
      const t = `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})`;
      svgEl('path', { d: 'M-15 0 Q-10 -6 -5 0 T5 0 T15 0', fill: 'none', stroke: '#B24538', 'stroke-width': 6, 'stroke-linecap': 'round', transform: t }, g);
      svgEl('path', { d: 'M-15 0 Q-10 -6 -5 0 T5 0 T15 0', fill: 'none', stroke: '#F3C9B6', 'stroke-width': 1.6, 'stroke-linecap': 'round', transform: t }, g);
    });
  },
  egg(g, R) { svgEl('path', { d: blob(0, 0, 25, R, 0.35, 10), fill: '#FFFDF6', stroke: '#EFE5D0' }, g); svgEl('circle', { cx: 2, cy: -1, r: 10, fill: '#F2B02B', stroke: '#DB9216', 'stroke-width': 1 }, g); },
  chicken(g, R, n = 9) { scatter(n, 62, 20, R).forEach((p) => svgEl('path', { d: blob(p.x, p.y, 8, R, 0.5, 6), fill: '#E8C79A', stroke: '#C49C6A', 'stroke-width': 1 }, g)); },
  gorgo(g, R, n = 7) {
    scatter(n, 62, 24, R).forEach((p) => {
      svgEl('path', { d: blob(p.x, p.y, 11, R, 0.45), fill: '#F5F1E4', stroke: '#DCD5BF', 'stroke-width': 1 }, g);
      for (let k = 0; k < 4; k++) svgEl('circle', { cx: p.x + (R() - 0.5) * 12, cy: p.y + (R() - 0.5) * 12, r: 1.3, fill: '#5F8790' }, g);
    });
  },
  chili(g, R, n = 7) { scatter(n, 62, 18, R).forEach((p) => svgEl('path', { d: 'M-7 2 Q0 -6 8 -2 Q2 0 -7 2 Z', fill: '#D62F1F', stroke: '#A51E12', 'stroke-width': 0.8, transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})` }, g)); },
  mare(g, R) {
    scatter(5, 58, 26, R).forEach((p) => {
      const t = `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)})`;
      svgEl('path', { d: 'M8 -6 A9 9 0 1 0 8 6', fill: 'none', stroke: '#EF8A5B', 'stroke-width': 5.5, 'stroke-linecap': 'round', transform: t }, g);
      svgEl('path', { d: 'M8 -6 A9 9 0 1 0 8 6', fill: 'none', stroke: '#F8C3A4', 'stroke-width': 1, 'stroke-dasharray': '2 3', transform: t }, g);
    });
    scatter(5, 62, 24, R).forEach((p) => svgEl('ellipse', { cx: p.x, cy: p.y, rx: 10, ry: 5.5, fill: '#2F2A3B', stroke: '#6A6182', 'stroke-width': 1.4, transform: `rotate(${p.a.toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, g));
    scatter(5, 64, 18, R).forEach((p) => svgEl('circle', { cx: p.x, cy: p.y, r: 6, fill: 'none', stroke: '#F5EEDF', 'stroke-width': 3 }, g));
  },
  quattro(g, R) {
    const cols = ['#FFF7E4', '#F2D27A', '#F5F1E4', '#F7E7B5'];
    scatter(14, 64, 20, R).forEach((p, i) => svgEl('path', { d: blob(p.x, p.y, 10 + R() * 4, R, 0.45), fill: cols[i % 4], stroke: '#DCCBA0', 'stroke-width': 1 }, g));
    DRAW.grana(g, R, 6);
  },
  oil(g, R) { scatter(7, 60, 22, R).forEach((p) => svgEl('path', { d: blob(p.x, p.y, 14, R, 0.5), fill: '#E9C46A', opacity: 0.35 }, g)); scatter(30, 76, 4, R).forEach((p) => svgEl('circle', { cx: p.x, cy: p.y, r: 0.9, fill: '#FFFFFF', opacity: 0.85 }, g)); },
  oregano(g, R) { scatter(55, 74, 3, R).forEach((p) => svgEl('rect', { x: p.x, y: p.y, width: 2.4, height: 1.4, fill: '#5C6D32', transform: `rotate(${p.a.toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, g)); },
  nutella(g) {
    svgEl('path', { d: 'M-50 -30 Q-20 -55 10 -38 T60 -20 M-62 2 Q-25 -22 8 -6 T66 10 M-52 34 Q-18 12 12 26 T58 40', fill: 'none', stroke: '#5A341E', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
    svgEl('path', { d: 'M-50 -30 Q-20 -55 10 -38 T60 -20 M-62 2 Q-25 -22 8 -6 T66 10 M-52 34 Q-18 12 12 26 T58 40', fill: 'none', stroke: '#8A5A3A', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.7 }, g);
  }
};

const baseG = $('#base'), topsG = $('#tops');
function drawBase(p) {
  baseG.innerHTML = '';
  if (p.calzone) {
    svgEl('path', { d: 'M-96 22 A96 96 0 0 1 96 22 Q0 40 -96 22 Z', fill: 'url(#crust)', stroke: '#9C5F2C', 'stroke-width': 2 }, baseG);
    svgEl('path', { d: 'M-80 18 A80 80 0 0 1 80 18', fill: 'none', stroke: '#F2D5A3', 'stroke-width': 3, opacity: 0.5 }, baseG);
    for (let k = -84; k <= 84; k += 12) svgEl('path', { d: `M${k} ${26 + Math.abs(k) * -0.02} q6 6 12 0`, fill: 'none', stroke: '#9C5F2C', 'stroke-width': 2.2 }, baseG);
    svgEl('path', { d: 'M-30 10 q10 -8 20 0 q10 8 20 0', fill: 'none', stroke: '#B8331F', 'stroke-width': 3, opacity: 0.8 }, baseG);
    return;
  }
  svgEl('circle', { r: 100, fill: 'url(#crust)' }, baseG);
  svgEl('circle', { r: 86, fill: p.bianca ? '#F1D6A2' : '#EBC488' }, baseG);
  if (!p.bianca) svgEl('circle', { r: 82, fill: 'url(#sauce)', filter: 'url(#rough)' }, baseG);
  else svgEl('circle', { r: 82, fill: '#F4DCAE', filter: 'url(#rough)' }, baseG);
}
function drawTops(p, i) {
  topsG.innerHTML = '';
  const R = rng(i * 17 + 5);
  p.t.forEach((k) => { const g = svgEl('g', { class: 'top' }, topsG); DRAW[k](g, R); });
}

const dial = $('#dial'), ringEl = $('#dialRing'), pizzaBox = $('#pizza');
const sel = $('#pizzaSel');
const N = PIZZAS.length, STEP = 360 / N;
let rot = 0, cur = -1, size = 'm';
const labels = PIZZAS.map((p, i) => {
  const l = document.createElement('div');
  l.className = 'dial__lbl';
  l.innerHTML = `<span>${p.s || p.n}</span>`;
  ringEl.appendChild(l);
  sel.insertAdjacentHTML('beforeend', `<option value="${i}">${String(i + 1).padStart(2, '0')} · ${p.n}</option>`);
  return l;
});
function paintDial() {
  const D = dial.offsetWidth, R0 = D * 0.355;
  const small = D < 470;
  labels.forEach((l, i) => {
    const a = (((i * STEP + rot) % 360) + 360) % 360;
    const span = l.firstElementChild;
    if (small) { l.style.transform = `rotate(${a}deg) translateY(${-D * 0.44}px)`; span.style.transform = 'translate(-50%, -50%)'; span.textContent = '•'; return; }
    if (span.textContent === '•') span.textContent = PIZZAS[i].s || PIZZAS[i].n;
    if (a <= 180) { l.style.transform = `rotate(${a - 90}deg) translateX(${R0}px)`; span.style.transform = 'translate(0, -50%)'; }
    else { l.style.transform = `rotate(${a + 90}deg) translateX(${-R0}px)`; span.style.transform = 'translate(-100%, -50%)'; }
  });
  const idx = ((Math.round(-rot / STEP) % N) + N) % N;
  if (idx !== cur) select(idx, false);
}
function select(i, fromUI = true) {
  const prev = cur;
  cur = i;
  const p = PIZZAS[i];
  labels.forEach((l, k) => l.classList.toggle('is-on', k === i));
  sel.value = String(i);
  $('#pickN').textContent = `${String(i + 1).padStart(2, '0')} / ${N}`;
  $('#pickName').textContent = p.n;
  $('#pickIng').textContent = p.d;
  const fBtn = $('[data-size="f"]');
  fBtn.disabled = !p.f;
  fBtn.style.opacity = p.f ? '' : '.35';
  if (!p.f && size === 'f') setSize('m', false);
  paintPrice();
  drawBase(p); drawTops(p, i);
  if (motion && prev !== -1) {
    gsap.fromTo('#tops .top > *', { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.2)', stagger: { each: 0.008, from: 'random' } });
    gsap.fromTo('#pickName', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
  }
  if (fromUI) spinTo(-i * STEP);
}
function paintPrice() {
  const p = PIZZAS[cur];
  const v = size === 'f' && p.f ? p.f : p.m;
  $('#pickPrice').textContent = v;
}
function setSize(s, animate = true) {
  size = s;
  $$('.size [role="radio"]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.size === s)));
  pizzaBox.classList.toggle('is-m', s === 'm');
  paintPrice();
  if (animate && motion) gsap.fromTo('#pickPrice', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'expo.out' });
}
let spinTween = null;
function spinTo(target) {
  // camino más corto
  const delta = ((target - rot) % 360 + 540) % 360 - 180;
  const end = rot + delta;
  if (spinTween) spinTween.kill();
  if (!motion) { rot = end; paintDial(); return; }
  const o = { r: rot };
  spinTween = gsap.to(o, { r: end, duration: 0.9, ease: 'expo.out', onUpdate: () => { rot = o.r; paintDial(); } });
}
$$('.size [role="radio"]').forEach((b) => b.addEventListener('click', () => !b.disabled && setSize(b.dataset.size)));
$$('[data-step]').forEach((b) => b.addEventListener('click', () => select((cur + +b.dataset.step + N) % N)));
sel.addEventListener('change', () => select(+sel.value));

// arrastre circular con inercia
let dragging = false, lastA = 0, vel = 0, moved = 0;
const angleAt = (e) => { const r = dial.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
dial.addEventListener('pointerdown', (e) => {
  dragging = true; moved = 0; lastA = angleAt(e); vel = 0;
  if (spinTween) spinTween.kill();
  dial.classList.add('is-drag'); dial.setPointerCapture(e.pointerId);
});
dial.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const a = angleAt(e);
  let d = a - lastA; if (d > 180) d -= 360; if (d < -180) d += 360;
  lastA = a; rot += d; vel = d; moved += Math.abs(d);
  paintDial();
});
function release() {
  if (!dragging) return;
  dragging = false; dial.classList.remove('is-drag');
  if (moved < 2) return;
  const target = Math.round((rot + vel * 8) / STEP) * STEP;
  const o = { r: rot };
  if (spinTween) spinTween.kill();
  spinTween = gsap.to(o, { r: target, duration: motion ? 1.1 : 0.01, ease: 'expo.out', onUpdate: () => { rot = o.r; paintDial(); } });
}
dial.addEventListener('pointerup', release);
dial.addEventListener('pointercancel', release);
dial.addEventListener('wheel', (e) => {
  if (!e.shiftKey) return;
  e.preventDefault();
  select((cur + (e.deltaY > 0 ? 1 : -1) + N) % N);
}, { passive: false });

// carta
$('#plist').innerHTML = PIZZAS.map((p) => `<li class="${p.hot ? 'is-hot' : ''}"><span>${p.n}<small>${p.d}</small></span><i></i><b>${p.f ? `${p.m}<em>·</em>${p.f}` : p.m}</b></li>`).join('') +
  '<li><span>Pizza cortada</span><i></i><b>+1,00</b></li>';

// enlace directo a una pizza: ?pizza=parigina o ?pizza=14
const slug = (t) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const want = new URLSearchParams(location.search).get('pizza');
let first = 0;
if (want) { const k = isNaN(+want) ? PIZZAS.findIndex((p) => slug(p.n) === slug(want)) : +want - 1; if (k >= 0 && k < N) first = k; }
rot = -first * STEP;
select(first, false);
paintDial();
addEventListener('resize', paintDial);

/* ----------------------------------------------------------
   IL TAVOLO · baraja de fotos
   ---------------------------------------------------------- */
const deck = $('#deck'), deckCap = $('#deckCap');
let order = PHOTOS.map((_, i) => i);
const cardEls = PHOTOS.map((p, i) => {
  const c = document.createElement('figure');
  c.className = 'card';
  c.innerHTML = `<img src="${p.src}" alt="${p.cap.replace(/[“”"!¡]/g, '')}" loading="lazy" draggable="false"><p>${p.cap}</p>`;
  deck.appendChild(c);
  return c;
});
const tilt = (k) => [0, -4, 5, -2, 3][k % 5];
function layoutDeck(animate = true) {
  order.forEach((idx, k) => {
    const c = cardEls[idx];
    c.style.zIndex = String(PHOTOS.length - k);
    const vars = { x: 0, y: k * 6, rotation: k === 0 ? 0 : tilt(k), scale: 1 - Math.min(k, 4) * 0.035, opacity: k > 4 ? 0 : 1 };
    if (hasGSAP) gsap.to(c, { ...vars, duration: animate && motion ? 0.6 : 0, ease: 'expo.out' });
  });
  deckCap.textContent = PHOTOS[order[0]].cap;
}
function flyTop(dir) {
  const top = cardEls[order[0]];
  const finish = () => { order.push(order.shift()); layoutDeck(); };
  if (!motion) { finish(); return; }
  gsap.to(top, { x: dir * 700, rotation: dir * 30, opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => { gsap.set(top, { opacity: 0 }); finish(); } });
}
function prevCard() { order.unshift(order.pop()); const c = cardEls[order[0]]; if (motion) gsap.fromTo(c, { x: -600, rotation: -25, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }); layoutDeck(); }
$('#deckNext').addEventListener('click', () => flyTop(1));
$('#deckPrev').addEventListener('click', prevCard);
let dx0 = 0, ddx = 0, dDrag = false;
deck.addEventListener('pointerdown', (e) => {
  const top = cardEls[order[0]];
  if (!top.contains(e.target)) return;
  dDrag = true; dx0 = e.clientX; ddx = 0; deck.setPointerCapture(e.pointerId);
});
deck.addEventListener('pointermove', (e) => {
  if (!dDrag) return;
  ddx = e.clientX - dx0;
  gsap.set(cardEls[order[0]], { x: ddx, rotation: ddx * 0.06 });
});
function deckUp() {
  if (!dDrag) return;
  dDrag = false;
  if (Math.abs(ddx) > 110) flyTop(Math.sign(ddx));
  else gsap.to(cardEls[order[0]], { x: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
}
deck.addEventListener('pointerup', deckUp);
deck.addEventListener('pointercancel', deckUp);
deck.tabIndex = 0;
deck.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') flyTop(1); if (e.key === 'ArrowLeft') prevCard(); });
layoutDeck(false);

/* ----------------------------------------------------------
   LA TELE · cambia de canal
   ---------------------------------------------------------- */
const tvV = $('#tvVideo'), noise = $('#noise'), osd = $('#osd'), knob = $('#knob'), tvSound = $('#tvSound');
const nctx = noise.getContext('2d');
let ch = 0, noiseOn = false, knobRot = 0, actx = null;
function drawNoise() {
  if (!noiseOn) return;
  const img = nctx.createImageData(noise.width, noise.height);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  nctx.putImageData(img, 0, 0);
  requestAnimationFrame(drawNoise);
}
function hiss() {
  if (tvV.muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const len = Math.floor(actx.sampleRate * 0.4), buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.12;
    const s = actx.createBufferSource(); s.buffer = buf; s.connect(actx.destination); s.start();
  } catch (e) { /* sin audio */ }
}
function zap() {
  ch = (ch + 1) % CHANNELS.length;
  knobRot += 90;
  knob.style.transform = `rotate(${knobRot}deg)`;
  noiseOn = true; noise.style.opacity = '1'; drawNoise(); hiss();
  osd.textContent = CHANNELS[ch].name;
  setTimeout(() => {
    tvV.poster = CHANNELS[ch].poster;
    tvV.src = CHANNELS[ch].src;
    tvV.play().catch(() => {});
    setTimeout(() => { noiseOn = false; noise.style.opacity = '0'; }, 250);
  }, 300);
}
knob.addEventListener('click', zap);
tvSound.addEventListener('click', () => {
  if (!tvV.getAttribute('src')) tvV.src = tvV.dataset.src;
  tvV.muted = !tvV.muted;
  $('i', tvSound).className = tvV.muted ? 'ph-light ph-speaker-slash' : 'ph-light ph-speaker-high';
  tvSound.setAttribute('aria-label', tvV.muted ? 'Activar sonido' : 'Silenciar');
  tvV.play().catch(() => {});
});

/* ----------------------------------------------------------
   SCROLL REVEALS
   ---------------------------------------------------------- */
if (motion) {
  const reveal = (sel2, trig, vars = {}) => gsap.from(sel2, { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, ...vars, scrollTrigger: { trigger: trig || sel2, start: 'top 82%' } });
  reveal('.ruota__head > *', '.ruota__head');
  gsap.from('.dial', { rotation: -90, scale: 0.8, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.ruota__stage', start: 'top 75%' } });
  reveal('.pick', '.ruota__stage', { x: 50, y: 0 });
  reveal('.carta__head > *', '.carta__head');
  gsap.from('.sheet', { y: 80, rotation: -1.5, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.sheet', start: 'top 85%' } });
  reveal('.tavolo__copy > *', '.tavolo');
  gsap.from('.deck', { rotation: 10, y: 80, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.deck', start: 'top 85%' } });
  reveal('.tv-sec__copy > *', '.tv-sec');
  gsap.from('.tv', { y: 90, rotation: 3, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.tv', start: 'top 85%' } });
  reveal('.famiglia > .kicker, .famiglia > .h2', '.famiglia');
  reveal('.fam__card', '.fam', { stagger: 0.12 });
  gsap.from('.press', { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.press', start: 'top 85%' } });
  reveal('.dove__info > *', '.dove', { stagger: 0.05 });
  gsap.from('.foot__big', { yPercent: 50, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.foot', start: 'top 88%' } });
  addEventListener('load', () => ScrollTrigger.refresh());
}
})();
