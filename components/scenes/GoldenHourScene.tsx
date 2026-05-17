"use client";

import type { SceneProps } from "./types";

export function GoldenHourScene({ djSpeaking, showMusic }: SceneProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 70% 35%, #ffb069 0%, #ff7a5c 35%, #a83c52 70%, #2a0f1c 100%)",
      }}
    >
      {/* horizon line of distant trees */}
      <div
        className="absolute left-0 right-0"
        style={{ bottom: "32%", height: 50, opacity: 0.55 }}
      >
        <svg viewBox="0 0 1400 50" preserveAspectRatio="none" className="w-full h-full block">
          <path
            d="M0,50 L0,35 L60,25 L120,38 L200,22 L280,40 L360,28 L440,38 L520,20 L600,40 L680,30 L760,38 L840,22 L920,40 L1000,28 L1080,38 L1160,25 L1240,40 L1320,30 L1400,38 L1400,50 Z"
            fill="#2a0f1c"
          />
        </svg>
      </div>

      {/* grass field — foreground */}
      <div
        className="absolute left-0 right-0 bottom-0"
        style={{
          height: "32%",
          background:
            "linear-gradient(180deg, rgba(168,60,82,0.0) 0%, rgba(80,32,40,0.4) 50%, rgba(40,12,18,0.85) 100%)",
        }}
      />
      {/* texture stripes for grass */}
      <div
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          height: "32%",
          background:
            "repeating-linear-gradient(98deg, transparent 0 3px, rgba(40,12,18,0.18) 3px 4px)",
          opacity: 0.5,
        }}
      />

      {/* picnic blanket — soft red checker peeking up bottom-left */}
      <div
        className="absolute"
        style={{
          bottom: "-8%",
          left: "8%",
          width: "32%",
          height: "30%",
          background:
            "repeating-conic-gradient(rgba(255,100,80,0.55) 0% 25%, rgba(245,225,180,0.55) 0% 50%)",
          backgroundSize: "60px 60px",
          transform: "perspective(200px) rotateX(60deg)",
          transformOrigin: "bottom",
          opacity: 0.6,
          filter: "blur(0.5px)",
        }}
      />

      {/* main lens flare — the low sun */}
      <div
        className="absolute"
        style={{
          top: "30%",
          left: "70%",
          width: 8,
          height: 8,
          borderRadius: "999px",
          background: "#fff7e6",
          boxShadow:
            "0 0 40px 12px rgba(255,247,230,0.9), 0 0 100px 30px rgba(255,200,140,0.55), 0 0 160px 60px rgba(255,150,100,0.25)",
        }}
      />
      {/* lens streak */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "55%",
          left: "25%",
          width: 180,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(255,247,230,0.5), transparent)",
          transform: "rotate(-15deg)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "42%",
          left: "55%",
          width: 60,
          height: 60,
          borderRadius: "999px",
          background: "radial-gradient(circle, rgba(255,200,140,0.3), transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* the portable boombox / cassette player resting on the blanket — center-mid */}
      <div
        className="absolute fade-soft"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%) " + (showMusic ? "scale(1)" : "scale(0.94)"),
          width: 360,
          maxWidth: "70vw",
          height: 130,
          background: "linear-gradient(180deg, #2a1414 0%, #1a0a0a 100%)",
          borderRadius: 10,
          border: "1px solid rgba(255,180,100,0.4)",
          boxShadow:
            "0 18px 40px rgba(40,10,5,0.6), 0 0 30px rgba(255,120,80,0.15), inset 0 1px 0 rgba(255,200,140,0.15)",
          zIndex: 6,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          padding: "14px 20px",
          gap: 18,
          alignItems: "center",
        }}
      >
        {/* two speaker grills */}
        <div
          style={{
            height: 90,
            borderRadius: "999px",
            background: "radial-gradient(circle at 35% 30%, #4a2a18 0%, #1a0808 80%)",
            border: "1px solid rgba(255,180,100,0.25)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: "999px",
              background:
                "repeating-radial-gradient(circle at center, rgba(255,180,100,0.18) 0 2px, transparent 2px 5px)",
            }}
          />
        </div>
        <div
          style={{
            height: 90,
            borderRadius: "999px",
            background: "radial-gradient(circle at 35% 30%, #4a2a18 0%, #1a0808 80%)",
            border: "1px solid rgba(255,180,100,0.25)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 12,
              borderRadius: "999px",
              background:
                "repeating-radial-gradient(circle at center, rgba(255,180,100,0.18) 0 2px, transparent 2px 5px)",
            }}
          />
        </div>
      </div>

      {/* Iris — bright but small warm orb floating just above the boombox */}
      <div
        className="absolute"
        style={{
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 100,
          height: 100,
          zIndex: 10,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,220,160,0.9) 0%, rgba(255,170,100,0.5) 40%, transparent 75%)",
            filter: "blur(10px)",
            animation: djSpeaking ? "iris-pulse 2.2s ease-in-out infinite" : "iris-idle 5s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            width: 22,
            height: 22,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, #fff7e6 0%, #ffb069 70%, transparent 90%)",
            filter: "blur(2px)",
          }}
        />
      </div>

      <style>{`
        @keyframes iris-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 1.05; } }
        @keyframes iris-idle { 0%,100% { transform: scale(1); opacity: 0.75; } 50% { transform: scale(1.05); opacity: 0.95; } }
      `}</style>
    </div>
  );
}
