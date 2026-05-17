import fs from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import type { SpaceManifest } from "@/lib/channel-types";
import { ChannelPlayer } from "@/components/ChannelPlayer";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ week?: string }>;
}

async function loadManifest(slug: string, week?: string): Promise<SpaceManifest | null> {
  const root = path.resolve(`public/spaces/${slug}`);
  let weekDir = week;
  if (!weekDir) {
    // pick the most recent week directory
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      const weeks = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort().reverse();
      weekDir = weeks[0];
    } catch {
      return null;
    }
  }
  if (!weekDir) return null;
  try {
    const raw = await fs.readFile(path.join(root, weekDir, "manifest.json"), "utf8");
    return JSON.parse(raw) as SpaceManifest;
  } catch {
    return null;
  }
}

export default async function SpacePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { week } = await searchParams;
  const manifest = await loadManifest(slug, week);
  if (!manifest) notFound();
  return <ChannelPlayer manifest={manifest} />;
}
