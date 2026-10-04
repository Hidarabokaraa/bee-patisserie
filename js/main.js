/* =========================================================
   Bee Group Patisserie — motion engine
   1. Intro: the traced logo assembles itself, then flies into the nav
   2. Signature: "The Bee's Flight" — the logo bee flies down the site
      on a honey trail drawn by your scroll, and lands in the footer
   3. Scenes: hero depth parallax, velocity marquee, word lighting,
      honey drips, horizontal signatures, honeycomb assembly, stacked cards
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- seeded random so drips/paths are stable ---------- */
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => (lenis ? lenis.scrollTo(target, { duration: 1.6 }) : $(target)?.scrollIntoView());

  /* ---------- honey drips generator ---------- */
  function makeDrips(svg, seed, count = 16) {
    const r = rng(seed);
    const band = 26;
    let html = `<rect x="0" y="-2" width="1440" height="${band + 2}"/>`;
    for (let i = 0; i < count; i++) {
      const x = ((i + 0.5) / count) * 1440 + (r() - 0.5) * 50;
      const w = 22 + r() * 34;
      const L = 30 + r() * 110;
      html += `<path class="drip" d="M${x - w / 2} ${band - 1}C${x - w / 2} ${band + L * 0.55} ${x - w * 0.42} ${band + L} ${x} ${band + L}C${x + w * 0.42} ${band + L} ${x + w / 2} ${band + L * 0.55} ${x + w / 2} ${band - 1}Z"/>`;
      if (r() > 0.6) html += `<circle class="drop" cx="${x}" cy="${band + L + 14}" r="${w * 0.22}"/>`;
    }
    svg.innerHTML = html;
  }
  makeDrips($(".loader__drips"), 7, 18);
  $$(".drips").forEach((s, i) => makeDrips(s, 11 + i * 17, 14));

  /* ---------- split words (keeps <em>) for word lighting ---------- */
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.append(part);
            else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.append(s); }
          });
          n.replaceWith(frag);
        } else walk(n);
      });
    };
    walk(el);
    return $$(".w", el);
  }
  const words = splitWords($("[data-light]"));

  /* ---------- hero motes ---------- */
  const motes = $(".motes");
  const mr = rng(3);
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("span");
    s.style.left = mr() * 100 + "%";
    s.style.top = mr() * 100 + "%";
    const k = 0.5 + mr() * 1.4;
    s.style.transform = `scale(${k})`;
    motes.append(s);
  }

  /* ---------- marquee: duplicate for seamless loop ---------- */
  const track = $(".marquee__track");
  track.innerHTML += track.innerHTML;

  /* ---------- nav / menu ---------- */
  const nav = $(".nav");
  const burger = $(".nav__burger");
  const menu = $(".menu");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", open);
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("is-open")); lenis?.stop(); }
    else { menu.classList.remove("is-open"); setTimeout(() => (menu.hidden = true), 700); lenis?.start(); }
  }
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      if (burger.getAttribute("aria-expanded") === "true") setMenu(false);
      scrollTo(id);
    })
  );

  /* =========================================================
     REDUCED MOTION: show everything, skip the show
     ========================================================= */
  if (reduce) {
    $(".loader").remove();
    document.body.classList.remove("is-loading");
    $$("[data-count]").forEach((b) => (b.textContent = b.dataset.count + (b.dataset.suffix || "")));
    return;
  }

  /* =========================================================
     1. INTRO
     ========================================================= */
  const loader = $(".loader");
  const L = $(".logo-anim");
  const lBee = $(".logo-bee", L);
  const lPath = $(".intro-trail", L);
  const bLetters = $$(".word-bee path", L);
  const gLetters = $$(".word-group path", L);
  const pLetters = $$(".word-pat path", L);
  const svgNS = "http://www.w3.org/2000/svg";

  // hide hero pieces until the curtain lifts
  gsap.set(".hero__title .line > span", { yPercent: 115 });
  gsap.set([".hero__eyebrow", ".hero__ar", ".hero__sub", ".hero__ctas", ".hero__scroll"], { opacity: 0, y: 24 });
  gsap.set(".arch", { opacity: 0, scale: 0.7, y: 80 });
  gsap.set(".nav", { opacity: 0 });

  // wing flutter for every bee we own
  $$(".wing").forEach((w) =>
    gsap.to(w, { scaleY: 0.45, transformOrigin: "15% 95%", duration: 0.055, repeat: -1, yoyo: true, ease: "sine.inOut" })
  );

  const bb = lBee.getBBox();
  const rest = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
  const pLen = lPath.getTotalLength();
  const pEnd = lPath.getPointAtLength(pLen);

  gsap.set(bLetters, { y: 250 });
  gsap.set(gLetters, { opacity: 0, x: (i) => (2 - i) * 34 });
  pLetters.forEach((p) => {
    const b = p.getBBox();
    p._dot = b.height < 30; // the tittles on the i's
  });
  gsap.set(pLetters.filter((p) => !p._dot), { opacity: 0, y: 60, transformOrigin: "50% 100%" });
  gsap.set(pLetters.filter((p) => p._dot), { opacity: 0, y: -160 });
  gsap.set(".loader__tag span", { opacity: 0, y: 18 });

  // bee rides the intro path, dropping pollen as it goes
  const fly = { p: 0 };
  let lastDrop = 0;
  function placeLoaderBee() {
    const l = fly.p * pLen;
    const pt = lPath.getPointAtLength(l);
    const ah = lPath.getPointAtLength(Math.min(pLen, l + 4));
    const ang = (Math.atan2(ah.y - pt.y, ah.x - pt.x) * 180) / Math.PI;
    const s = 0.55 + 0.45 * fly.p;
    const tilt = (1 - fly.p) * Math.sin(fly.p * 14) * 18 + (1 - fly.p) * ang * 0.15;
    lBee.setAttribute(
      "transform",
      `translate(${pt.x - pEnd.x} ${pt.y - pEnd.y}) rotate(${tilt} ${rest.x} ${rest.y}) translate(${rest.x} ${rest.y}) scale(${s}) translate(${-rest.x} ${-rest.y})`
    );
    if (l - lastDrop > 26 && fly.p < 0.97) {
      lastDrop = l;
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("class", "pollen");
      c.setAttribute("cx", pt.x - pEnd.x + rest.x);
      c.setAttribute("cy", pt.y - pEnd.y + rest.y + 30);
      c.setAttribute("r", 4.5);
      L.insertBefore(c, L.firstChild.nextSibling);
      gsap.to(c, { attr: { r: 0 }, opacity: 0, duration: 1.4, delay: 0.3, ease: "power2.in", onComplete: () => c.remove() });
    }
  }
  placeLoaderBee();

  const meter = { v: 0 };
  const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
  intro
    .to(".loader__hex", { opacity: 1, duration: 1.2, ease: "power2.out" }, 0)
    .to(meter, {
      v: 100, duration: 3.3, ease: "power1.inOut",
      onUpdate: () => {
        $(".loader__count").textContent = Math.round(meter.v);
        gsap.set(".loader__meter i", { scaleX: meter.v / 100 });
      },
    }, 0)
    .to(fly, { p: 1, duration: 1.9, ease: "power2.inOut", onUpdate: placeLoaderBee }, 0.15)
    .to(bLetters, { y: 0, duration: 1.1, stagger: 0.11 }, 0.95)
    .to(gLetters, { opacity: 1, x: 0, duration: 1, stagger: 0.04 }, 1.45)
    .to(pLetters.filter((p) => !p._dot), { opacity: 1, y: 0, duration: 0.9, stagger: 0.045, ease: "back.out(2.2)" }, 1.55)
    .to(pLetters.filter((p) => p._dot), { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "bounce.out" }, 2.05)
    // happy landing wiggle
    .to(lBee, { rotation: 8, svgOrigin: `${rest.x} ${rest.y + 60}`, duration: 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" }, 2.08)
    .to(".loader__tag span", { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 2.3);

  function exitIntro() {
    const navLogo = $(".nav__logo");
    const a = L.getBoundingClientRect();
    const b = navLogo.getBoundingClientRect();
    const tl = gsap.timeline({ defaults: { ease: "expo.inOut" } });
    tl.to([".loader__tag", ".loader__meter"], { opacity: 0, y: -10, duration: 0.5, ease: "power2.in" }, 0)
      .to(L, {
        x: b.left + b.width / 2 - (a.left + a.width / 2),
        y: b.top + b.height / 2 - (a.top + a.height / 2),
        scale: b.width / a.width, duration: 1.25,
      }, 0.15)
      .to(".loader__bg", { yPercent: -118, duration: 1.3 }, 0.3)
      .set(".nav", { opacity: 1 }, 1.4)
      .set(loader, { display: "none" }, 1.42)
      .add(heroIn, 0.95)
      .add(() => {
        document.body.classList.remove("is-loading");
        lenis?.start();
        ScrollTrigger.refresh();
        releaseGuideBee();
      }, 1.3);
  }

  function heroIn() {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(".hero__title .line > span", { yPercent: 0, duration: 1.5, stagger: 0.1 }, 0)
      .to(".arch", { opacity: 1, scale: 1, y: 0, duration: 1.8, stagger: 0.09 }, 0.1)
      .to(".hero__eyebrow", { opacity: 1, y: 0, duration: 1.2 }, 0.2)
      .to([".hero__ar", ".hero__sub", ".hero__ctas", ".hero__scroll"], { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.45);
    return tl;
  }

  const start = () => {
    intro.play(0);
    intro.eventCallback("onComplete", () => gsap.delayedCall(0.35, exitIntro));
  };
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2200))]).then(start);

  /* =========================================================
     2. SIGNATURE — THE BEE'S FLIGHT
     ========================================================= */
  const flight = $(".flight");
  const trail = $(".flight__trail");
  const reveal = $(".flight__reveal");
  const guide = $(".guide-bee");
  const home = $(".footer__bee");
  const F = { samples: [], len: 0, end: { x: 0, y: 0 }, fEnd: 0.5, cur: 0, dir: 1, ready: false, released: false, landed: false };

  function catmull(pts) {
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      d += `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function buildFlight() {
    flight.style.height = "0px";
    const W = document.documentElement.clientWidth;
    const H = document.documentElement.scrollHeight;
    const vh = innerHeight;
    flight.style.height = H + "px";
    flight.setAttribute("viewBox", `0 0 ${W} ${H}`);
    reveal.setAttribute("width", W + 100);

    const hb = home.getBoundingClientRect();
    const end = { x: hb.left + hb.width / 2, y: hb.top + scrollY + hb.height / 2 };
    const maxScroll = H - vh;
    F.fEnd = gsap.utils.clamp(0.15, 0.9, (end.y - maxScroll) / vh);

    const r = rng(42);
    const m = Math.max(28, W * 0.055);
    const pts = [{ x: W * 0.8, y: vh * 0.55 }];
    let y = vh * 0.55, side = 0;
    while (y < end.y - vh * 1.1) {
      y += vh * (0.8 + r() * 0.35);
      side ^= 1;
      const inset = r() < 0.25 ? W * (0.18 + r() * 0.12) : m + r() * W * 0.05;
      pts.push({ x: side ? W - inset : inset, y });
    }
    pts.push({ x: W * 0.5 + (end.x - W * 0.5) * 0.4, y: (y + end.y) / 2 });
    pts.push(end);
    trail.setAttribute("d", catmull(pts));

    F.len = trail.getTotalLength();
    const n = Math.ceil(F.len / 5);
    F.samples = new Array(n + 1);
    let maxY = -Infinity;
    for (let i = 0; i <= n; i++) {
      const l = (i / n) * F.len;
      const p = trail.getPointAtLength(l);
      maxY = Math.max(maxY, p.y); // enforce monotone y for the lookup
      F.samples[i] = { l, x: p.x, y: maxY };
    }
    F.honey = $$(".marquee, .footer").map((el) => {
      const r = el.getBoundingClientRect();
      return [r.top + scrollY, r.bottom + scrollY];
    });
    F.end = end;
    F.maxScroll = maxScroll;
    F.vh = vh;
    F.ready = true;
  }

  function lengthForY(ty) {
    const s = F.samples;
    let lo = 0, hi = s.length - 1;
    if (ty <= s[0].y) return 0;
    if (ty >= s[hi].y) return F.len;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (s[mid].y < ty) lo = mid; else hi = mid; }
    const a = s[lo], b = s[hi];
    return a.l + ((ty - a.y) / (b.y - a.y || 1)) * (b.l - a.l);
  }
  function pointAt(l) {
    const s = F.samples;
    const f = (l / F.len) * (s.length - 1);
    const i = Math.min(s.length - 2, Math.floor(f)), t = f - i;
    return { x: s[i].x + (s[i + 1].x - s[i].x) * t, y: s[i].y + (s[i + 1].y - s[i].y) * t };
  }

  const gSet = {
    x: gsap.quickSetter(guide, "x", "px"),
    y: gsap.quickSetter(guide, "y", "px"),
    r: gsap.quickSetter(guide, "rotation", "deg"),
    sx: gsap.quickSetter(guide, "scaleX"),
  };
  const bw = () => guide.offsetWidth, bh = () => guide.offsetHeight;
  gsap.set(home, { opacity: 0.18 });

  function releaseGuideBee() {
    buildFlight();
    const nb = $(".nav__logo").getBoundingClientRect();
    const target = pointAt(lengthForY(scrollY + F.vh * 0.55));
    F.cur = lengthForY(scrollY + F.vh * 0.55);
    const o = { t: 0 };
    gsap.set(guide, { opacity: 1 });
    gsap.to(o, {
      t: 1, duration: 1.4, ease: "power3.inOut",
      onUpdate: () => {
        const sx = nb.right - nb.width * 0.2, sy = nb.top + nb.height * 0.4;
        const tx = target.x, ty = target.y - scrollY;
        const arc = Math.sin(o.t * Math.PI) * 120;
        gSet.x(sx + (tx - sx) * o.t - bw() / 2 - arc * 0.4);
        gSet.y(sy + (ty - sy) * o.t - bh() / 2 + arc);
        gSet.r(Math.sin(o.t * 12) * 14 * (1 - o.t));
        gsap.set(guide, { scale: 0.35 + 0.65 * o.t });
      },
      onComplete: () => (F.released = true),
    });
  }

  let smoothScale = 1;
  gsap.ticker.add((time) => {
    if (!F.ready || !F.released) return;
    const sy = scrollY;
    const tail = gsap.utils.clamp(0, 1, (sy - (F.maxScroll - F.vh)) / F.vh);
    const f = 0.55 + (F.fEnd - 0.55) * tail;
    const target = lengthForY(sy + F.vh * f);
    F.cur += (target - F.cur) * 0.09;
    const p = pointAt(F.cur);
    const ahead = pointAt(Math.min(F.len, F.cur + 30));
    const dx = ahead.x - p.x, dy = ahead.y - p.y;
    const moving = Math.abs(target - F.cur) > 0.5;
    if (Math.abs(dx) > 2 && moving) F.dir = dx > 0 ? -1 : 1; // the logo bee faces left
    smoothScale += (F.dir - smoothScale) * 0.12;
    const tilt = gsap.utils.clamp(-28, 28, (Math.atan2(dy, Math.abs(dx) + 0.001) * 180) / Math.PI * 0.35) * -F.dir;
    const bob = Math.sin(time * 3.2) * 5;
    gSet.x(p.x - bw() / 2);
    gSet.y(p.y - sy - bh() / 2 + bob);
    gSet.r(tilt + Math.sin(time * 2.1) * 4);
    gSet.sx(Math.abs(smoothScale) < 0.08 ? 0.08 * Math.sign(smoothScale || 1) : smoothScale);
    reveal.setAttribute("height", Math.max(0, p.y));
    const onHoney = F.honey.some(([a, b]) => p.y > a && p.y < b);
    if (onHoney !== F.onHoney) { F.onHoney = onHoney; guide.classList.toggle("on-honey", onHoney); }

    // landing: the bee returns home to the footer logo
    const near = Math.hypot(p.x - F.end.x, p.y - F.end.y) < 24;
    if (near !== F.landed) {
      F.landed = near;
      gsap.to(guide, { opacity: near ? 0 : 1, scale: near ? 1.6 : 1, duration: 0.45, ease: "power2.out" });
      gsap.to(home, { opacity: near ? 1 : 0.18, scale: near ? 1 : 0.94, duration: 0.6, ease: "back.out(2)" });
    }
  });
  ScrollTrigger.addEventListener("refresh", () => F.released && buildFlight());

  /* =========================================================
     3. SCENES
     ========================================================= */
  const mm = gsap.matchMedia();

  // nav: solid after hero start, hide on scroll down
  ScrollTrigger.create({
    start: 60, end: "max",
    onUpdate: (self) => {
      nav.classList.add("is-solid");
      nav.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > innerHeight * 0.8);
    },
    onLeaveBack: () => nav.classList.remove("is-solid", "is-hidden"),
  });

  // hero: photos scatter outward on scroll (depth parallax)
  const scatter = { "arch--a": [-120, -10], "arch--b": [140, 9], "arch--c": [-90, -14], "arch--d": [110, 12] };
  $$(".arch").forEach((el) => {
    const key = [...el.classList].find((c) => scatter[c]);
    const [x, rot] = scatter[key];
    gsap.to(el, {
      x, rotation: rot, yPercent: parseFloat(el.dataset.speed) * 160, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  });
  gsap.to(".hero__copy", {
    yPercent: 22, opacity: 0.1, scale: 0.94, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__glow", { scale: 1.4, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  $$(".motes span").forEach((s, i) =>
    gsap.to(s, { y: gsap.utils.random(-60, 60), x: gsap.utils.random(-30, 30), opacity: gsap.utils.random(0.2, 0.7), duration: gsap.utils.random(5, 11), repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.2 })
  );

  // hero: mouse depth parallax (desktop)
  if (!coarse) {
    const px = gsap.quickTo(".hero__photos", "x", { duration: 1.2, ease: "power3" });
    const py = gsap.quickTo(".hero__photos", "y", { duration: 1.2, ease: "power3" });
    const cx = gsap.quickTo(".hero__copy", "x", { duration: 1.4, ease: "power3" });
    const mx = gsap.quickTo(".motes", "x", { duration: 1, ease: "power3" });
    addEventListener("mousemove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      px(nx * -34); py(ny * -24); cx(nx * 10); mx(nx * 50);
    });
  }

  // marquee: loops forever, speeds up & skews with scroll velocity
  const mq = gsap.to(".marquee__track", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
  const skew = gsap.quickTo(".marquee__track", "skewX", { duration: 0.5, ease: "power3" });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onUpdate: (self) => {
      const v = self.getVelocity();
      mq.timeScale(1 + Math.min(4, Math.abs(v) / 500) * (v < 0 ? -1 : 1));
      skew(gsap.utils.clamp(-8, 8, v / -300));
      gsap.to(mq, { timeScale: 1, duration: 1.2, overwrite: true, delay: 0.1 });
    },
  });

  // masked line reveals on every section heading
  $$(".reveal-lines").forEach((h) =>
    gsap.from($$(".line > span", h), {
      yPercent: 115, duration: 1.4, stagger: 0.1, ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 85%" },
    })
  );
  $$(".eyebrow:not(.hero__eyebrow)").forEach((e) =>
    gsap.from(e, { opacity: 0, x: -30, duration: 1, ease: "expo.out", scrollTrigger: { trigger: e, start: "top 88%" } })
  );

  // manifesto: word-by-word lighting
  gsap.to(words, {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: ".manifesto__text", start: "top 78%", end: "bottom 42%", scrub: true },
  });
  gsap.from(".manifesto__ar", { opacity: 0, y: 30, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".manifesto__ar", start: "top 90%" } });
  gsap.from(".manifesto__stamp", { scale: 0, rotation: -120, duration: 1.4, ease: "back.out(1.6)", scrollTrigger: { trigger: ".manifesto__stamp", start: "top 95%" } });

  // honey drips grow as each section arrives
  $$(".drips").forEach((svg) => {
    const drips = $$(".drip", svg), drops = $$(".drop", svg);
    gsap.fromTo(drips, { scaleY: 0.08 }, {
      scaleY: 1, transformOrigin: "50% 0%", ease: "none", stagger: { each: 0.02, from: "random" },
      scrollTrigger: { trigger: svg.parentElement, start: "top 95%", end: "top 25%", scrub: 0.6 },
    });
    gsap.fromTo(drops, { opacity: 0, y: -30 }, {
      opacity: 1, y: 40, ease: "power2.in", stagger: 0.05,
      scrollTrigger: { trigger: svg.parentElement, start: "top 40%", end: "top -10%", scrub: 0.6 },
    });
  });

  // signatures: pinned horizontal journey
  function horizontal(targets, distance) {
    const tween = gsap.to(targets, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: ".signature", start: "top top", end: () => "+=" + distance(),
        pin: ".signature__pin", scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    gsap.to(".signature__progress i", {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: ".signature", start: "top top", end: () => "+=" + distance(), scrub: true, invalidateOnRefresh: true },
    });
    $$(".card").forEach((card) => {
      gsap.fromTo($(".card__img img", card), { xPercent: -7 }, {
        xPercent: 7, ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
      });
      gsap.from($$(".card__body > *", card), {
        opacity: 0, x: 60, stagger: 0.06, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 75%" },
      });
    });
  }
  const sTrack = $(".signature__track"), sHead = $(".signature__head");
  mm.add("(min-width: 901px)", () => horizontal([sHead, sTrack], () => sHead.offsetWidth + sTrack.scrollWidth - innerWidth));
  mm.add("(max-width: 900px)", () => horizontal([sTrack], () => sTrack.scrollWidth - innerWidth));

  // standard: pillars rise, counters count
  gsap.from(".pillar", {
    y: 90, opacity: 0, rotation: (i) => [-3, 0, 3][i], duration: 1.4, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".pillars", start: "top 82%" },
  });
  $$("[data-count]").forEach((b) => {
    const to = parseFloat(b.dataset.count), dec = (b.dataset.count.split(".")[1] || "").length;
    const o = { v: 0 };
    gsap.to(o, {
      v: to, duration: 2.2, ease: "power3.out",
      scrollTrigger: { trigger: b, start: "top 88%" },
      onUpdate: () => (b.textContent = o.v.toFixed(dec) + (b.dataset.suffix || "")),
    });
  });

  // hive: scattered photos fly into a honeycomb
  const cells = $$(".cell");
  gsap.set(cells, { xPercent: -50, yPercent: -50 });
  const slot = (i) => {
    const w = cells[0].offsetWidth, h = cells[0].offsetHeight, g = w * 0.07;
    if (i === 0) return { x: 0, y: 0 };
    const a = [[1, 0], [0.5, -1], [-0.5, -1], [-1, 0], [-0.5, 1], [0.5, 1]][i - 1];
    return { x: a[0] * (w + g), y: a[1] * (h * 0.75 + g * 0.87) };
  };
  const sr = rng(9);
  const scatterPos = cells.map(() => ({ x: (sr() - 0.5) * 1.4, y: (sr() - 0.5) * 1.2, r: (sr() - 0.5) * 90 }));
  const hive = gsap.timeline({
    scrollTrigger: { trigger: ".hive", start: "top top", end: "+=160%", pin: ".hive__pin", scrub: 1, invalidateOnRefresh: true },
  });
  hive.fromTo(cells,
    {
      x: (i) => scatterPos[i].x * innerWidth, y: (i) => scatterPos[i].y * innerHeight,
      rotation: (i) => scatterPos[i].r, scale: 0.45, opacity: 0,
    },
    { x: (i) => slot(i).x, y: (i) => slot(i).y, rotation: 0, scale: 1, opacity: 1, ease: "power3.out", stagger: 0.06, duration: 1 }
  )
    .fromTo(".cell--core svg", { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, ease: "back.out(2)", duration: 0.4 }, 0.8)
    .to(cells, { scale: 0.96, duration: 0.3, stagger: { each: 0.03, from: "center" } }, 1.1)
    .to(cells, { scale: 1, duration: 0.3, stagger: { each: 0.03, from: "center" } }, 1.4)
    .fromTo(".hive__ig", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 1.3);

  // occasions: sticky cards that settle back as the next one lands
  const occ = $$(".occ");
  occ.forEach((c, i) => {
    c.style.setProperty("--i", i);
    if (i === occ.length - 1) return;
    gsap.to(c, {
      scale: 1 - (occ.length - 1 - i) * 0.035, "--dim": 0.28, ease: "none",
      scrollTrigger: { trigger: occ[i + 1], start: "top bottom", end: "top 20%", scrub: true },
    });
  });
  occ.forEach((c) =>
    gsap.from($$(".occ__txt > *", c), { y: 50, opacity: 0, stagger: 0.07, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: c, start: "top 70%" } })
  );
  occ.forEach((c) => {
    const art = $(".occ__art, .occ__img", c);
    if (art) gsap.fromTo(art, { yPercent: 18 }, { yPercent: -10, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // visit
  gsap.from(".branch", {
    y: 100, opacity: 0, duration: 1.4, stagger: 0.14, ease: "expo.out",
    scrollTrigger: { trigger: ".branches", start: "top 85%" },
  });

  // footer: the word rises
  gsap.from(".footer__big svg:first-child", {
    yPercent: 45, opacity: 0, duration: 1.6, ease: "expo.out",
    scrollTrigger: { trigger: ".footer", start: "top 70%" },
  });

  /* =========================================================
     4. CURSOR + MAGNETIC
     ========================================================= */
  if (!coarse) {
    const cur = $(".cursor"), label = $(".cursor__label");
    const qx = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const qy = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); cur.style.opacity = 1; }, { passive: true });
    document.addEventListener("mouseleave", () => (cur.style.opacity = 0));
    document.addEventListener("mouseover", (e) => {
      const img = e.target.closest(".card__img, .cell, .arch, .occ__img");
      const link = e.target.closest("a, button");
      cur.classList.toggle("is-img", !!img && !link);
      cur.classList.toggle("is-link", !!link);
      label.textContent = img ? "Taste" : "";
    });
    $$(".magnetic").forEach((m) => {
      const xTo = gsap.quickTo(m, "x", { duration: 0.6, ease: "elastic.out(1, .4)" });
      const yTo = gsap.quickTo(m, "y", { duration: 0.6, ease: "elastic.out(1, .4)" });
      m.addEventListener("mousemove", (e) => {
        const r = m.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      m.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  $(".year").textContent = new Date().getFullYear();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
