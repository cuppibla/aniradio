# Changelog

## v0.1.0 — initial release (2026-05-16)

First public version: lobby + six pre-generated rooms, all DJ voices and music in place.

### Added
- **Lobby** (`app/page.tsx`) — reads every `public/spaces/<slug>/<week>/manifest.json` from disk, renders a grid of room cards with per-room mini-scene previews, links into each room. Archive section for previous weeks.
- **ChannelPlayer** (`components/ChannelPlayer.tsx`) — playback engine for channel-mode rooms. Plays DJ intro → song → DJ intro → song → … through the segment list. Controls: pause / skip / restart / leave. Audio-progress-driven needle position (no fake timers). Channel ticker showing the next two upcoming tracks.
- **Six per-room scenes** (`components/scenes/`) — fully different visual identities:
  - `BedroomPopScene` — vinyl + aurora orb (Mira)
  - `LofiStudyScene` — cassette tape, rain, desk-lamp glow (Yui)
  - `ForestScene` — three-layer treeline, fireflies, drifting lantern (Sora)
  - `LateDriveScene` — neon sun, perspective grid floor, car-radio LCD, scanlines (Theo)
  - `SundayKitchenScene` — sunlit window, dust particles, vintage AM/FM radio (Wren)
  - `GoldenHourScene` — low sun lens flare, picnic blanket, portable boombox (Iris)
- **Generation pipeline** (`scripts/generate-space.mjs`):
  - Gemini 3 Flash writes DJ intros from per-DJ system prompts
  - Lyria 3 Pro generates ~2-minute songs from music prompts
  - Chirp 3 HD synthesizes DJ voice with per-DJ `speaking_rate`
  - All API calls run in parallel per-room (~60–110s wall time)
  - Resilient: a failed Lyria call doesn't kill the batch; manifest reflects what landed
- **Editor-facing track lists** — six `spaces/<slug>/week-2026-05-19.json` files with hand-authored titles, invented artists, music prompts, and per-track DJ hints
- **Pipeline flags**:
  - `--only <ids>` — regenerate listed tracks and merge into existing manifest (no full rebuild)
  - `--resynth-voice` — re-run Chirp on existing scripts using current voice config (~1s per room)
  - `--limit N` — smoke test with first N tracks
  - `--skip-music` / `--skip-voice` — isolate one half of the pipeline
- **Static design mocks** at `/mocks/lobby.html`, `/mocks/space-lofi.html`, `/mocks/space-forest.html`, `/mocks/space-late-drive.html` — full-fidelity HTML versions of the design system
- **README** with hero screenshot, architecture diagram, model docs, and Lyria safety-filter pattern reference
- **Screenshot script** (`scripts/screenshots.mjs`) — puppeteer-core driver that captures the lobby + each room

### Generation stats
- **68 / 68 tracks** have music (100% coverage after 4 retry passes for safety-filter holdouts)
- **84 / 84 DJ intros** generated
- **~110 minutes** of total music across the six rooms
- **~195 MB** of generated audio shipped in the repo

### Lyria 3 Pro safety filter — patterns discovered
Hard blocks: real artist names, "whispered/breathy vocals," "vinyl crackle"/"tape hiss," field-recording cues ("distant cicadas," "footsteps on pine needles"). Soft blocks: 4–5 minute pieces with "no rhythm." Workarounds: replace with explicit chord progressions, named instruments, "very minimal soft brushed percussion," and 2-minute defaults. README documents the full pattern table.

### Tech debt acknowledged
- Lobby's "now: track in progress" pulse is currently static decoration — no real listener telemetry yet
- Mobile layouts not implemented (desktop-first)
- No archive UI for browsing prior weeks (data is there, link works, but no dedicated page)
- ElevenLabs voice engine planned but not yet wired (Chirp 3 HD reads well but is optimized for clarity over warmth)

### Known constraints
- Chirp 3 HD voices reject the `pitch` parameter — only `speakingRate` is honored
- Vertex AI's REST transport (`fallback: true`) is required for the `@google-cloud/text-to-speech` Node client; the gRPC client fails under Next.js / Turbopack bundling
- Lyria 3 Pro requires `responseModalities: ["AUDIO", "TEXT"]` in the request config; without it, Vertex returns `400 INVALID_ARGUMENT`
