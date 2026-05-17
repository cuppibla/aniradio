import type { SpaceManifest } from "@/lib/channel-types";

interface Props {
  slug: string;
  manifest: SpaceManifest;
  trackCount: number;
}

export function LobbyCard({ slug, manifest, trackCount }: Props) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:brightness-110 cursor-pointer"
      style={{
        aspectRatio: "4/5",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <CardScene slug={slug} />
      <div
        className="absolute inset-0 flex flex-col justify-end p-5"
        style={{
          background:
            "linear-gradient(to top, rgba(11,10,16,0.85) 0%, rgba(11,10,16,0.4) 35%, transparent 65%)",
        }}
      >
        <div className="flex items-center gap-1.5 text-[11px] text-text/40 mb-1">
          <span
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: "#b8e3a8", boxShadow: "0 0 8px rgba(184,227,168,0.7)" }}
          />
          now: track in progress
        </div>
        <h2 className="font-serif text-xl text-text leading-tight tracking-tight mb-1">
          {manifest.title}
        </h2>
        <div className="text-xs text-text/55 italic mb-3">with {manifest.dj.name}</div>
        <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-text/40">
          <span>{trackCount} tracks</span>
          <span>refreshed mon</span>
        </div>
      </div>
    </div>
  );
}

function CardScene({ slug }: { slug: string }) {
  switch (slug) {
    case "bedroom-pop":
      return (
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 35% 40%, #FFB89E 0%, #E89BB0 30%, #A78BC9 65%, #3a2840 100%)"
        }}>
          <div className="absolute" style={{
            top: "50%", left: "50%", width: "60%", height: "60%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(255,225,210,0.5), transparent 70%)",
            filter: "blur(20px)",
            animation: "card-breathe 5s ease-in-out infinite",
          }} />
          <style>{`@keyframes card-breathe { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.08); } }`}</style>
        </div>
      );
    case "lofi-study":
      return (
        <div className="absolute inset-0 overflow-hidden" style={{
          background: "linear-gradient(160deg, #1a3550 0%, #0c1a2a 100%)"
        }}>
          <div className="absolute" style={{
            top: "38%", left: "50%", transform: "translate(-50%, -50%)",
            width: "70%", aspectRatio: "8/5",
            background: "linear-gradient(135deg, #2a3d52 0%, #1a2838 100%)",
            borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 22px rgba(0,0,0,0.5)",
          }}>
            <div className="absolute" style={{
              top: "50%", left: "12%", width: "26%", aspectRatio: 1,
              transform: "translateY(-50%)", borderRadius: "999px",
              background: "radial-gradient(circle, #0a1320 0%, #060c14 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              <div className="absolute" style={{ inset: "35%", borderRadius: "999px", background: "#9fc3e0", opacity: 0.4 }} />
            </div>
            <div className="absolute" style={{
              top: "50%", right: "12%", width: "26%", aspectRatio: 1,
              transform: "translateY(-50%)", borderRadius: "999px",
              background: "radial-gradient(circle, #0a1320 0%, #060c14 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              <div className="absolute" style={{ inset: "35%", borderRadius: "999px", background: "#9fc3e0", opacity: 0.4 }} />
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "repeating-linear-gradient(72deg, transparent 0 18px, rgba(159,195,224,0.22) 18px 19px, transparent 19px 26px)",
            opacity: 0.55,
          }} />
        </div>
      );
    case "forest-at-dusk":
      return (
        <div className="absolute inset-0" style={{
          background:
            "radial-gradient(ellipse at 60% 80%, #c9a155 0%, transparent 45%)," +
            "linear-gradient(160deg, #1e3a2a 0%, #0a1a14 100%)"
        }}>
          <div className="absolute" style={{
            bottom: "-10%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "80px solid transparent", borderRight: "80px solid transparent",
            borderBottom: "220px solid #0a1d10", opacity: 0.85,
          }} />
          <div className="absolute" style={{
            top: "55%", left: "75%", width: 3, height: 3, borderRadius: "999px",
            background: "#ffd98a", boxShadow: "0 0 8px #ffd98a",
          }} />
          <div className="absolute" style={{
            top: "40%", left: "25%", width: 3, height: 3, borderRadius: "999px",
            background: "#ffd98a", boxShadow: "0 0 8px #ffd98a",
          }} />
        </div>
      );
    case "late-drive":
      return (
        <div className="absolute inset-0 overflow-hidden" style={{
          background: "linear-gradient(180deg, #1a0a2e 0%, #4a0f4a 50%, #0c0418 100%)"
        }}>
          <div className="absolute" style={{
            top: "22%", left: "50%", transform: "translateX(-50%)",
            width: 100, height: 100, borderRadius: "999px",
            background: "radial-gradient(circle, #ff80c8 0%, #ff4d9e 50%, transparent 75%)",
          }} />
          <div className="absolute" style={{
            bottom: 0, left: 0, right: 0, height: "50%",
            background:
              "repeating-linear-gradient(0deg, transparent 0 6px, rgba(255,80,200,0.18) 6px 7px)," +
              "linear-gradient(180deg, transparent 0%, #220a3a 100%)",
            transform: "perspective(120px) rotateX(50deg)",
            transformOrigin: "top",
          }} />
        </div>
      );
    case "sunday-kitchen":
      return (
        <div className="absolute inset-0" style={{
          background:
            "radial-gradient(ellipse at 20% 25%, rgba(255,235,180,0.45) 0%, transparent 55%)," +
            "linear-gradient(160deg, #d18a5b 0%, #6b3a2d 100%)"
        }}>
          <div className="absolute" style={{
            top: "18%", left: "15%", width: "30%", height: "45%",
            border: "5px solid rgba(255,255,255,0.18)",
            background: "linear-gradient(180deg, rgba(255,235,180,0.4) 0%, rgba(255,235,180,0.1) 100%)",
          }}>
            <div className="absolute" style={{ left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.18)", transform: "translateX(-50%)" }} />
            <div className="absolute" style={{ left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,0.18)", transform: "translateY(-50%)" }} />
          </div>
        </div>
      );
    case "golden-hour":
      return (
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 70% 35%, #ffb069 0%, #ff7a5c 35%, #a83c52 70%, #2a0f1c 100%)"
        }}>
          <div className="absolute" style={{
            top: "30%", left: "65%", width: 4, height: 4, borderRadius: "999px",
            background: "#fff7e6",
            boxShadow: "0 0 40px 8px rgba(255,247,230,0.8), 0 0 80px 20px rgba(255,200,140,0.4)",
          }} />
          <div className="absolute pointer-events-none" style={{
            top: "60%", left: "25%", width: 80, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,247,230,0.4), transparent)",
            transform: "rotate(-15deg)",
          }} />
        </div>
      );
    default:
      return <div className="absolute inset-0 bg-vinyl" />;
  }
}
