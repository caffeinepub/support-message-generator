import { Home, Plus, Receipt, Target, User } from "lucide-react";
import { useRef } from "react";
import { useRipple } from "../hooks/useRipple";
import type { Screen } from "../types";

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
}

const LEFT_TABS: {
  id: Screen;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Home", Icon: Home },
  { id: "history", label: "History", Icon: Receipt },
];

const RIGHT_TABS: {
  id: Screen;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { id: "goals", label: "Goals", Icon: Target },
  { id: "profile", label: "Profile", Icon: User },
];

function vibrate(ms = 10) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

export default function BottomNav({ active, onChange }: Props) {
  const prevActive = useRef<Screen>(active);
  const ripple = useRipple();

  function handleChange(id: Screen) {
    if (id !== active) {
      vibrate(12);
      prevActive.current = active;
      onChange(id);
    }
  }

  function handleFabClick() {
    vibrate(15);
    onChange("expenses");
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] backdrop-blur-xl border-t border-border/50 z-50"
      style={{
        height: 64,
        background: "rgba(var(--nav-bg, 10 10 30), 0.92)",
        backgroundColor:
          "color-mix(in oklch, oklch(var(--card)) 90%, transparent)",
      }}
      aria-label="Main navigation"
    >
      <div className="flex h-full items-center relative">
        {/* Left tabs */}
        {LEFT_TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleChange(id)}
              onMouseDown={ripple}
              onTouchStart={ripple}
              className={`ripple-container flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative transition-all duration-200 ${
                isActive ? "brand-text" : "text-muted-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
              data-ocid={`nav.${id}.link`}
            >
              {isActive && (
                <span
                  className="absolute inset-x-2 top-1 bottom-1 rounded-xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(79,166,255,0.12) 0%, rgba(123,92,255,0.12) 100%)",
                    boxShadow: "inset 0 0 12px rgba(123,92,255,0.1)",
                    animation: "tabGlowIn 0.25s ease both",
                  }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-all duration-200 relative z-10 ${
                  isActive
                    ? "scale-110 drop-shadow-[0_0_6px_rgba(79,166,255,0.8)]"
                    : ""
                }`}
              />
              <span
                className={`text-[9px] font-semibold tracking-wide uppercase relative z-10 transition-all duration-200 ${
                  isActive ? "brand-text" : ""
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 brand-bg rounded-full"
                  style={{
                    width: 20,
                    animation:
                      "tabIndicatorIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
                    boxShadow: "0 0 6px rgba(79,166,255,0.7)",
                  }}
                />
              )}
            </button>
          );
        })}

        {/* Center FAB */}
        <div className="flex-shrink-0 flex items-center justify-center w-20">
          <button
            type="button"
            onClick={handleFabClick}
            onMouseDown={ripple}
            onTouchStart={ripple}
            className="ripple-container w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
              boxShadow:
                "0 4px 20px rgba(123,92,255,0.55), 0 0 0 4px rgba(123,92,255,0.15), 0 0 24px rgba(79,166,255,0.3)",
              marginBottom: 16,
              animation:
                active === "expenses"
                  ? "fabPulse 1.5s ease-in-out infinite"
                  : "none",
            }}
            aria-label="Add expense"
            data-ocid="nav.add.button"
          >
            <Plus
              className="w-6 h-6 transition-transform duration-200"
              style={{
                transform:
                  active === "expenses" ? "rotate(45deg)" : "rotate(0deg)",
              }}
            />
          </button>
        </div>

        {/* Right tabs */}
        {RIGHT_TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleChange(id)}
              onMouseDown={ripple}
              onTouchStart={ripple}
              className={`ripple-container flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative transition-all duration-200 ${
                isActive ? "brand-text" : "text-muted-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
              data-ocid={`nav.${id}.link`}
            >
              {isActive && (
                <span
                  className="absolute inset-x-2 top-1 bottom-1 rounded-xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(79,166,255,0.12) 0%, rgba(123,92,255,0.12) 100%)",
                    boxShadow: "inset 0 0 12px rgba(123,92,255,0.1)",
                    animation: "tabGlowIn 0.25s ease both",
                  }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-all duration-200 relative z-10 ${
                  isActive
                    ? "scale-110 drop-shadow-[0_0_6px_rgba(79,166,255,0.8)]"
                    : ""
                }`}
              />
              <span
                className={`text-[9px] font-semibold tracking-wide uppercase relative z-10 transition-all duration-200 ${
                  isActive ? "brand-text" : ""
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 brand-bg rounded-full"
                  style={{
                    width: 20,
                    animation:
                      "tabIndicatorIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both",
                    boxShadow: "0 0 6px rgba(79,166,255,0.7)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
