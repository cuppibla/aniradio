"use client";

import { useMemo } from "react";

interface VinylRecordProps {
  albumArtUrl: string | null;
  /** Used as the vinyl label when no album art is available. */
  labelPalette?: [string, string];
  /** "playing" → real RPM. "slow" → background drift while Mira speaks. "still" → no spin. */
  spinState: "playing" | "slow" | "still";
  /** 0 → outer edge, 1 → inner label. Drives needle position. */
  progress: number;
  size?: number;
}

export function VinylRecord({
  albumArtUrl,
  labelPalette,
  spinState,
  progress,
  size = 440,
}: VinylRecordProps) {
  const grooves = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 38; i++) {
      const r = 48 + i * 2.6;
      lines.push(
        <circle
          key={i}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgba(255, 235, 200, 0.045)"
          strokeWidth="0.18"
        />
      );
    }
    return lines;
  }, []);

  const spinClass =
    spinState === "playing"
      ? "vinyl-spinning"
      : spinState === "slow"
      ? "vinyl-slow"
      : "";

  // Needle travels from outer (~r=140 in pixel space) to inner (~r=72) along arc.
  // Map progress 0..1 to needle tip angle. The tonearm pivots from upper-right.
  const needleAngle = -18 + progress * 14; // degrees

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* outer ambient halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,184,158,0.06) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* the disc itself — this rotates */}
      <div
        className={`absolute inset-0 rounded-full ${spinClass}`}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #2a221d 0%, #1a1614 45%, #0d0908 100%)",
          boxShadow:
            "0 30px 60px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* groove lines */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
          {grooves}
        </svg>

        {/* moving reflection highlight */}
        <div
          className="absolute inset-0 rounded-full vinyl-shimmer"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(255,235,200,0.05) 10deg, transparent 30deg, transparent 180deg, rgba(255,235,200,0.04) 195deg, transparent 220deg, transparent 360deg)",
            mixBlendMode: "screen",
          }}
        />

        {/* center label (album art) */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            width: "32%",
            height: "32%",
            top: "34%",
            left: "34%",
            boxShadow:
              "0 0 0 1px rgba(255,235,200,0.08), 0 0 12px rgba(0,0,0,0.6)",
          }}
        >
          {albumArtUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={albumArtUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-full h-full relative"
              style={{
                background: labelPalette
                  ? `radial-gradient(circle at 35% 30%, ${labelPalette[0]} 0%, ${labelPalette[1]} 75%, #0F0B0A 100%)`
                  : "radial-gradient(circle at 50% 50%, #3D332E 0%, #1A1614 80%)",
              }}
            >
              {/* concentric label rings */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="0.4" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,235,200,0.08)" strokeWidth="0.3" />
              </svg>
            </div>
          )}
        </div>

        {/* spindle hole */}
        <div
          className="absolute rounded-full"
          style={{
            width: "3%",
            height: "3%",
            top: "48.5%",
            left: "48.5%",
            background: "#0F0B0A",
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.8)",
          }}
        />
      </div>

      {/* tonearm — does NOT rotate with disc; pivots from upper right */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible" }}
      >
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: "172px 28px",
            transition: "transform 1.6s ease-in-out",
          }}
        >
          {/* pivot base */}
          <circle cx="172" cy="28" r="6" fill="#2a2420" />
          <circle cx="172" cy="28" r="3" fill="#c9b89e" opacity="0.6" />
          {/* arm */}
          <line
            x1="172"
            y1="28"
            x2="108"
            y2="92"
            stroke="#c9b89e"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.75"
          />
          {/* head */}
          <rect
            x="100"
            y="86"
            width="14"
            height="10"
            rx="1.5"
            fill="#1a1614"
            stroke="#c9b89e"
            strokeWidth="0.6"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}
