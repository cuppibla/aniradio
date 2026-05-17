"use client";

import type { SceneProps } from "./types";

export function SundayKitchenScene({ djSpeaking, showMusic }: SceneProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 25%, rgba(255,235,180,0.55) 0%, transparent 55%)," +
          "linear-gradient(160deg, #d18a5b 0%, #8a4a32 60%, #3a1c14 100%)",
      }}
    >
      {/* large window with sunlight pouring in */}
      <div
        className="absolute"
        style={{
          top: "10%",
          left: "8%",
          width: "32%",
          height: "55%",
          border: "5px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(180deg, rgba(255,235,180,0.35) 0%, rgba(255,235,180,0.08) 100%)",
        }}
      >
        {/* window cross bars */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: 0,
            bottom: 0,
            width: 3,
            background: "rgba(255,255,255,0.18)",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="absolute"
          style={{
            left: 0,
            right: 0,
            top: "50%",
            height: 3,
            background: "rgba(255,255,255,0.18)",
            transform: "translateY(-50%)",
          }}
        />
      </div>

      {/* light beam from the window across the kitchen */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "15%",
          left: "12%",
          width: "70%",
          height: "70%",
          background:
            "linear-gradient(125deg, rgba(255,235,180,0.18) 0%, rgba(255,235,180,0.05) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* drifting dust particles in the beam */}
      {[
        { top: "28%", left: "30%", delay: "0s" },
        { top: "35%", left: "40%", delay: "2s" },
        { top: "45%", left: "35%", delay: "1s" },
        { top: "52%", left: "48%", delay: "3s" },
        { top: "40%", left: "55%", delay: "4s" },
      ].map((d, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: d.top,
            left: d.left,
            width: 2,
            height: 2,
            borderRadius: "999px",
            background: "rgba(255,235,180,0.7)",
            boxShadow: "0 0 4px rgba(255,235,180,0.5)",
            animation: `kitchen-dust 8s ease-in-out infinite`,
            animationDelay: d.delay,
          }}
        />
      ))}

      {/* the kitchen radio on the windowsill — center-right */}
      <div
        className="absolute fade-soft"
        style={{
          left: "52%",
          top: "44%",
          transform: "translate(-50%, -50%) " + (showMusic ? "scale(1)" : "scale(0.94)"),
          width: 280,
          maxWidth: "60vw",
          height: 150,
          background: "linear-gradient(180deg, #f2e3c8 0%, #d9bf95 100%)",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.15)",
          boxShadow: "0 12px 30px rgba(60,30,15,0.4), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        {/* speaker grill — wide horizontal */}
        <div
          className="absolute"
          style={{
            top: 15,
            left: 18,
            width: "60%",
            height: "calc(100% - 30px)",
            background:
              "repeating-linear-gradient(0deg, transparent 0 3px, rgba(70,40,20,0.45) 3px 4px)",
            borderRadius: 6,
            border: "1px solid rgba(70,40,20,0.25)",
          }}
        />
        {/* tuning dial */}
        <div
          className="absolute"
          style={{
            top: 18,
            right: 18,
            width: 64,
            height: 64,
            borderRadius: "999px",
            background: "radial-gradient(circle at 35% 30%, #c08654 0%, #6a3a22 80%)",
            border: "1px solid rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              width: 2,
              height: "30%",
              background: "#fff5d0",
              transform: "translateX(-50%)",
            }}
          />
        </div>
        {/* frequency display */}
        <div
          className="absolute"
          style={{
            bottom: 12,
            right: 18,
            width: 64,
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            textAlign: "center",
            color: "#4a2a14",
            letterSpacing: "0.1em",
          }}
        >
          {showMusic ? "ON AIR" : "94.5 fm"}
        </div>
      </div>

      {/* Wren — warm cooking-light glow at the bottom right (like the oven light) */}
      <div
        className="absolute"
        style={{
          bottom: "8%",
          right: "10%",
          width: 140,
          height: 140,
          zIndex: 10,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,180,100,0.6) 0%, rgba(220,120,80,0.3) 45%, transparent 75%)",
            filter: "blur(14px)",
            animation: djSpeaking ? "wren-pulse 2.4s ease-in-out infinite" : "wren-idle 5s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            width: 32,
            height: 32,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, #fff0d0 0%, #ffb068 70%, transparent 90%)",
            filter: "blur(2px)",
          }}
        />
      </div>

      <style>{`
        @keyframes kitchen-dust {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          50% { transform: translate(15px, -25px); opacity: 0.9; }
        }
        @keyframes wren-pulse { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.12); opacity: 1; } }
        @keyframes wren-idle { 0%, 100% { transform: scale(1); opacity: 0.65; } 50% { transform: scale(1.05); opacity: 0.85; } }
      `}</style>
    </div>
  );
}
