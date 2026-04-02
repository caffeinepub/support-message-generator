import { Sparkles, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<"loading" | "fadeout">("loading");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fadeout"), 2200);
    const completeTimer = setTimeout(onComplete, 2700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "linear-gradient(150deg, #0d1128 0%, #1a0e3a 45%, #0b2a1e 100%)",
      }}
    >
      {/* Star-field dots */}
      {[
        { top: "8%", left: "12%", size: 2, opacity: 0.5 },
        { top: "14%", left: "78%", size: 3, opacity: 0.4 },
        { top: "22%", left: "55%", size: 1.5, opacity: 0.6 },
        { top: "35%", left: "5%", size: 2, opacity: 0.35 },
        { top: "62%", left: "90%", size: 2.5, opacity: 0.45 },
        { top: "75%", left: "18%", size: 1.5, opacity: 0.4 },
        { top: "88%", left: "65%", size: 2, opacity: 0.3 },
      ].map((dot, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: decorative star-field positions
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            background: "white",
            opacity: dot.opacity,
          }}
        />
      ))}

      {/* Ambient glow blobs */}
      <div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: 320,
          height: 320,
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(79,166,255,0.22) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: 260,
          height: 260,
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(circle, rgba(46,229,157,0.16) 0%, transparent 70%)",
        }}
      />

      {/* Logo stack */}
      <div className="relative flex items-center justify-center mb-9">
        {/* Outermost glow ring */}
        <div
          className="absolute rounded-[28px]"
          style={{
            width: 120,
            height: 120,
            background:
              "linear-gradient(135deg, rgba(79,166,255,0.18), rgba(123,92,255,0.18))",
            filter: "blur(16px)",
          }}
        />
        {/* Pulsing rings — offset from center so they expand outward, not inward */}
        <div
          className="absolute rounded-[22px]"
          style={{
            width: 96,
            height: 96,
            border: "1.5px solid rgba(123,92,255,0.45)",
            animation: "splashRing 2.2s ease-out infinite",
          }}
        />
        <div
          className="absolute rounded-[22px]"
          style={{
            width: 96,
            height: 96,
            border: "1.5px solid rgba(79,166,255,0.35)",
            animation: "splashRing 2.2s ease-out 0.7s infinite",
          }}
        />

        {/* Logo box — layered: outer shimmer ring + inner frosted box */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 88,
            height: 88,
            borderRadius: 22,
            background:
              "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 55%, #2EE59D 100%)",
            boxShadow:
              "0 0 0 1.5px rgba(255,255,255,0.18), 0 12px 48px rgba(79,92,255,0.55), 0 4px 16px rgba(46,229,157,0.3)",
          }}
        >
          {/* Inner gloss highlight */}
          <div
            className="absolute inset-0 rounded-[22px] pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, transparent 55%)",
            }}
          />
          <Wallet
            className="w-10 h-10 text-white relative"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
          />
        </div>
      </div>

      {/* App name */}
      <h1
        className="text-[28px] font-extrabold tracking-tight mb-2 animate-slide-up"
        style={{
          animationDelay: "0.2s",
          background:
            "linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.85) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.02em",
        }}
      >
        AI Cash Manager
      </h1>

      {/* Tagline */}
      <p
        className="text-[13px] font-medium animate-slide-up"
        style={{
          animationDelay: "0.35s",
          color: "rgba(180,190,230,0.9)",
          letterSpacing: "0.01em",
        }}
      >
        Your AI-powered financial brain
      </p>

      {/* Loading dots */}
      <div
        className="flex gap-2.5 mt-14 animate-slide-up"
        style={{ animationDelay: "0.5s" }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 1 ? 8 : 6,
              height: i === 1 ? 8 : 6,
              background:
                i === 1
                  ? "linear-gradient(135deg, #4FA6FF, #7B5CFF)"
                  : "rgba(180,190,230,0.45)",
              animation: `bounceDot 1.4s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Sparkle decorators */}
      <div className="absolute top-16 left-12 opacity-30">
        <Sparkles className="w-5 h-5" style={{ color: "#4FA6FF" }} />
      </div>
      <div className="absolute top-28 right-10 opacity-20">
        <Sparkles className="w-3.5 h-3.5" style={{ color: "#7B5CFF" }} />
      </div>
      <div className="absolute bottom-36 left-8 opacity-25">
        <Sparkles className="w-4 h-4" style={{ color: "#2EE59D" }} />
      </div>
      <div className="absolute bottom-24 right-14 opacity-20">
        <Sparkles className="w-5 h-5" style={{ color: "#4FA6FF" }} />
      </div>
    </div>
  );
}
