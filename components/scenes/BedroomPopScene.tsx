"use client";

import type { SceneProps } from "./types";
import { VinylRecord } from "../VinylRecord";
import { MiraOrb } from "../MiraOrb";

export function BedroomPopScene({ djSpeaking, showMusic, musicProgress, palette }: SceneProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative" style={{ width: 560, height: 460 }}>
        <div
          className="absolute inset-0 flex items-center justify-center fade-soft"
          style={{
            opacity: showMusic ? 1 : 0.45,
            transform: showMusic ? "translateX(-30px) scale(1)" : "scale(0.92)",
            filter: showMusic ? "none" : "blur(1px)",
          }}
        >
          <VinylRecord
            albumArtUrl={null}
            labelPalette={palette}
            spinState={showMusic ? "playing" : "slow"}
            progress={musicProgress}
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
          <MiraOrb state={djSpeaking ? "speaking" : "idle"} size={showMusic ? 90 : 320} />
        </div>
      </div>
    </div>
  );
}
