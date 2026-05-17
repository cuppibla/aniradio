"use client";

import { useState } from "react";
import { MiraOrb } from "./MiraOrb";

interface Props {
  onSubmit: (prompt: string) => void;
  onPlaySample: () => void;
}

const SUGGESTIONS = [
  "songs for staying up too late",
  "driving alone at 2am",
  "rainy sunday morning, slow coffee",
  "ghibli forest, very small movements",
  "the last party of the summer",
  "lo-fi tape loops, very lonely",
];

export function PromptScreen({ onSubmit, onPlaySample }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center px-8 text-center">
      <p className="text-[11px] tracking-[0.3em] uppercase text-text/35 mb-5">
        Late Night Vinyl
      </p>
      <h1 className="font-serif text-3xl md:text-4xl text-text tracking-tight leading-tight max-w-xl mb-3">
        tell Mira the vibe.
      </h1>
      <p className="text-text/45 text-sm italic max-w-md mb-8">
        she'll write the show. the music is generated in real time.
      </p>

      <div className="my-2">
        <MiraOrb state="idle" size={140} />
      </div>

      <div className="w-full max-w-md mt-6">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder="e.g. songs that feel like driving home at night"
          rows={2}
          className="w-full resize-none bg-transparent border border-text/15 hover:border-text/30 focus:border-text/50 focus:outline-none rounded-2xl px-5 py-3 text-text/90 placeholder:text-text/25 text-sm leading-relaxed transition-colors"
        />
        <div className="flex flex-wrap gap-1.5 justify-center mt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setValue(s)}
              className="text-[11px] text-text/35 hover:text-text/70 border border-text/10 hover:border-text/25 rounded-full px-2.5 py-1 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!value.trim()}
        className="mt-8 px-7 py-3 rounded-full border border-text/20 hover:border-text/50 text-text/80 hover:text-text disabled:opacity-30 disabled:cursor-not-allowed text-sm tracking-wide transition-colors"
      >
        begin
      </button>

      <button
        onClick={onPlaySample}
        className="mt-4 text-[11px] text-text/30 hover:text-text/60 tracking-wide transition-colors"
      >
        or play the sample episode
      </button>

      <p className="absolute bottom-5 left-0 right-0 text-[10px] tracking-[0.2em] uppercase text-text/25 pointer-events-none">
        narration · Chirp 3 HD &nbsp;·&nbsp; music · Lyria 3
      </p>
    </div>
  );
}
