#!/usr/bin/env node
/**
 * Capture marketing screenshots of aniradio for the README.
 *
 * Drives the running dev server (assumed at http://localhost:3000) with
 * puppeteer-core + the system Chrome. For each room it navigates to the
 * room URL with ?play=1 (auto-skips the start screen), waits long enough
 * for the channel to land in the music phase (DJ intro then song), and
 * snaps a PNG into docs/screenshots/.
 *
 * Run:  node scripts/screenshots.mjs
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs/promises";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3000";
const OUT = path.resolve("docs/screenshots");
const WIDTH = 1440;
const HEIGHT = 900;

await fs.mkdir(OUT, { recursive: true });

const shots = [
  {
    file: "01-lobby.png",
    url: "/",
    waitMs: 1500,
    fullPage: false,
  },
  {
    file: "02-bedroom-pop.png",
    url: "/spaces/bedroom-pop?play=1",
    waitMs: 14000, // intro ~10s + transition + start of track DJ
    fullPage: false,
  },
  {
    file: "03-lofi-study.png",
    url: "/spaces/lofi-study?play=1",
    waitMs: 14000,
    fullPage: false,
  },
  {
    file: "04-forest-at-dusk.png",
    url: "/spaces/forest-at-dusk?play=1",
    waitMs: 14000,
    fullPage: false,
  },
  {
    file: "05-late-drive.png",
    url: "/spaces/late-drive?play=1",
    waitMs: 14000,
    fullPage: false,
  },
  {
    file: "06-golden-hour.png",
    url: "/spaces/golden-hour?play=1",
    waitMs: 14000,
    fullPage: false,
  },
  {
    file: "07-sunday-kitchen.png",
    url: "/spaces/sunday-kitchen?play=1",
    waitMs: 14000,
    fullPage: false,
  },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 },
  // --autoplay-policy: without this, audio.play() rejects in headless and
  // our player's catch handler advances through every segment immediately,
  // landing on the End screen instead of the music phase we want to capture.
  args: ["--no-sandbox", "--mute-audio", "--autoplay-policy=no-user-gesture-required"],
});
console.log(`browser launched · ${WIDTH}×${HEIGHT}@2x`);

try {
  for (const shot of shots) {
    console.log(`\n→ ${shot.file}`);
    const page = await browser.newPage();
    await page.goto(BASE + shot.url, { waitUntil: "networkidle2", timeout: 60_000 });
    console.log(`  navigated. waiting ${shot.waitMs}ms for state…`);
    await new Promise((r) => setTimeout(r, shot.waitMs));
    const out = path.join(OUT, shot.file);
    await page.screenshot({ path: out, fullPage: shot.fullPage });
    console.log(`  ✓ ${out}`);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`\nAll screenshots written to ${OUT}`);
