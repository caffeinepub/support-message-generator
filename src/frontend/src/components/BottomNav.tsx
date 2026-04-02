import {
  Activity,
  LayoutDashboard,
  List,
  MessageCircle,
  Target,
} from "lucide-react";
import type { Screen } from "../types";

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
}

const TABS: {
  id: Screen;
  label: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Home", Icon: LayoutDashboard },
  { id: "expenses", label: "Expenses", Icon: List },
  { id: "goals", label: "Goals", Icon: Target },
  { id: "chat", label: "Chat", Icon: MessageCircle },
  { id: "score", label: "Score", Icon: Activity },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur border-t border-border/50 z-50"
      style={{ height: 60 }}
      aria-label="Main navigation"
    >
      <div className="flex h-full">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                isActive ? "brand-text" : "text-muted-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
              data-ocid={`nav.${id}.link`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
              />
              <span
                className={`text-[10px] font-medium tracking-wide uppercase ${isActive ? "brand-text" : ""}`}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 brand-bg rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
