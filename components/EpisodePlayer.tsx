"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EpisodePlan, Segment, TrackSegment } from "@/lib/types";
import { VinylRecord } from "./VinylRecord";
import { MiraOrb } from "./MiraOrb";

const MUSIC_SECONDS = 30;

type Status =
  | "preparing" // first Mira asset still loading
  | "playing"
  | "paused"
  | "buffering" // current asset not ready yet, waiting
  | "done";

type Phase =
  | { kind: "mira"; index: number }
  | { kind: "music"; index: number; elapsedMs: number }
  | { kind: "transition"; index: number };

interface AssetBundle {
  miraUrl?: string;
  miraError?: boolean;
  musicUrl?: string;
  musicError?: boolean;
}

interface Props {
  episode: EpisodePlan;
  /** Set true to skip live generation and use Web Speech / visual-only fallbacks. */
  liveGeneration: boolean;
  onExit: () => void;
}

export function EpisodePlayer({ episode, liveGeneration, onExit }: Props) {
  const [status, setStatus] = useState<Status>("preparing");
  const [phase, setPhase] = useState<Phase>({ kind: "mira", index: 0 });

  const segments = episode.tracks;
  const englishVoice = useEnglishVoice();

  // Mutable refs — none of these belong in React state.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const assetsRef = useRef<Map<number, AssetBundle>>(new Map());
  // forces a re-render when an asset slot updates
  const [, bumpAssets] = useState(0);
  const dirtyAssets = useCallback(() => bumpAssets((n) => n + 1), []);

  const abortsRef = useRef<Map<string, AbortController>>(new Map());

  // ---- generation ---------------------------------------------------------

  const startMiraFetch = useCallback(
    (index: number) => {
      if (!liveGeneration) return;
      const seg = segments[index];
      if (!seg) return;
      const bundle = assetsRef.current.get(index) ?? {};
      if (bundle.miraUrl || bundle.miraError || abortsRef.current.has(`mira:${index}`)) return;

      const ac = new AbortController();
      abortsRef.current.set(`mira:${index}`, ac);

      fetch("/api/mira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: seg.mira_text }),
        signal: ac.signal,
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(`mira ${r.status}`);
          return r.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const cur = assetsRef.current.get(index) ?? {};
          assetsRef.current.set(index, { ...cur, miraUrl: url });
          dirtyAssets();
        })
        .catch((e) => {
          if ((e as Error).name === "AbortError") return;
          const cur = assetsRef.current.get(index) ?? {};
          assetsRef.current.set(index, { ...cur, miraError: true });
          dirtyAssets();
        })
        .finally(() => abortsRef.current.delete(`mira:${index}`));
    },
    [liveGeneration, segments, dirtyAssets]
  );

  const startMusicFetch = useCallback(
    (index: number) => {
      const seg = segments[index];
      if (!seg || seg.type !== "track") return;
      if (!liveGeneration) return;
      const bundle = assetsRef.current.get(index) ?? {};
      if (bundle.musicUrl || bundle.musicError || abortsRef.current.has(`music:${index}`)) return;

      const ac = new AbortController();
      abortsRef.current.set(`music:${index}`, ac);

      fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: (seg as TrackSegment).music_prompt }),
        signal: ac.signal,
      })
        .then(async (r) => {
          if (!r.ok) throw new Error(`music ${r.status}`);
          return r.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const cur = assetsRef.current.get(index) ?? {};
          assetsRef.current.set(index, { ...cur, musicUrl: url });
          dirtyAssets();
        })
        .catch((e) => {
          if ((e as Error).name === "AbortError") return;
          const cur = assetsRef.current.get(index) ?? {};
          assetsRef.current.set(index, { ...cur, musicError: true });
          dirtyAssets();
        })
        .finally(() => abortsRef.current.delete(`music:${index}`));
    },
    [liveGeneration, segments, dirtyAssets]
  );

  /** Aggressive prefetch: current + next two segments' Mira, next two tracks' music. */
  const prefetchAround = useCallback(
    (index: number) => {
      for (let i = index; i < Math.min(segments.length, index + 3); i++) {
        startMiraFetch(i);
        startMusicFetch(i);
      }
    },
    [segments.length, startMiraFetch, startMusicFetch]
  );

  // Kick off prefetch whenever phase advances (only the index matters).
  const currentIndex =
    phase.kind === "mira" || phase.kind === "music" || phase.kind === "transition"
      ? phase.index
      : 0;
  useEffect(() => {
    prefetchAround(currentIndex);
  }, [currentIndex, prefetchAround]);

  // Once the first segment's Mira asset is ready (or known-failed), we can start.
  const firstReady = useMemo(() => {
    if (!liveGeneration) return true;
    const b = assetsRef.current.get(0);
    return !!(b?.miraUrl || b?.miraError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveGeneration, assetsRef.current.get(0)?.miraUrl, assetsRef.current.get(0)?.miraError]);

  useEffect(() => {
    if (status === "preparing" && firstReady) {
      setStatus("playing");
    }
  }, [status, firstReady]);

  // ---- playback -----------------------------------------------------------

  const cancelAllAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
  }, []);

  const goToNextSegment = useCallback(
    (fromIndex: number) => {
      const next = fromIndex + 1;
      if (next >= segments.length) {
        setStatus("done");
        return;
      }
      setPhase({ kind: "transition", index: fromIndex });
      transitionTimerRef.current = setTimeout(() => {
        setPhase({ kind: "mira", index: next });
      }, 1300);
    },
    [segments.length]
  );

  const speakMira = useCallback(
    (index: number, seg: Segment, onEnd: () => void) => {
      cancelAllAudio();
      const bundle = assetsRef.current.get(index);

      if (bundle?.miraUrl) {
        const a = new Audio(bundle.miraUrl);
        a.onended = () => onEnd();
        a.onerror = () => onEnd();
        a.play().catch(() => onEnd());
        audioRef.current = a;
        return;
      }
      // Fallback: Web Speech (used when liveGeneration is off, or /api/mira failed)
      if (typeof window === "undefined" || !window.speechSynthesis) {
        previewTimerRef.current = setTimeout(onEnd, 4000);
        return;
      }
      const u = new SpeechSynthesisUtterance(seg.mira_text);
      u.lang = "en-US";
      u.rate = 0.92;
      if (englishVoice) u.voice = englishVoice;
      u.onend = onEnd;
      u.onerror = onEnd;
      window.speechSynthesis.speak(u);
    },
    [cancelAllAudio, englishVoice]
  );

  const playMusic = useCallback(
    (index: number, _seg: TrackSegment, onEnd: () => void) => {
      cancelAllAudio();
      const start = Date.now();

      tickerRef.current = setInterval(() => {
        const elapsedMs = Date.now() - start;
        setPhase((p) =>
          p.kind === "music" && p.index === index
            ? { ...p, elapsedMs: Math.min(elapsedMs, MUSIC_SECONDS * 1000) }
            : p
        );
      }, 150);

      const bundle = assetsRef.current.get(index);
      if (bundle?.musicUrl) {
        const a = new Audio(bundle.musicUrl);
        a.onended = () => {
          cancelAllAudio();
          onEnd();
        };
        a.onerror = () => {
          /* fall through to timer */
        };
        a.play().catch(() => {
          /* fall through to timer */
        });
        audioRef.current = a;
      }
      previewTimerRef.current = setTimeout(() => {
        cancelAllAudio();
        onEnd();
      }, MUSIC_SECONDS * 1000);
    },
    [cancelAllAudio]
  );

  // ---- the playback driver -----------------------------------------------

  const lastDrivenKeyRef = useRef<string>("");

  useEffect(() => {
    if (status !== "playing") return;

    // build a stable key for the (status, phase.kind, index) tuple
    const key = `${status}:${phase.kind}:${
      phase.kind === "music"
        ? `${phase.index}:m`
        : phase.kind === "mira"
        ? `${phase.index}:t`
        : `${phase.index}:x`
    }`;
    if (lastDrivenKeyRef.current === key) return;
    lastDrivenKeyRef.current = key;

    if (phase.kind === "transition") return;

    const seg = segments[phase.index];
    if (!seg) return;

    if (phase.kind === "mira") {
      // If live & not ready, wait (buffering state)
      const bundle = assetsRef.current.get(phase.index);
      const miraReady = !!bundle?.miraUrl || !!bundle?.miraError || !liveGeneration;
      if (!miraReady) {
        setStatus("buffering");
        lastDrivenKeyRef.current = ""; // re-enter when status becomes playing again
        return;
      }
      speakMira(phase.index, seg, () => {
        if (seg.type === "track") {
          setPhase({ kind: "music", index: phase.index, elapsedMs: 0 });
        } else {
          goToNextSegment(phase.index);
        }
      });
    } else if (phase.kind === "music") {
      const bundle = assetsRef.current.get(phase.index);
      // Music can play even if unsupported (visual-only) — only wait if we expect it & still loading.
      const musicReady = !!bundle?.musicUrl || !!bundle?.musicError || !liveGeneration;
      if (!musicReady) {
        setStatus("buffering");
        lastDrivenKeyRef.current = "";
        return;
      }
      if (seg.type === "track") {
        playMusic(phase.index, seg as TrackSegment, () => goToNextSegment(phase.index));
      } else {
        goToNextSegment(phase.index);
      }
    }
  }, [status, phase, segments, speakMira, playMusic, goToNextSegment, liveGeneration]);

  // While buffering, watch for the missing asset to land, then flip back to playing.
  useEffect(() => {
    if (status !== "buffering") return;
    const seg = segments[currentIndex];
    if (!seg) return;
    const b = assetsRef.current.get(currentIndex);
    if (phase.kind === "mira" && (b?.miraUrl || b?.miraError)) setStatus("playing");
    if (phase.kind === "music" && (b?.musicUrl || b?.musicError)) setStatus("playing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    status,
    phase,
    currentIndex,
    assetsRef.current.get(currentIndex)?.miraUrl,
    assetsRef.current.get(currentIndex)?.musicUrl,
    assetsRef.current.get(currentIndex)?.miraError,
    assetsRef.current.get(currentIndex)?.musicError,
  ]);

  // ---- controls -----------------------------------------------------------

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
      tickerRef.current = null;
    }
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    setStatus("paused");
  };

  const resume = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    if (typeof window !== "undefined" && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
    }
    if (phase.kind === "music") {
      // restart the timer relative to elapsed
      const remaining = Math.max(0, MUSIC_SECONDS * 1000 - phase.elapsedMs);
      const resumeStart = Date.now();
      const baseElapsed = phase.elapsedMs;
      tickerRef.current = setInterval(() => {
        const ms = baseElapsed + (Date.now() - resumeStart);
        setPhase((p) =>
          p.kind === "music"
            ? { ...p, elapsedMs: Math.min(ms, MUSIC_SECONDS * 1000) }
            : p
        );
      }, 150);
      previewTimerRef.current = setTimeout(() => {
        cancelAllAudio();
        goToNextSegment(phase.index);
      }, remaining);
    }
    setStatus("playing");
    lastDrivenKeyRef.current = ""; // let the driver re-evaluate if it needs to
  };

  const restart = () => {
    cancelAllAudio();
    lastDrivenKeyRef.current = "";
    setPhase({ kind: "mira", index: 0 });
    setStatus("playing");
  };

  const stop = () => {
    cancelAllAudio();
    for (const ac of abortsRef.current.values()) ac.abort();
    abortsRef.current.clear();
    for (const b of assetsRef.current.values()) {
      if (b.miraUrl) URL.revokeObjectURL(b.miraUrl);
      if (b.musicUrl) URL.revokeObjectURL(b.musicUrl);
    }
    assetsRef.current.clear();
    onExit();
  };

  // unmount cleanup
  useEffect(() => {
    return () => {
      cancelAllAudio();
      for (const ac of abortsRef.current.values()) ac.abort();
      // Important: clear synchronously. The .finally handlers on aborted fetches
      // run as microtasks, but Strict Mode's re-mount happens in the same tick,
      // so without an explicit clear the guard in startMiraFetch/startMusicFetch
      // would think fetches are still in flight and skip the re-mount's prefetch.
      abortsRef.current.clear();
      for (const b of assetsRef.current.values()) {
        if (b.miraUrl) URL.revokeObjectURL(b.miraUrl);
        if (b.musicUrl) URL.revokeObjectURL(b.musicUrl);
      }
      assetsRef.current.clear();
    };
  }, [cancelAllAudio]);

  // ---- view derivations ----------------------------------------------------

  const currentSegment = segments[currentIndex];
  const visibleTrack: TrackSegment | null =
    currentSegment && currentSegment.type === "track" ? (currentSegment as TrackSegment) : null;
  const miraSpeaking = phase.kind === "mira" || phase.kind === "transition";
  const showMusic = phase.kind === "music";
  const previewProgress =
    phase.kind === "music" ? phase.elapsedMs / 1000 / MUSIC_SECONDS : 0;

  // ---- render --------------------------------------------------------------

  if (status === "preparing") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <MiraOrb state="speaking" size={140} />
        <p className="mt-8 text-text/50 text-sm tracking-wide">Mira is getting ready…</p>
        <p className="mt-2 text-text/30 text-[11px] tracking-wide">{episode.title}</p>
        <button
          onClick={onExit}
          className="absolute top-4 right-4 text-text/30 hover:text-text/70 text-xs tracking-wide"
        >
          cancel
        </button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="relative w-full h-screen flex flex-col items-center justify-center text-center px-8">
        <MiraOrb state="idle" size={140} />
        <p className="font-serif text-2xl text-text mt-8">until next time.</p>
        <p className="text-text/45 text-sm mt-2">— Mira</p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={restart}
            className="px-6 py-2.5 rounded-full border border-text/15 hover:border-text/40 text-text/80 hover:text-text text-sm transition-colors"
          >
            listen again
          </button>
          <button
            onClick={onExit}
            className="px-6 py-2.5 rounded-full border border-text/10 hover:border-text/25 text-text/50 hover:text-text/80 text-sm transition-colors"
          >
            new episode
          </button>
        </div>
        <p className="absolute bottom-5 left-0 right-0 text-[10px] tracking-[0.2em] uppercase text-text/25 pointer-events-none">
          narration · Chirp 3 HD &nbsp;·&nbsp; music · Lyria 3
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
        <p className="text-[11px] tracking-[0.25em] uppercase text-text/40 truncate max-w-[80%]">
          {episode.title}
        </p>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: 560, height: 460 }}>
        <div
          className="absolute inset-0 flex items-center justify-center fade-soft"
          style={{
            opacity: showMusic ? 1 : phase.kind === "transition" ? 0.35 : 0.5,
            transform: showMusic ? "translateX(-30px) scale(1)" : "scale(0.92)",
            filter: showMusic ? "none" : "blur(1px)",
          }}
        >
          <VinylRecord
            albumArtUrl={null}
            labelPalette={visibleTrack?.label_palette}
            spinState={
              showMusic ? "playing" : phase.kind === "transition" ? "still" : "slow"
            }
            progress={previewProgress}
            size={420}
          />
        </div>

        <div
          className="absolute fade-soft flex items-center justify-center"
          style={{
            top: showMusic ? "auto" : "50%",
            bottom: showMusic ? "20px" : "auto",
            left: showMusic ? "auto" : "50%",
            right: showMusic ? "20px" : "auto",
            transform: showMusic ? "translate(0, 0)" : "translate(-50%, -50%)",
            width: showMusic ? 90 : 320,
            height: showMusic ? 90 : 320,
            zIndex: 10,
          }}
        >
          <MiraOrb
            state={miraSpeaking || status === "buffering" ? "speaking" : "idle"}
            size={showMusic ? 90 : 320}
          />
        </div>
      </div>

      <div className="h-24 mt-6 flex flex-col items-center justify-center text-center px-6">
        {showMusic && visibleTrack && (
          <div className="soft-rise">
            <p className="text-2xl font-serif text-text tracking-tight">
              {visibleTrack.track_name}
            </p>
            <p className="text-sm text-text/55 mt-1">
              {visibleTrack.artist}
              {visibleTrack.year ? ` · ${visibleTrack.year}` : ""}
            </p>
          </div>
        )}
      </div>

      <ProgressDots total={segments.length} current={currentIndex} />

      <div className="h-2 mt-3 w-48 relative">
        {showMusic && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-text/10">
            <div
              className="h-px bg-text/40 fade-fast"
              style={{ width: `${previewProgress * 100}%` }}
            />
          </div>
        )}
        {status === "buffering" && (
          <p className="text-[10px] text-text/40 tracking-wider text-center mt-1 animate-pulse">
            generating…
          </p>
        )}
      </div>

      {/* controls */}
      <Controls
        status={status}
        onPause={pause}
        onResume={resume}
        onRestart={restart}
        onStop={stop}
      />

      <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
        <p className="text-[10px] tracking-[0.2em] uppercase text-text/30">
          narration · Chirp 3 HD &nbsp;·&nbsp; music · Lyria 3
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------- //

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`dot ${i === current ? "active" : i < current ? "played" : ""}`}
        />
      ))}
    </div>
  );
}

function Controls({
  status,
  onPause,
  onResume,
  onRestart,
  onStop,
}: {
  status: Status;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-2">
      <ControlBtn
        label={status === "paused" ? "resume" : "pause"}
        onClick={status === "paused" ? onResume : onPause}
        active={status === "paused"}
      >
        {status === "paused" ? <PlayIcon /> : <PauseIcon />}
      </ControlBtn>
      <ControlBtn label="restart" onClick={onRestart}>
        <RestartIcon />
      </ControlBtn>
      <ControlBtn label="end" onClick={onStop}>
        <StopIcon />
      </ControlBtn>
    </div>
  );
}

function ControlBtn({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
        active
          ? "border-text/40 text-text"
          : "border-text/15 hover:border-text/35 text-text/55 hover:text-text/90"
      }`}
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
function RestartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7a4.5 4.5 0 1 0 1.3-3.2" />
      <path d="M2.5 2v3h3" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2.5" y="2.5" width="7" height="7" rx="1" />
    </svg>
  );
}

// -------------------------------------------------------------------------- //

function useEnglishVoice(): SpeechSynthesisVoice | null {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const preferred = [
        /samantha/i, /ava/i, /aria/i, /jenny/i,
        /google us english/i, /english \(united states\)/i, /en-us/i, /^en/i,
      ];
      for (const re of preferred) {
        const match = voices.find((v) => re.test(v.name) || re.test(v.lang));
        if (match) { setVoice(match); return; }
      }
      const anyEn = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
      if (anyEn) setVoice(anyEn);
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  return voice;
}
