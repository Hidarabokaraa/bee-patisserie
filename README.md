# Bee Group Patisserie — website

A cinematic one-page site for **Bee Patisserie** (Mazzeh & Salhieh, Damascus).

- **Intro:** the vector-traced logo assembles itself — the bee flies in, letters rise, then the logo flies into the nav while a honey-drip curtain lifts.
- **Signature scroll — "The Bee's Flight":** the logo bee flies down the whole page on a honey trail drawn by your scroll, and lands home in the footer logo.
- Scenes: depth-parallax hero, velocity marquee, word-by-word story lighting, honey drips, pinned horizontal signatures, honeycomb assembly, stacking occasion cards.
- Bilingual accents (English / Arabic), mobile layout, `prefers-reduced-motion` fallback.

## Edit & build
Edit `index.src.html`, `css/style.css`, `js/main.js`, then run:

```bash
python tools/build.py
```

The build inlines the traced logo (`assets/logo.svg`) into `index.html`. No other dependencies — GSAP, ScrollTrigger and Lenis are vendored in `assets/vendor/`.
