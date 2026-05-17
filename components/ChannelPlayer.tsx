"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SpaceManifest, Segment, TrackSegment } from "@/lib/channel-types";
import { MiraOrb } from "./MiraOrb";
import { SCENES } from "./scenes";
import { BedroomPopScene } from "./scenes/BedroomPopScene";

type Phase =
  | { kind: "dj"; index: number; elapsedMs: number; durationMs: number }
  | { kind: "music"; index: number; elapsedMs: number; durationMs: number }
  | { kind: "transition"; index: number };

type Status = "ready" | "playing" | "paused" | "done";

interface Props {
  manifest: SpaceManifest;
}

export function ChannelPlayer({ manifest }: Props) {
  // Skip "intro" segments in the play flow — the first track's DJ intro
  // carries the opening. Avoids back-to-back DJ talks before any music.
  // (Outro stays — the warm goodbye after the last song still plays.)
  const segments = useMemo(
    () => manifest.segments.filter((s) => s.type !== "intro"),
    [manifest.segments]
  );

  const [status, setStatus] = useState<Status>("ready");
  const [phase, setPhase] = useState<Phase>({ kind: "dj", index: 0, elapsedMs: 0, durationMs: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex =
    phase.kind === "dj" || phase.kind === "music" || phase.kind === "transition"
      ? phase.index
      : 0;
  const currentSegment: Segment | undefined = segments[currentIndex];
  const nextTrackSeg = findNextTrack(segments, currentIndex + 1);
  const afterNextTrackSeg = nextTrackSeg
    ? findNextTrack(segments, segments.indexOf(nextTrackSeg) + 1)
    : null;
  const visibleTrack: TrackSegment | null =
    currentSegment?.type === "track" ? (currentSegment as TrackSegment) : null;

  // For progress on the vinyl needle:
  const musicProgress =
    phase.kind === "music" && phase.durationMs > 0
      ? phase.elapsedMs / phase.durationMs
      : 0;

  // ---- core playback ------------------------------------------------------

  const stopTicker = () => {
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = null;
  };
  const stopTransition = () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  };

  const startTicker = (kind: "dj" | "music") => {
    stopTicker();
    tickerRef.current = setInterval(() => {
      const a = audioRef.current;
      if (!a) return;
      setPhase((p) =>
        p.kind === kind
          ? { ...p, elapsedMs: a.currentTime * 1000, durationMs: (a.duration || 0) * 1000 }
          : p
      );
    }, 200);
  };

  const cancelAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }
    stopTicker();
    stopTransition();
  }, []);

  const advance = useCallback(
    (fromIndex: number) => {
      const next = fromIndex + 1;
      if (next >= segments.length) {
        setStatus("done");
        return;
      }
      setPhase({ kind: "transition", index: fromIndex });
      transitionTimerRef.current = setTimeout(() => {
        setPhase({ kind: "dj", index: next, elapsedMs: 0, durationMs: 0 });
      }, 900);
    },
    [segments.length]
  );

  const playUrl = useCallback(
    (url: string, kind: "dj" | "music", onEnd: () => void) => {
      cancelAudio();
      const a = new Audio(url);
      audioRef.current = a;
      a.onloadedmetadata = () => {
        setPhase((p) =>
          p.kind === kind ? { ...p, durationMs: (a.duration || 0) * 1000 } : p
        );
      };
      a.onended = () => {
        if (audioRef.current !== a) return;
        stopTicker();
        onEnd();
      };
      a.onerror = () => {
        if (audioRef.current !== a) return;
        stopTicker();
        onEnd();
      };
      // Guard the play() promise: if cancelAudio() ran while play() was
      // pending, the promise rejects with "interrupted by pause" and we
      // must NOT advance — we've already moved on.
      a.play().catch(() => {
        if (audioRef.current !== a) return;
        onEnd();
      });
      startTicker(kind);
    },
    [cancelAudio]
  );

  // The "driver" — react to phase + status changes and start whatever's needed.
  const lastDrivenRef = useRef<string>("");
  useEffect(() => {
    if (status !== "playing") return;
    const key = `${phase.kind}:${"index" in phase ? phase.index : ""}`;
    if (lastDrivenRef.current === key) return;
    lastDrivenRef.current = key;

    const seg = segments[currentIndex];
    if (!seg) return;

    if (phase.kind === "dj") {
      if (seg.dj_intro_url) {
        playUrl(seg.dj_intro_url, "dj", () => {
          // After DJ talk → if track, play music; else advance
          if (seg.type === "track") {
            setPhase({ kind: "music", index: phase.index, elapsedMs: 0, durationMs: 0 });
          } else {
            advance(phase.index);
          }
        });
      } else {
        // no DJ audio for this segment — short pause then advance
        transitionTimerRef.current = setTimeout(() => {
          if (seg.type === "track") {
            setPhase({ kind: "music", index: phase.index, elapsedMs: 0, durationMs: 0 });
          } else {
            advance(phase.index);
          }
        }, 600);
      }
    } else if (phase.kind === "music") {
      const trackSeg = seg as TrackSegment;
      if (trackSeg.music_url) {
        playUrl(trackSeg.music_url, "music", () => advance(phase.index));
      } else {
        // music gen failed for this track — skip cleanly
        advance(phase.index);
      }
    }
  }, [status, phase, segments, currentIndex, playUrl, advance]);

  useEffect(() => () => cancelAudio(), [cancelAudio]);

  // ---- controls ------------------------------------------------------------

  const start = () => {
    setStatus("playing");
    setPhase({ kind: "dj", index: 0, elapsedMs: 0, durationMs: 0 });
    lastDrivenRef.current = "";
  };
  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
    stopTicker();
    setStatus("paused");
  };
  const resume = () => {
    if (audioRef.current) audioRef.current.play().catch(() => {});
    if (phase.kind === "dj" || phase.kind === "music") startTicker(phase.kind);
    setStatus("playing");
    lastDrivenRef.current = ""; // re-evaluate just in case
  };
  const skip = () => {
    // Skip the rest of whatever's playing and advance to the next segment.
    cancelAudio();
    lastDrivenRef.current = "";
    advance(currentIndex);
  };
  const restart = () => {
    cancelAudio();
    lastDrivenRef.current = "";
    setStatus("playing");
    setPhase({ kind: "dj", index: 0, elapsedMs: 0, durationMs: 0 });
  };

  // ---- view ----------------------------------------------------------------

  if (status === "ready") {
    return <StartScreen manifest={manifest} onStart={start} />;
  }
  if (status === "done") {
    return <EndScreen manifest={manifest} onRestart={restart} />;
  }

  const djSpeaking = phase.kind === "dj" || phase.kind === "transition";
  const showMusic = phase.kind === "music";
  const trackCount = segments.filter((s) => s.type === "track").length;
  const visibleTrackOrder =
    visibleTrack && segments
      .filter((s) => s.type === "track")
      .findIndex((s) => s.order === visibleTrack.order) + 1;

  const progressPct =
    "elapsedMs" in phase && "durationMs" in phase && phase.durationMs > 0
      ? Math.min(100, (phase.elapsedMs / phase.durationMs) * 100)
      : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* HEADER — leave/title/week pinned to top, but title hides during music */}
      <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-8 z-20 pointer-events-none">
        <a
          href="/"
          className="text-[11px] tracking-[0.25em] uppercase text-text/55 hover:text-text pointer-events-auto border border-text/15 hover:border-text/40 rounded-full px-3 py-1.5 transition-colors"
        >
          ← lobby
        </a>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-text/40">
            with {manifest.dj.name}
          </p>
        </div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-text/35">
          week of {manifest.week_of}
        </p>
      </div>

      {/* STAGE — full-bleed scene, picked by space slug */}
      {(() => {
        const Scene = SCENES[manifest.slug] ?? BedroomPopScene;
        return (
          <Scene
            djSpeaking={djSpeaking}
            showMusic={showMusic}
            musicProgress={musicProgress}
            palette={manifest.palette}
          />
        );
      })()}

      {/* FOOTER — single bottom stack: track info → progress → controls → ticker → attribution */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-6 pt-12 bg-gradient-to-t from-bg via-bg/85 to-transparent">
        <div className="flex flex-col items-center text-center px-6 gap-3">

          {/* Track / status line */}
          <div className="h-14 flex flex-col items-center justify-center">
            {showMusic && visibleTrack ? (
              <div className="soft-rise">
                <p className="text-2xl font-serif text-text tracking-tight leading-none">
                  {visibleTrack.track_name}
                </p>
                <p className="text-xs text-text/55 mt-1.5">
                  {visibleTrack.artist}
                  {visibleTrack.year ? ` · ${visibleTrack.year}` : ""}
                </p>
              </div>
            ) : currentSegment ? (
              <p className="text-text/45 text-sm italic">
                {currentSegment.type === "intro"
                  ? "opening the room"
                  : currentSegment.type === "outro"
                  ? "closing the room"
                  : `introducing · ${(currentSegment as TrackSegment).track_name}`}
              </p>
            ) : null}
          </div>

          {/* Progress bar */}
          <div className="w-56 h-px bg-text/10 overflow-hidden">
            <div
              className="h-full bg-text/45"
              style={{ width: `${progressPct}%`, transition: "width 0.15s linear" }}
            />
          </div>

          {/* Controls */}
          <Controls
            status={status}
            onPause={pause}
            onResume={resume}
            onSkip={skip}
            onRestart={restart}
          />

          {/* Channel ticker */}
          <div className="mt-1">
            <p className="text-[10px] tracking-[0.25em] uppercase text-text/40">
              {visibleTrack
                ? `now playing · track ${visibleTrackOrder} of ${trackCount} · channel mode`
                : "channel mode"}
            </p>
            {(nextTrackSeg || afterNextTrackSeg) && (
              <p className="text-[10px] tracking-[0.18em] uppercase text-text/25 mt-1.5">
                {nextTrackSeg && <>next: {(nextTrackSeg as TrackSegment).track_name}</>}
                {afterNextTrackSeg && (
                  <> &nbsp;·&nbsp; then: {(afterNextTrackSeg as TrackSegment).track_name}</>
                )}
              </p>
            )}
          </div>

          {/* Attribution — small */}
          <p className="text-[9px] tracking-[0.25em] uppercase text-text/20 mt-1">
            aniradio · narration · ElevenLabs &nbsp;·&nbsp; music · Lyria 3 Pro
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------- //

function findNextTrack(segments: Segment[], from: number): Segment | null {
  for (let i = from; i < segments.length; i++) {
    if (segments[i].type === "track") return segments[i];
  }
  return null;
}

function Controls({
  status,
  onPause,
  onResume,
  onSkip,
  onRestart,
}: {
  status: Status;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="flex justify-center gap-2">
      <ControlBtn
        label={status === "paused" ? "resume" : "pause"}
        onClick={status === "paused" ? onResume : onPause}
      >
        {status === "paused" ? <PlayIcon /> : <PauseIcon />}
      </ControlBtn>
      <ControlBtn label="skip" onClick={onSkip}>
        <SkipIcon />
      </ControlBtn>
      <ControlBtn label="restart" onClick={onRestart}>
        <RestartIcon />
      </ControlBtn>
    </div>
  );
}

function ControlBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-9 h-9 rounded-full border border-text/15 hover:border-text/35 text-text/55 hover:text-text/90 flex items-center justify-center transition-colors"
    >
      {children}
    </button>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2.5" y="2" width="2.5" height="8" rx="0.5" />
      <rect x="7" y="2" width="2.5" height="8" rx="0.5" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M3 2.2v7.6L9.2 6 3 2.2z" />
    </svg>
  );
}
function SkipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2 2v8l5-4-5-4zm6 0v8h2V2H8z" />
    </svg>
  );
}
function RestartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7a4.5 4.5 0 1 0 1.3-3.2" />
      <path d="M2.5 2v3h3" />
    </svg>
  );
}

// -------------------------------------------------------------------------- //

function StartScreen({ manifest, onStart }: { manifest: SpaceManifest; onStart: () => void }) {
  const trackCount = manifest.segments.filter((s) => s.type === "track").length;
  // Useful for sharable URLs and screenshot tools: ?play=1 skips the start screen.
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("play") === "1"
    ) {
      onStart();
    }
  }, [onStart]);
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center px-8 text-center overflow-hidden">
      <a
        href="/"
        className="absolute top-6 left-6 text-[11px] tracking-[0.25em] uppercase text-text/35 hover:text-text/70 transition-colors"
      >
        ← back to lobby
      </a>
      <p className="text-[11px] tracking-[0.3em] uppercase text-text/35 mb-5">
        aniradio · {manifest.dj.name}'s room
      </p>
      <h1 className="font-serif text-4xl md:text-5xl text-text tracking-tight max-w-xl">
        {manifest.title}
      </h1>
      <p className="text-text/45 mt-4 text-sm italic">{manifest.theme}</p>
      <div className="mt-10">
        <MiraOrb state="idle" size={180} palette={manifest.palette} />
      </div>
      <button
        onClick={onStart}
        className="mt-8 px-7 py-3 rounded-full border border-text/15 hover:border-text/40 text-text/80 hover:text-text text-sm tracking-wide transition-colors"
      >
        step into the room
      </button>
      <p className="text-text/30 text-xs mt-6 max-w-sm leading-relaxed">
        {trackCount} tracks · about {Math.round(trackCount * 2.3)} minutes · channel mode
      </p>
      <p className="absolute bottom-5 left-0 right-0 text-[10px] tracking-[0.2em] uppercase text-text/25 pointer-events-none">
        aniradio · narration · ElevenLabs &nbsp;·&nbsp; music · Lyria 3 Pro
      </p>
    </div>
  );
}

function EndScreen({ manifest, onRestart }: { manifest: SpaceManifest; onRestart: () => void }) {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center text-center px-8">
      <MiraOrb state="idle" size={140} palette={manifest.palette} />
      <p className="font-serif text-2xl text-text mt-8">until next monday.</p>
      <p className="text-text/45 text-sm mt-2">— {manifest.dj.name}</p>
      <div className="mt-10 flex gap-3">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 rounded-full border border-text/15 hover:border-text/40 text-text/80 hover:text-text text-sm transition-colors"
        >
          listen again
        </button>
        <a
          href="/"
          className="px-6 py-2.5 rounded-full border border-text/10 hover:border-text/25 text-text/50 hover:text-text/80 text-sm transition-colors"
        >
          leave room
        </a>
      </div>
    </div>
  );
}
