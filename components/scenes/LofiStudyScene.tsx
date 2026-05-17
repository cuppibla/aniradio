"use client";

import type { SceneProps } from "./types";

export function LofiStudyScene({ djSpeaking, showMusic }: SceneProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 90% 90%, rgba(255,207,138,0.08) 0%, transparent 35%)," +
          "radial-gradient(ellipse at 15% 10%, rgba(120,160,200,0.1) 0%, transparent 45%)," +
          "linear-gradient(160deg, #1a3550 0%, #0c1a2a 70%, #060e18 100%)",
      }}
    >
      {/* far-right window glow */}
      <div
        className="absolute"
        style={{
          top: "8%",
          right: "6%",
          width: "22%",
          height: "60%",
          background:
            "linear-gradient(135deg, rgba(255,225,180,0.18) 0%, rgba(255,225,180,0.08) 50%, transparent 100%)",
          filter: "blur(20px)",
        }}
      />

      {/* rain */}
      <Rain />

      {/* cassette tape — center stage */}
      <div
        className="absolute fade-soft"
        style={{
          left: "50%",
          top: "calc(50% - 60px)",
          transform: "translate(-50%, -50%) " + (showMusic ? "scale(1)" : "scale(0.95)"),
          width: 520,
          maxWidth: "78vw",
          aspectRatio: "8 / 5",
          background: "linear-gradient(135deg, #2a3d52 0%, #1a2838 50%, #14202e 100%)",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
          opacity: showMusic ? 1 : 0.55,
          filter: showMusic ? "none" : "blur(0.5px)",
        }}
      >
        {/* label panel */}
        <div
          className="absolute"
          style={{
            top: "8%",
            left: "8%",
            right: "8%",
            height: "30%",
            background: "linear-gradient(90deg, #e8d8b8 0%, #d8c5a0 100%)",
            borderRadius: 4,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.15)",
          }}
        />
        {/* tape window */}
        <div
          className="absolute"
          style={{
            bottom: "28%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "38%",
            height: 4,
            background: "#14202e",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.25) 6px 7px)",
              animation: showMusic ? "tape 0.6s linear infinite" : "none",
            }}
          />
        </div>
        {/* reels */}
        <Reel side="left" spinning={showMusic} />
        <Reel side="right" spinning={showMusic} />
      </div>

      {/* Yui — warm desk-lamp glow in the bottom right */}
      <div
        className="absolute"
        style={{
          bottom: "6%",
          right: "6%",
          width: 160,
          height: 160,
          zIndex: 10,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(255,215,140,0.9) 0%, rgba(255,180,120,0.5) 30%, rgba(220,140,180,0.3) 55%, transparent 75%)",
            filter: "blur(10px)",
            animation: djSpeaking ? "yui-pulse 2.2s ease-in-out infinite" : "yui-idle 5s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            width: 36,
            height: 36,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, #fff2d6 0%, #ffb86a 60%, transparent 80%)",
            filter: "blur(3px)",
          }}
        />
      </div>

      <style>{`
        @keyframes tape { to { transform: translateX(7px); } }
        @keyframes reel-spin { to { transform: rotate(360deg); } }
        @keyframes yui-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes yui-idle {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.04); opacity: 0.8; }
        }
        @keyframes rain-fall { from { transform: translateY(-60px); } to { transform: translateY(60px); } }
      `}</style>
    </div>
  );
}

function Reel({ side, spinning }: { side: "left" | "right"; spinning: boolean }) {
  return (
    <div
      className="absolute"
      style={{
        bottom: "14%",
        [side]: "14%",
        width: "22%",
        aspectRatio: 1,
        borderRadius: "999px",
        background: "radial-gradient(circle, #0a1320 0%, #060c14 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        animation: spinning ? "reel-spin 4.5s linear infinite" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "38%",
          borderRadius: "999px",
          background: "#9fc3e0",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function Rain() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.4 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(72deg, transparent 0 40px, rgba(159,195,224,0.25) 40px 41px, transparent 41px 60px)",
          animation: "rain-fall 0.9s linear infinite",
        }}
      />
    </div>
  );
}
