"use client";

interface MiraOrbProps {
  /** "speaking" → larger, brighter, faster pulse. "idle" → small breathe. */
  state: "speaking" | "idle";
  size?: number;
  /** Optional [warm, cool] palette. Defaults to Mira's peach/lavender. */
  palette?: [string, string];
}

export function MiraOrb({ state, size = 280, palette }: MiraOrbProps) {
  const animClass = state === "speaking" ? "orb-speaking" : "orb-breathing";
  const [warm, cool] = palette ?? ["#FFB89E", "#A78BC9"];
  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      {/* outer soft halo */}
      <div
        className={`absolute inset-0 rounded-full ${animClass}`}
        style={{
          background: `radial-gradient(circle at 35% 35%, ${warm} 0%, ${cool} 70%, transparent 100%)`,
          opacity: state === "speaking" ? 0.85 : 0.55,
        }}
      />
      {/* core */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "22%",
          background:
            `radial-gradient(circle at 40% 40%, rgba(255,245,235,0.95), ${warm}80 45%, ${cool}50 80%, transparent)`,
          filter: "blur(8px)",
        }}
      />
      {/* highlight */}
      <div
        className="absolute rounded-full"
        style={{
          width: "20%",
          height: "20%",
          top: "26%",
          left: "30%",
          background: "radial-gradient(circle, rgba(255,245,235,0.7), transparent 70%)",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
}
