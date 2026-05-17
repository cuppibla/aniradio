"use client";

import type { SceneProps } from "./types";

export function ForestScene({ djSpeaking, showMusic }: SceneProps) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 65% 78%, rgba(201,161,85,0.55) 0%, transparent 40%)," +
          "radial-gradient(ellipse at 30% 60%, rgba(180,120,80,0.18) 0%, transparent 50%)," +
          "linear-gradient(180deg, #1a2e3a 0%, #1e342e 40%, #3a3a28 70%, #5c4426 100%)",
      }}
    >
      {/* sun low behind trees */}
      <div
        className="absolute"
        style={{
          bottom: "18%",
          left: "64%",
          width: 100,
          height: 100,
          borderRadius: "999px",
          background: "radial-gradient(circle, #ffe8b0 0%, #ffb86a 50%, transparent 75%)",
          filter: "blur(2px)",
          opacity: 0.85,
        }}
      />

      {/* drifting clouds */}
      <div
        className="absolute"
        style={{
          top: "25%",
          left: "-10%",
          right: "-10%",
          height: 80,
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(255,220,180,0.08) 0%, transparent 30%)," +
            "radial-gradient(ellipse at 50% 50%, rgba(255,220,180,0.06) 0%, transparent 25%)," +
            "radial-gradient(ellipse at 80% 50%, rgba(255,220,180,0.07) 0%, transparent 28%)",
          filter: "blur(10px)",
          animation: "forest-clouds 60s linear infinite",
        }}
      />

      {/* three layers of treeline */}
      <Treeline kind="back" />
      <Treeline kind="mid" />
      <Treeline kind="front" />

      {/* Sora — drifting lantern through the trees */}
      <div
        className="absolute"
        style={{
          bottom: "28%",
          left: "38%",
          width: 64,
          height: 64,
          zIndex: 8,
          animation: "sora-drift 22s ease-in-out infinite",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            inset: -20,
            background:
              "radial-gradient(circle, rgba(255,200,140,0.55) 0%, rgba(255,160,100,0.25) 40%, transparent 70%)",
            filter: "blur(10px)",
            animation: djSpeaking ? "sora-breathe-fast 2.4s ease-in-out infinite" : "sora-breathe 5s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            width: 14,
            height: 14,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, #fff2d6 0%, #ffc09c 70%, transparent 90%)",
            filter: "blur(1px)",
          }}
        />
      </div>

      {/* fireflies */}
      {[
        { top: "35%", left: "25%", delay: "0s" },
        { top: "42%", left: "60%", delay: "2s" },
        { top: "55%", left: "75%", delay: "4s" },
        { top: "48%", left: "15%", delay: "1s" },
        { top: "62%", left: "85%", delay: "3s" },
        { top: "38%", left: "45%", delay: "6s" },
      ].map((f, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: f.top,
            left: f.left,
            width: 3,
            height: 3,
            borderRadius: "999px",
            background: "#ffd98a",
            boxShadow: "0 0 10px #ffd98a, 0 0 20px rgba(255,217,138,0.4)",
            animation: `firefly-float 8s ease-in-out infinite`,
            animationDelay: f.delay,
            opacity: 0.7,
          }}
        />
      ))}

      {/* waveform near bottom — only when music is playing */}
      {showMusic && (
        <div
          className="absolute flex items-center justify-center gap-[3px]"
          style={{
            bottom: 200,
            left: 0,
            right: 0,
            height: 40,
            opacity: 0.45,
            zIndex: 9,
          }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: 2,
                borderRadius: 1,
                background: "rgba(232,224,212,0.7)",
                animation: `wave-bar 2s ease-in-out infinite`,
                animationDelay: `${(i % 5) * -0.4}s`,
                animationDuration: `${1.7 + (i % 4) * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes forest-clouds { from { transform: translateX(0); } to { transform: translateX(-150px); } }
        @keyframes sora-drift {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, -8px); }
          66% { transform: translate(-15px, 10px); }
        }
        @keyframes sora-breathe { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 0.95; } }
        @keyframes sora-breathe-fast { 0%, 100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.25); opacity: 1; } }
        @keyframes firefly-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes wave-bar { 0%, 100% { height: 4px; } 50% { height: 22px; } }
      `}</style>
    </div>
  );
}

function Treeline({ kind }: { kind: "back" | "mid" | "front" }) {
  const config = {
    back:  { bottom: "28%", opacity: 0.45, fill: "#0a1d10", path: "M0,200 L0,140 L60,90 L100,140 L160,80 L210,140 L260,100 L320,150 L380,90 L430,140 L490,75 L550,140 L610,100 L670,150 L740,85 L810,140 L870,95 L940,150 L1010,75 L1080,140 L1150,95 L1220,150 L1290,85 L1360,140 L1400,100 L1400,200 Z", viewBox: "0 0 1400 200" },
    mid:   { bottom: "18%", opacity: 0.75, fill: "#08160c", path: "M0,240 L0,160 L70,80 L130,150 L200,60 L270,150 L340,70 L410,150 L470,90 L540,160 L610,55 L690,160 L760,90 L820,160 L890,60 L960,150 L1030,80 L1100,160 L1170,70 L1240,150 L1310,80 L1380,160 L1400,140 L1400,240 Z", viewBox: "0 0 1400 240" },
    front: { bottom: "0",   opacity: 1,    fill: "#040a06", path: "M0,280 L0,180 L80,40 L160,180 L240,30 L320,180 L400,50 L480,180 L560,20 L640,180 L720,60 L800,180 L880,35 L960,180 L1040,45 L1120,180 L1200,20 L1280,180 L1360,55 L1400,180 L1400,280 Z", viewBox: "0 0 1400 280" },
  }[kind];
  return (
    <div
      className="absolute left-0 right-0"
      style={{ bottom: config.bottom, opacity: config.opacity }}
    >
      <svg viewBox={config.viewBox} preserveAspectRatio="none" className="w-full h-auto block">
        <path d={config.path} fill={config.fill} />
      </svg>
    </div>
  );
}
