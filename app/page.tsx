import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { SpaceManifest } from "@/lib/channel-types";
import { LobbyCard } from "@/components/LobbyCard";

interface LobbyEntry {
  slug: string;
  manifest: SpaceManifest;
  trackCount: number;
}

async function loadAllSpaces(): Promise<{ thisWeek: LobbyEntry[]; archive: { slug: string; week: string; title: string; dj: string; trackCount: number }[] }> {
  const root = path.resolve("public/spaces");
  let slugs: string[] = [];
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    slugs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return { thisWeek: [], archive: [] };
  }

  const thisWeek: LobbyEntry[] = [];
  const archive: { slug: string; week: string; title: string; dj: string; trackCount: number }[] = [];

  for (const slug of slugs) {
    let weeks: string[];
    try {
      const weekEntries = await fs.readdir(path.join(root, slug), { withFileTypes: true });
      weeks = weekEntries.filter((e) => e.isDirectory()).map((e) => e.name).sort().reverse();
    } catch {
      continue;
    }
    if (!weeks.length) continue;

    for (let i = 0; i < weeks.length; i++) {
      try {
        const raw = await fs.readFile(path.join(root, slug, weeks[i], "manifest.json"), "utf8");
        const manifest = JSON.parse(raw) as SpaceManifest;
        const trackCount = manifest.segments.filter((s) => s.type === "track").length;
        if (i === 0) {
          thisWeek.push({ slug, manifest, trackCount });
        } else {
          archive.push({ slug, week: weeks[i], title: manifest.title, dj: manifest.dj.name, trackCount });
        }
      } catch {
        /* skip */
      }
    }
  }

  return { thisWeek, archive };
}

export default async function LobbyPage() {
  const { thisWeek, archive } = await loadAllSpaces();

  return (
    <div
      className="min-h-screen text-text"
      style={{
        background:
          "radial-gradient(ellipse at 15% 5%, #2a1830 0%, transparent 45%)," +
          "radial-gradient(ellipse at 85% 95%, #1a2b3a 0%, transparent 45%)," +
          "#0b0a10",
        padding: "60px 8vw 80px",
      }}
    >
      {/* header */}
      <header className="flex items-baseline justify-between mb-14">
        <div className="font-serif text-3xl tracking-tight">
          aniradio<span className="text-text/50">.</span>
        </div>
        <nav className="flex gap-7 text-[11px] uppercase tracking-[0.25em] text-text/40">
          <span className="text-text">this week</span>
          <a href="#archive" className="hover:text-text/80 transition-colors">archive</a>
          <span>about</span>
        </nav>
      </header>

      {/* intro */}
      <div className="max-w-xl mb-12">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] text-text">
          six rooms.<br />
          one DJ each.<br />
          refreshed every monday.
        </h1>
        <p className="text-text/55 mt-4 text-sm leading-relaxed">
          pick a room. stay as long as you want. the music keeps coming in a different order each time.
        </p>
      </div>

      {/* grid */}
      {thisWeek.length === 0 ? (
        <p className="text-text/50 text-sm italic">
          no rooms have been generated yet. run{" "}
          <code className="text-text/80">node scripts/generate-space.mjs --space &lt;slug&gt; --week ...</code>
        </p>
      ) : (
        <div className="grid gap-5 mb-14"
             style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {thisWeek.map(({ slug, manifest, trackCount }) => (
            <Link key={slug} href={`/spaces/${slug}`} className="block">
              <LobbyCard slug={slug} manifest={manifest} trackCount={trackCount} />
            </Link>
          ))}
        </div>
      )}

      {/* archive */}
      {archive.length > 0 && (
        <div id="archive" className="border-t border-text/[0.08] pt-7 mt-9">
          <h3 className="text-[11px] uppercase tracking-[0.25em] text-text/40 mb-5 font-normal">
            previous weeks
          </h3>
          <div className="flex gap-7 overflow-x-auto pb-2">
            {archive.map((a, i) => (
              <Link
                key={i}
                href={`/spaces/${a.slug}?week=${a.week}`}
                className="flex-shrink-0 text-xs text-text/65 hover:text-text border-l border-text/10 pl-3.5 transition-colors"
              >
                <div className="text-[10px] uppercase tracking-[0.18em] text-text/35 mb-1">
                  {a.week} · {a.slug}
                </div>
                <div>
                  {a.title} · with {a.dj} · {a.trackCount} tracks
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
