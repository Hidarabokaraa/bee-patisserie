"""Inline the traced logo into index.src.html -> index.html.

Placeholders:
  {{LOGO_FULL}}  animated intro logo (ids per part, one <path> per letter)
  {{SPRITE}}     hidden <symbol>s for reuse (nav, footer)
  {{GUIDE_BEE}}  the scroll-guide bee (wing separated for flutter)
Run from the project root:  python tools/build.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
svg = (ROOT / "assets/logo.svg").read_text()

groups = {}
for gid, fill, body in re.findall(r'<g id="([\w-]+)" fill="(#\w+)"[^>]*>(.*?)</g>', svg):
    groups[gid] = (fill, re.findall(r'<path d="([^"]+)"/>', body))


def bbox(d):
    nums = list(map(float, re.findall(r"-?\d+\.?\d*", d)))
    xs, ys = nums[0::2], nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)


def paths(gid, cls):
    fill, ds = groups[gid]
    return "".join(f'<path class="{cls}" d="{d}"/>' for d in ds)


# identify the wing: the ink component with the biggest bbox area
ink = groups["bee-ink"][1]
areas = [(lambda b: (b[2] - b[0]) * (b[3] - b[1]))(bbox(d)) for d in ink]
wing_i = areas.index(max(areas))
ink_parts = "".join(
    f'<path class="{"wing" if i == wing_i else "ink"}" d="{d}"/>' for i, d in enumerate(ink)
)
stripes = paths("bee-stripes", "stripe")
bee_inner = f'<g class="stripes" fill="#f7931e">{stripes}</g><g class="inks" fill="#1c1a1b">{ink_parts}</g>'

VB = "210 355 700 375"
BEE_VB = "585 355 330 285"

logo_full = f'''<svg class="logo-anim" viewBox="{VB}" role="img" aria-label="Bee Group Patisserie">
  <defs><clipPath id="clipBee"><rect x="200" y="330" width="400" height="238"/></clipPath></defs>
  <path class="intro-trail" d="M40 900 C 240 620 520 960 560 700 S 330 420 500 400 S 800 300 745 495" fill="none"/>
  <g class="word-bee" clip-path="url(#clipBee)" fill="#f7931e">{paths("word-bee","l")}</g>
  <g class="word-group" fill="#1c1a1b">{paths("word-group","l")}</g>
  <g class="word-pat" fill="#f7931e">{paths("word-pat","l")}</g>
  <g class="logo-bee">{bee_inner}</g>
</svg>'''

def raw(gid):
    return "".join('<path d="%s"/>' % d for d in groups[gid][1])


all_paths = "".join(
    f'<g fill="{groups[g][0]}" fill-rule="evenodd">{raw(g)}</g>'
    for g in ["word-bee", "word-group", "word-pat", "bee-stripes", "bee-ink"]
)
word_bee_only = f'<g fill="currentColor">{raw("word-bee")}</g>'
bee_only = f'<g style="fill:var(--stripe,#f7931e)">{raw("bee-stripes")}</g><g fill="#1c1a1b">{raw("bee-ink")}</g>'
sprite = f'''<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="sym-logo" viewBox="{VB}">{all_paths}</symbol>
  <symbol id="sym-bee" viewBox="{BEE_VB}">{bee_only}</symbol>
  <symbol id="sym-word" viewBox="215 420 375 150">{word_bee_only}</symbol>
</svg>'''

guide_bee = f'<svg viewBox="{BEE_VB}" aria-hidden="true"><g class="gb">{bee_inner}</g></svg>'

src = (ROOT / "index.src.html").read_text(encoding="utf-8")
out = (src.replace("{{LOGO_FULL}}", logo_full)
          .replace("{{SPRITE}}", sprite)
          .replace("{{GUIDE_BEE}}", guide_bee))
(ROOT / "index.html").write_text(out, encoding="utf-8")

# favicon: just the bee
(ROOT / "assets/favicon.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{BEE_VB}">{bee_only}</svg>')
print("built index.html", len(out), "bytes")
