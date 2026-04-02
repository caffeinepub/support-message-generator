import { Brain, Home, Plus, Target, User } from "lucide-react";
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
  { id: "insights", label: "Insights", Icon: Brain },
];

const RIGHT_TABS: {
  id: Screen;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { id: "goals", label: "Goals", Icon: Target },
  { id: "profile", label: "Profile", Icon: User },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur border-t border-border/50 z-50"
      style={{ height: 64 }}
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
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative ${
                isActive ? "brand-text" : "text-muted-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
              data-ocid={`nav.${id}.link`}
            >
              <Icon
                className={`w-5 h-5 transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span
                className={`text-[9px] font-semibold tracking-wide uppercase ${
                  isActive ? "brand-text" : ""
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 brand-bg rounded-full" />
              )}
            </button>
          );
        })}

        {/* Center FAB */}
        <div className="flex-shrink-0 flex items-center justify-center w-20">
          <button
            type="button"
            onClick={() => onChange("expenses")}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-90"
            style={{
              background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
              boxShadow:
                "0 4px 20px rgba(123,92,255,0.5), 0 0 0 4px rgba(123,92,255,0.12)",
              marginBottom: 16,
            }}
            aria-label="Add expense"
            data-ocid="nav.add.button"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Right tabs */}
        {RIGHT_TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative ${
                isActive ? "brand-text" : "text-muted-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
              data-ocid={`nav.${id}.link`}
            >
              <Icon
                className={`w-5 h-5 transition-all ${
                  isActive ? "scale-110" : ""
                }`}
              />
              <span
                className={`text-[9px] font-semibold tracking-wide uppercase ${
                  isActive ? "brand-text" : ""
                }`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 brand-bg rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
