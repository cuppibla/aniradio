"use client";

import { useState } from "react";
import type { EpisodePlan } from "@/lib/types";
import { sampleEpisode } from "@/lib/manifest";
import { EpisodePlayer } from "./EpisodePlayer";
import { PromptScreen } from "./PromptScreen";
import { MiraOrb } from "./MiraOrb";

type State =
  | { kind: "prompt" }
  | { kind: "planning"; userPrompt: string }
  | { kind: "playing"; plan: EpisodePlan; live: boolean }
  | { kind: "error"; message: string; userPrompt: string };

export function SessionRoot() {
  const [state, setState] = useState<State>({ kind: "prompt" });

  const startFromPrompt = async (userPrompt: string) => {
    setState({ kind: "planning", userPrompt });
    try {
      const res = await fetch("/api/episode/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_prompt: userPrompt }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `plan request failed (${res.status})`);
      }
      const plan = (await res.json()) as EpisodePlan;
      setState({ kind: "playing", plan, live: true });
    } catch (e) {
      setState({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
        userPrompt,
      });
    }
  };

  const playSample = () => {
    setState({ kind: "playing", plan: sampleEpisode, live: false });
  };

  const exitToPrompt = () => setState({ kind: "prompt" });

  if (state.kind === "prompt") {
    return <PromptScreen onSubmit={startFromPrompt} onPlaySample={playSample} />;
  }

  if (state.kind === "planning") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-center px-8">
        <MiraOrb state="speaking" size={140} />
        <p className="mt-8 text-text/55 text-sm tracking-wide">
          writing your episode…
        </p>
        <p className="mt-2 text-text/30 text-[11px] italic max-w-md">
          "{state.userPrompt}"
        </p>
        <button
          onClick={exitToPrompt}
          className="mt-10 text-[11px] text-text/30 hover:text-text/70 tracking-wide"
        >
          cancel
        </button>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-center px-8">
        <MiraOrb state="idle" size={120} />
        <p className="mt-8 font-serif text-xl text-text">something stalled.</p>
        <p className="mt-3 text-text/50 text-sm max-w-md leading-relaxed">
          Mira couldn't write the episode: {state.message}
        </p>
        <p className="mt-2 text-text/35 text-xs max-w-md">
          this usually means GCP isn't authenticated, or the Lyria / Gemini APIs aren't
          enabled on the project. see README.md.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => startFromPrompt(state.userPrompt)}
            className="px-6 py-2.5 rounded-full border border-text/20 hover:border-text/45 text-text/80 hover:text-text text-sm transition-colors"
          >
            try again
          </button>
          <button
            onClick={playSample}
            className="px-6 py-2.5 rounded-full border border-text/10 hover:border-text/25 text-text/50 hover:text-text/80 text-sm transition-colors"
          >
            play sample instead
          </button>
          <button
            onClick={exitToPrompt}
            className="px-6 py-2.5 rounded-full border border-text/10 hover:border-text/25 text-text/50 hover:text-text/80 text-sm transition-colors"
          >
            new prompt
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <EpisodePlayer
        episode={state.plan}
        liveGeneration={state.live}
        onExit={exitToPrompt}
      />
      {!state.live && (
        <div className="fixed top-3 right-3 z-50 pointer-events-none">
          <p className="text-[9px] tracking-[0.25em] uppercase text-text/30 border border-text/15 rounded-full px-3 py-1">
            sample · no generation
          </p>
        </div>
      )}
    </>
  );
}
