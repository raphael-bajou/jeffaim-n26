// Effets visuels + interactions du one-page (aucune dépendance).
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Apparition au scroll ---------- */
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
);
document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

/* ---------- Navbar opaque après le hero + parallax ---------- */
const navbar = document.getElementById("navbar");
const parallax = [...document.querySelectorAll<HTMLElement>(".parallax")];
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    navbar?.toggleAttribute("data-scrolled", y > 40);
    if (!reduceMotion) {
      for (const el of parallax) {
        const speed = Number(el.dataset.speed ?? 0.1);
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      }
    }
    ticking = false;
  });
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Projecteur qui suit la souris sur les cartes ---------- */
document.addEventListener("pointermove", (ev) => {
  const card = (ev.target as HTMLElement).closest<HTMLElement>(".pizza-card");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${ev.clientX - r.left}px`);
  card.style.setProperty("--my", `${ev.clientY - r.top}px`);
});

/* ---------- Braises qui s'envolent dans le hero ---------- */
const canvas = document.getElementById("embers") as HTMLCanvasElement | null;
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext("2d")!;
  type Ember = { x: number; y: number; r: number; vy: number; vx: number; life: number; max: number; hue: number };
  let embers: Ember[] = [];
  let w = 0;
  let h = 0;
  let visible = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (): Ember => {
    const max = 180 + Math.random() * 260;
    return {
      x: w * (0.15 + Math.random() * 0.7),
      y: h + 10,
      r: 0.6 + Math.random() * 2.2,
      vy: 0.5 + Math.random() * 1.3,
      vx: (Math.random() - 0.5) * 0.4,
      life: 0,
      max,
      hue: 20 + Math.random() * 30,
    };
  };
  const count = () => Math.round(Math.min(90, w / 14));
  const tick = () => {
    if (visible) {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      while (embers.length < count()) embers.push(spawn());
      embers = embers.filter((e) => e.life < e.max && e.y > -20);
      for (const e of embers) {
        e.life++;
        e.y -= e.vy;
        e.x += e.vx + Math.sin((e.life + e.r * 50) / 30) * 0.35;
        const t = e.life / e.max;
        const alpha = Math.sin(Math.PI * t) * 0.9;
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
        g.addColorStop(0, `hsla(${e.hue}, 100%, 70%, ${alpha})`);
        g.addColorStop(1, `hsla(${e.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  window.addEventListener("resize", resize);
  resize();
  tick();
}

/* ---------- Filtres de la carte ---------- */
const cards = [...document.querySelectorAll<HTMLElement>("[data-pizza]")];
const baseBtns = [...document.querySelectorAll<HTMLButtonElement>("[data-filter-base]")];
const ingBtns = [...document.querySelectorAll<HTMLButtonElement>("[data-filter-ing]")];
const resetBtn = document.getElementById("reset-filtres");
const resultats = document.getElementById("resultats");
const aucune = document.getElementById("aucune");

const data = cards.map((el) => ({
  el,
  base: el.dataset.base ?? "",
  ings: JSON.parse(el.dataset.ingredients ?? "[]") as string[],
}));

const selected = { bases: new Set<string>(), ings: new Set<string>() };

const matches = (p: (typeof data)[number], bases: Set<string>, ings: Set<string>) =>
  (bases.size === 0 || bases.has(p.base)) && [...ings].every((i) => p.ings.includes(i));

const render = () => {
  let n = 0;
  for (const p of data) {
    const ok = matches(p, selected.bases, selected.ings);
    p.el.hidden = !ok;
    if (ok) {
      n++;
      p.el.classList.add("is-visible");
    }
    p.el.querySelectorAll<HTMLElement>("[data-chip]").forEach((c) => {
      c.toggleAttribute("data-match", selected.ings.has(c.dataset.chip!));
    });
  }
  // compteurs : combien de pizzas si on ajoute ce filtre
  for (const b of baseBtns) {
    const v = b.dataset.filterBase!;
    const on = selected.bases.has(v);
    const c = data.filter((p) => matches(p, on ? selected.bases : new Set([v]), selected.ings)).length;
    b.querySelector("[data-count]")!.textContent = String(c);
    b.setAttribute("aria-pressed", String(on));
    b.disabled = !on && c === 0;
  }
  for (const b of ingBtns) {
    const v = b.dataset.filterIng!;
    const on = selected.ings.has(v);
    const c = data.filter((p) => matches(p, selected.bases, new Set([...selected.ings, v]))).length;
    b.querySelector("[data-count]")!.textContent = String(c);
    b.setAttribute("aria-pressed", String(on));
    b.disabled = !on && c === 0;
  }
  const active = selected.bases.size + selected.ings.size > 0;
  resetBtn?.classList.toggle("hidden", !active);
  if (resultats) resultats.textContent = active ? `${n} pizza${n > 1 ? "s" : ""}` : "";
  aucune?.classList.toggle("hidden", n > 0);
};

const toggle = (set: Set<string>, v: string) => (set.has(v) ? set.delete(v) : set.add(v));
baseBtns.forEach((b) => b.addEventListener("click", () => (toggle(selected.bases, b.dataset.filterBase!), render())));
ingBtns.forEach((b) => b.addEventListener("click", () => (toggle(selected.ings, b.dataset.filterIng!), render())));
resetBtn?.addEventListener("click", () => {
  selected.bases.clear();
  selected.ings.clear();
  render();
});
if (cards.length) render();

/* ---------- « Ce soir, rendez-vous à » (ou prochain rendez-vous) ---------- */
const today = new Date().getDay();
const places = [...document.querySelectorAll<HTMLElement>(".place[data-day]")];
let next: HTMLElement | undefined;
let delta = 0;
for (let d = 0; d < 7 && !next; d++) {
  next = places.find((p) => Number(p.dataset.day) === (today + d) % 7);
  delta = d;
}
if (next) {
  if (delta === 0) next.setAttribute("data-today", "");
  const titre = document.getElementById("ce-soir-titre");
  if (titre && delta > 0) {
    const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    titre.textContent = delta === 1 ? "Pas de rendez-vous ce soir · demain, on vous attend à" : `Prochain rendez-vous ${jours[Number(next.dataset.day)]} à`;
  }
  document.getElementById("ce-soir")?.classList.remove("hidden");
  document.getElementById("ce-soir-lieu")!.textContent = next.dataset.lieu ?? "";
  document.getElementById("ce-soir-infos")!.textContent = next.dataset.infos ?? "";
}
