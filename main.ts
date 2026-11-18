// THE TUESDAY WORLD — front page for Tuesday 17 November 2026.
// Draws the day's world news as a newspaper front page, programmatically,
// with a hand-built 5x7 pixel font. Node 22, stdlib only, no network.
// Deterministic: identical bytes on every run. Writes /output/entry.png
// (or $MAKEFUN_OUTPUT_DIR/entry.png).
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const W = 1024;
const H = 1024;

// ---- palette ----
const PAPER = [247, 242, 231, 255];
const INK = [22, 21, 19, 255];
const RED = [166, 30, 36, 255];
const BLUE = [31, 78, 121, 255];
const SKY = [220, 231, 238, 255];
const WATER = [111, 156, 192, 255];
const STEEL = [58, 63, 68, 255];
const SMOKE = [138, 138, 134, 255];
const FLAME = [224, 123, 36, 255];
const GOLD = [176, 134, 20, 255];
const LIGHT = [255, 255, 255, 255];

// ---- 5x7 pixel font (hand-drawn letterforms) ----
const FONT = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#..##", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#..##", "#.#.#", "##..#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "...#.", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  ";": [".....", ".##..", ".##..", ".....", ".##..", ".##..", ".#..."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  "-": [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
  "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."],
  ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
  $: ["..#..", ".####", "#.#..", ".###.", "..#.#", "####.", "..#.."],
  "%": ["##..#", "##.#.", "...#.", "..#..", ".#...", "#.##.", "#..##"],
  "&": [".##..", "#..#.", "#..#.", ".#...", "#.#.#", "#..#.", ".##.#"],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
  "+": [".....", "..#..", "..#..", ".###.", "..#..", "..#..", "....."],
  "=": [".....", ".....", ".###.", ".....", ".###.", ".....", "....."],
  '"': [".#.#.", ".#.#.", ".#.#.", ".....", ".....", ".....", "....."],
  "*": [".....", ".#.#.", ".###.", "#####", ".###.", ".#.#.", "....."],
  "—": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
};

// ---- canvas ----
const buf = Buffer.alloc(W * H * 4);
function px(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = c[3];
}
function fillRect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px(i, j, c);
}
function hline(x0, x1, y, c, t) {
  for (let t0 = 0; t0 < (t || 1); t0++) for (let x = x0; x <= x1; x++) px(x, y + t0, c);
}
function vline(x, y0, y1, c, t) {
  for (let t0 = 0; t0 < (t || 1); t0++) for (let y = y0; y <= y1; y++) px(x + t0, y, c);
}
function line(x0, y0, x1, y1, c, t) {
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, x = x0, y = y0;
  const th = t || 1, half = Math.floor(th / 2);
  for (;;) {
    for (let a = -half; a <= half; a++) for (let b = -half; b <= half; b++) px(x + a, y + b, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}
function circle(cx, cy, r, c, fill) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = x * x + y * y;
    if (fill ? d <= r * r : d <= r * r && d >= (r - 1) * (r - 1)) px(cx + x, cy + y, c);
  }
}
function ellipse(cx, cy, rx, ry, c) {
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    px(Math.round(cx + rx * Math.cos(rad)), Math.round(cy + ry * Math.sin(rad)), c);
  }
}
function poly(points, c, t) {
  for (let i = 0; i + 1 < points.length; i++) line(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], c, t);
}

// ---- text ----
function textWidth(s, scale) {
  return s.length * 6 * scale - scale;
}
function drawText(x, y, s, scale, c) {
  let cx = x;
  const up = s.toUpperCase();
  for (const ch of up) {
    const g = FONT[ch] || FONT["?"];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) {
      if (g[r][col] === "#") fillRect(cx + col * scale, y + r * scale, scale, scale, c);
    }
    cx += 6 * scale;
  }
}
function drawTextCenter(x0, x1, y, s, scale, c) {
  drawText(x0 + Math.floor((x1 - x0 - textWidth(s, scale)) / 2), y, s, scale, c);
}
function wrapText(s, maxW, scale) {
  const words = s.toUpperCase().split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? cur + " " + w : w;
    if (textWidth(trial, scale) <= maxW) cur = trial;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawBlock(x, y, s, maxW, scale, c, lh) {
  const lines = wrapText(s, maxW, scale);
  lines.forEach((ln, i) => drawText(x, y + i * (lh || 7 * scale + 4), ln, scale, c));
  return lines.length;
}

// ---- PNG encoder (stdlib zlib + hand-rolled CRC32) ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG() {
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0;
    buf.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- pictograms ----
function drawGlobe(x, y, c) {
  circle(x + 42, y + 32, 26, c, false);
  ellipse(x + 42, y + 32, 26, 10, c);
  ellipse(x + 42, y + 32, 11, 26, c);
  hline(x + 18, x + 66, y + 32, c, 1);
}
function drawTanker(x, y, c) {
  poly([[x + 6, y + 44], [x + 78, y + 44], [x + 72, y + 56], [x + 12, y + 56]], c, 2);
  fillRect(x + 52, y + 30, 18, 14, c);
  fillRect(x + 16, y + 36, 12, 8, c);
  line(x + 68, y + 30, x + 68, y + 22, c, 2);
  poly([[x + 30, y + 26], [x + 36, y + 14], [x + 42, y + 26]], FLAME, 2);
  hline(x + 4, x + 80, y + 61, BLUE, 1);
  hline(x + 10, x + 74, y + 63, BLUE, 1);
}
function drawBank(x, y, c) {
  poly([[x + 8, y + 22], [x + 42, y + 6], [x + 76, y + 22]], c, 2);
  hline(x + 8, x + 76, y + 24, c, 2);
  for (const cx of [16, 36, 56]) fillRect(x + cx, y + 28, 8, 24, c);
  hline(x + 8, x + 76, y + 54, c, 2);
  poly([[x + 42, y + 8], [x + 38, y + 14], [x + 46, y + 18], [x + 40, y + 24]], RED, 2);
}
function drawChip(x, y, c) {
  fillRect(x + 22, y + 20, 40, 26, c);
  fillRect(x + 32, y + 28, 20, 10, PAPER);
  for (let i = 0; i < 4; i++) {
    vline(x + 28 + i * 9, y + 12, y + 19, c, 2);
    vline(x + 28 + i * 9, y + 47, y + 54, c, 2);
    hline(x + 14, x + 21, y + 26 + i * 7, c, 2);
    hline(x + 63, x + 70, y + 26 + i * 7, c, 2);
  }
}
function drawPin(x, y, c) {
  circle(x + 42, y + 26, 18, c, false);
  circle(x + 42, y + 26, 6, c, true);
  poly([[x + 28, y + 38], [x + 42, y + 60], [x + 56, y + 38]], c, 2);
}

// ---- the lead illustration: Kerch Bridge, middle span down ----
function drawBridge(x0, y0, w, h) {
  fillRect(x0, y0, w, h, SKY);
  const waterY = y0 + h - 34;
  fillRect(x0, waterY, w, 34, WATER);
  for (let i = 0; i < 5; i++) {
    const wy = waterY + 6 + i * 6;
    for (let x = x0 + 8; x < x0 + w - 8; x += 26) hline(x, x + 14, wy, LIGHT, 1);
  }
  const deckY = y0 + 44;
  const gapL = x0 + Math.floor(w * 0.46), gapR = x0 + Math.floor(w * 0.56);
  // towers
  fillRect(x0 + 150, y0 + 6, 12, deckY - y0 + 4, STEEL);
  fillRect(x0 + w - 162, y0 + 6, 12, deckY - y0 + 4, STEEL);
  // cables
  line(x0 + 156, y0 + 8, x0 + 40, deckY, STEEL, 1);
  line(x0 + 156, y0 + 8, gapL - 8, deckY, STEEL, 1);
  line(x0 + w - 156, y0 + 8, gapR + 8, deckY, STEEL, 1);
  line(x0 + w - 156, y0 + 8, x0 + w - 40, deckY, STEEL, 1);
  // deck, left and right of the gap
  fillRect(x0 + 20, deckY, gapL - x0 - 20, 8, STEEL);
  fillRect(gapR, deckY, x0 + w - 20 - gapR, 8, STEEL);
  // collapsed span, tilted down into the water
  line(gapL - 4, deckY + 4, gapR - 30, waterY + 6, STEEL, 5);
  line(gapR - 30, waterY + 6, gapR + 6, deckY + 10, STEEL, 4);
  // smoke over the gap
  circle(x0 + Math.floor(w / 2) - 26, y0 + 18, 12, SMOKE, true);
  circle(x0 + Math.floor(w / 2) + 4, y0 + 10, 15, SMOKE, true);
  circle(x0 + Math.floor(w / 2) + 30, y0 + 20, 10, SMOKE, true);
  // blast flash at the break
  for (let a = 0; a < 8; a++) {
    const rad = (a * Math.PI) / 4;
    line(
      x0 + Math.floor(w / 2), deckY + 2,
      x0 + Math.floor(w / 2) + Math.round(20 * Math.cos(rad)),
      deckY + 2 + Math.round(14 * Math.sin(rad)), FLAME, 2
    );
  }
  // caption bar under the picture
  fillRect(x0, y0 + h - 2, w, 2, INK);
}

// ---- page ----
const MX = 30;          // margin
const CW = W - 2 * MX;  // content width

function rule(y, c, t) { hline(MX, W - MX, y, c, t); }

function storyCell(x, y, w, h, label, headline, deck, icon) {
  fillRect(x, y, w, 1, INK);
  drawText(x, y + 10, label, 2, RED);
  if (icon) icon(x + w - 84, y + 8, INK);
  const hw = icon ? w - 96 : w;
  const n = drawBlock(x, y + 30, headline, hw, 4, INK, 30);
  drawBlock(x, y + 30 + n * 30 + 6, deck, w, 3, INK, 24);
}

function build() {
  fillRect(0, 0, W, H, PAPER);
  let y = 22;
  rule(y, INK, 2); y += 12;
  drawTextCenter(MX, W - MX, y, "THE TUESDAY WORLD", 7, INK); y += 7 * 7 + 12;
  rule(y, RED, 3); y += 10;
  drawTextCenter(MX, W - MX, y, "TUESDAY 17 NOVEMBER 2026", 3, INK); y += 21 + 6;
  drawTextCenter(MX, W - MX, y, "THE WORLD'S NEWS IN ONE PAGE", 2, BLUE); y += 14 + 10;
  rule(y, INK, 1); y += 12;

  // lead story
  drawText(MX, y, "WAR IN UKRAINE", 2, RED); y += 20;
  drawText(MX, y, "UKRAINE HITS", 6, INK); y += 42 + 4;
  drawText(MX, y, "KERCH BRIDGE", 6, INK); y += 42 + 8;
  const deckLines = drawBlock(MX, y, "Road span to Crimea collapses in an 'unprecedented operation', Zelenskyy says; Russia confirms the damage and vows to rebuild.", CW, 3, INK, 25);
  y += deckLines * 25 + 8;
  drawBridge(MX, y, CW, 128); y += 128 + 12;
  rule(y, INK, 1); y += 12;

  // secondary grid: 2 columns x 3 rows
  const colW = Math.floor((CW - 20) / 2);
  const cellH = 146, gapY = 10;
  const stories = [
    { label: "ASIA", headline: "TRUMP IN ASIA", deck: "Lands in Manila for ASEAN summit; Thailand trade pact signed.", icon: drawGlobe },
    { label: "MIDDLE EAST", headline: "TANKERS HIT IN HORMUZ", deck: "Two tankers hit by mines; third US carrier arrives.", icon: drawTanker },
    { label: "BUSINESS", headline: "JPMORGAN OUTAGE", deck: "Bug, not hack, slows banking and Zelle payments for thousands.", icon: drawBank },
    { label: "TECHNOLOGY", headline: "NVIDIA EARNINGS", deck: "First results since Huang exit; chipmaker adds security panel.", icon: drawChip },
    { label: "EUROPE", headline: "RWANDA HUB", deck: "Five European states plan joint centre for rejected asylum seekers.", icon: drawPin },
    { label: "IN BRIEF", headline: "", deck: "", icon: null },
  ];
  stories.forEach((s, i) => {
    const cx = MX + (i % 2) * (colW + 20);
    const cy = y + Math.floor(i / 2) * (cellH + gapY);
    if (s.label === "IN BRIEF") {
      fillRect(cx, cy, colW, 1, INK);
      drawText(cx, cy + 10, "IN BRIEF", 2, RED);
      const briefs = [
        "BUFFETT GIVES $5.47BN TO FOUNDATIONS",
        "PENTAGON FAILS AUDIT FOR 9TH YEAR",
        "GTA VI HACKER PLEADS GUILTY",
        "PATTINSON IS THE NEXT JAMES BOND",
      ];
      briefs.forEach((b, j) => {
        fillRect(cx, cy + 36 + j * 22, 8, 8, RED);
        drawText(cx + 16, cy + 34 + j * 22, b, 2, INK);
      });
    } else {
      storyCell(cx, cy, colW, cellH, s.label, s.headline, s.deck, s.icon);
    }
  });
  y += 3 * cellH + 2 * gapY + 12;
  rule(y, INK, 2); y += 10;
  drawTextCenter(MX, W - MX, y, "ALL STORIES REPORTED ON TUESDAY 17 NOVEMBER 2026", 2, INK);
}

function main() {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  fs.mkdirSync(outDir, { recursive: true });
  build();
  const png = encodePNG();
  const outPath = path.join(outDir, "entry.png");
  fs.writeFileSync(outPath, png);
  console.log("wrote " + outPath + " (" + png.length + " bytes, " + W + "x" + H + ")");
}

main();
