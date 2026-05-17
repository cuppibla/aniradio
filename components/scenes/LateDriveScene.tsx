"use client";

import type { SceneProps } from "./types";

export function LateDriveScene({ djSpeaking, showMusic }: SceneProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 75%, rgba(255,77,158,0.22) 0%, transparent 45%)," +
          "linear-gradient(180deg, #0a0218 0%, #1a0a3a 25%, #3a0a5a 50%, #5a0f4a 70%, #1a0428 100%)",
      }}
    >
      {/* stars */}
      {[
        { top: "8%", left: "12%", delay: "0s" },
        { top: "18%", left: "23%", delay: "1s" },
        { top: "6%", left: "38%", delay: "2s" },
        { top: "14%", left: "55%", delay: "0.5s" },
        { top: "22%", left: "72%", delay: "1.5s" },
        { top: "5%", left: "88%", delay: "2.5s" },
        { top: "28%", left: "8%", delay: "3s" },
        { top: "11%", left: "68%", delay: "1.2s" },
        { top: "25%", left: "92%", delay: "0.8s" },
        { top: "19%", left: "45%", delay: "2.1s" },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            width: 2,
            height: 2,
            borderRadius: "999px",
            background: "white",
            opacity: 0.5,
            animation: `lateDriveTwinkle 4s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* neon sun */}
      <div
        className="absolute"
        style={{
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 220,
          borderRadius: "999px",
          background:
            "repeating-linear-gradient(180deg, transparent 0 14px, rgba(12,4,24,0.55) 14px 16px)," +
            "radial-gradient(circle at 50% 45%, #fff5a8 0%, #ff80c8 25%, #ff3da8 50%, #c93ee0 75%, transparent 95%)",
          filter: "blur(0.3px)",
          boxShadow: "0 0 60px 20px rgba(255,61,168,0.35), 0 0 120px 40px rgba(201,62,224,0.18)",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            inset: -8,
            border: "1px solid rgba(92,224,255,0.4)",
            boxShadow: "0 0 8px rgba(92,224,255,0.5)",
          }}
        />
      </div>

      {/* mountain silhouettes */}
      <div
        className="absolute left-0 right-0"
        style={{ bottom: "38%", height: 90 }}
      >
        <svg viewBox="0 0 1400 90" preserveAspectRatio="none" className="w-full h-full block">
          <path
            d="M0,90 L0,55 L120,15 L240,55 L360,25 L480,55 L600,10 L720,55 L840,30 L960,55 L1080,5 L1200,55 L1320,30 L1400,55 L1400,90 Z"
            fill="#0a0218"
            stroke="#ff3da8"
            strokeWidth="0.6"
            strokeOpacity="0.5"
          />
        </svg>
      </div>

      {/* Theo ambient haze on the right */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "8%",
          top: "38%",
          width: 240,
          height: 240,
          zIndex: 5,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(201,62,224,0.4) 0%, rgba(255,61,168,0.15) 40%, transparent 75%)",
            filter: "blur(20px)",
            animation: djSpeaking ? "theo-pulse 2.4s ease-in-out infinite" : "theo-idle 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* car radio deck */}
      <div
        className="absolute fade-soft"
        style={{
          bottom: "32%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          maxWidth: "75vw",
          height: 100,
          background: "linear-gradient(180deg, #2a0a3a 0%, #14041e 100%)",
          borderRadius: 8,
          border: "1px solid rgba(255,61,168,0.4)",
          boxShadow:
            "0 0 30px rgba(255,61,168,0.2), 0 0 60px rgba(201,62,224,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          zIndex: 6,
          display: "grid",
          gridTemplateColumns: "60px 1fr 60px",
          gap: 12,
          alignItems: "center",
          padding: "12px 16px",
        }}
      >
        <Knob />
        <Lcd showMusic={showMusic} />
        <Knob />
        <div
          className="absolute flex items-center gap-1.5"
          style={{
            top: -22,
            right: 8,
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "#ff3da8",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <span
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              background: "#ff3da8",
              boxShadow: "0 0 6px #ff3da8, 0 0 12px #ff3da8",
              animation: djSpeaking ? "led-pulse 1.0s ease-in-out infinite" : "led-pulse 1.8s ease-in-out infinite",
            }}
          />
          Theo · on air
        </div>
      </div>

      {/* perspective grid floor */}
      <div
        className="absolute left-0 right-0 bottom-0 overflow-hidden"
        style={{
          height: "38%",
          perspective: "360px",
          perspectiveOrigin: "50% 0%",
        }}
      >
        <div
          className="absolute"
          style={{
            bottom: 0,
            left: "-10%",
            right: "-10%",
            height: "220%",
            transform: "rotateX(72deg)",
            transformOrigin: "bottom",
            backgroundImage:
              "linear-gradient(to right, transparent 0%, rgba(255,61,168,0.45) 49.5%, rgba(255,61,168,0.45) 50.5%, transparent 100%)," +
              "repeating-linear-gradient(90deg, transparent 0 60px, rgba(92,224,255,0.35) 60px 62px)," +
              "repeating-linear-gradient(0deg, transparent 0 60px, rgba(255,61,168,0.32) 60px 62px)",
            animation: "grid-rush 1.2s linear infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background: "linear-gradient(to bottom, transparent, #0a0218)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.18) 2px 3px)",
          mixBlendMode: "multiply",
          opacity: 0.55,
        }}
      />

      <style>{`
        @keyframes lateDriveTwinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 0.9; } }
        @keyframes theo-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 1.1; } }
        @keyframes theo-idle { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.06); opacity: 0.85; } }
        @keyframes led-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes grid-rush {
          from { background-position: 0 0, 0 0, 0 0; }
          to   { background-position: 0 0, 0 0, 0 60px; }
        }
      `}</style>
    </div>
  );
}

function Knob() {
  return (
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: "999px",
        background: "radial-gradient(circle at 35% 30%, #5a2a6a 0%, #1a041a 80%)",
        border: "1px solid rgba(255,61,168,0.5)",
        position: "relative",
        justifySelf: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          width: 2,
          height: "30%",
          background: "#5ce0ff",
          boxShadow: "0 0 4px #5ce0ff",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}

function Lcd({ showMusic }: { showMusic: boolean }) {
  return (
    <div
      style={{
        height: 72,
        background: "#0a0410",
        border: "1px solid rgba(92,224,255,0.3)",
        borderRadius: 4,
        padding: "8px 12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "inset 0 0 12px rgba(92,224,255,0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "ui-monospace, monospace",
          fontSize: 10,
          color: "#5ce0ff",
          textShadow: "0 0 4px #5ce0ff",
          letterSpacing: "0.18em",
        }}
      >
        <span>FM 102.7</span>
        <span>{showMusic ? "ON AIR" : "BREAK"}</span>
      </div>
      <div
        style={{
          fontFamily: "ui-serif, Georgia, serif",
          fontSize: 18,
          color: "#ff3da8",
          textShadow: "0 0 6px rgba(255,61,168,0.6)",
        }}
      >
        late drive
      </div>
    </div>
  );
}
