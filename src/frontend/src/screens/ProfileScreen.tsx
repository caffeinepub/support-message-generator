import { Switch } from "@/components/ui/switch";
import {
  BadgeIndianRupee,
  Bell,
  ChevronRight,
  Download,
  Fingerprint,
  Info,
  Lock,
  LogOut,
  Moon,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useRipple } from "../hooks/useRipple";
import type { Screen, UserProfile } from "../types";

interface Props {
  profile: UserProfile;
  userName: string;
  userEmail: string;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

function SettingsRow({
  icon,
  label,
  description,
  right,
  onClick,
  ocid,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  ocid?: string;
  danger?: boolean;
}) {
  const ripple = useRipple();
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={onClick ? ripple : undefined}
      onTouchStart={onClick ? ripple : undefined}
      className={`ripple-container flex items-center gap-3 w-full px-4 py-3.5 transition-colors ${
        onClick
          ? "hover:bg-muted/40 active:bg-muted/60 cursor-pointer"
          : "cursor-default"
      }`}
      data-ocid={ocid}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger
            ? "bg-red-100 dark:bg-red-900/30 text-red-500"
            : "bg-muted/60 text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p
          className={`text-sm font-medium ${
            danger ? "text-red-500" : "text-foreground"
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{right}</div>
    </button>
  );
}

export default function ProfileScreen({
  profile,
  userName,
  userEmail,
  theme,
  onToggleTheme,
  onNavigate,
  onLogout,
}: Props) {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8">
      {/* Header */}
      <div className="pt-5">
        <h2 className="text-xl font-extrabold text-foreground">Profile</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Settings & Preferences
        </p>
      </div>

      {/* ── Avatar Card ── */}
      <div
        className="rounded-2xl p-5 flex items-center gap-4 animate-fade-up"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,166,255,0.10) 0%, rgba(123,92,255,0.10) 100%)",
          border: "1px solid rgba(123,92,255,0.18)",
          animationDelay: "0ms",
        }}
        data-ocid="profile.card"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0 select-none"
          style={{
            background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
            boxShadow: "0 6px 20px rgba(123,92,255,0.35)",
          }}
        >
          {initials || <User className="w-7 h-7" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base truncate leading-tight">
            {userName || "User"}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {userEmail}
          </p>
          <div className="flex gap-2 mt-2.5">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
              }}
            >
              Premium
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-semibold">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* ── Finance stats ── */}
      <div
        className="grid grid-cols-2 gap-3 animate-fade-up"
        style={{ animationDelay: "60ms" }}
      >
        {[
          {
            label: "Monthly Income",
            value: `₹${(profile.monthlyIncome / 1000).toFixed(1)}K`,
          },
          {
            label: "Savings Goal",
            value: `₹${(profile.savingsGoal / 1000).toFixed(1)}K`,
          },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-extrabold text-foreground mt-1">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Preferences ── */}
      <div
        className="glass-card overflow-hidden animate-fade-up"
        style={{ animationDelay: "120ms" }}
      >
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Preferences
          </p>
        </div>
        <SettingsRow
          icon={
            theme === "dark" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )
          }
          label="Dark Mode"
          description={theme === "dark" ? "Currently dark" : "Currently light"}
          right={
            <Switch
              checked={theme === "dark"}
              onCheckedChange={onToggleTheme}
              data-ocid="profile.switch"
            />
          }
        />
        <div className="h-px bg-border/40 mx-4" />
        <SettingsRow
          icon={<Bell className="w-4 h-4" />}
          label="Notifications"
          description="Smart alerts and reminders"
          right={<Switch defaultChecked data-ocid="profile.switch" />}
        />
      </div>

      {/* ── Settings ── */}
      <div
        className="glass-card overflow-hidden animate-fade-up"
        style={{ animationDelay: "180ms" }}
      >
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Settings
          </p>
        </div>
        <SettingsRow
          icon={<Lock className="w-4 h-4" />}
          label="PIN Security"
          description="Set a 4-digit PIN"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
          ocid="profile.button"
        />
        <div className="h-px bg-border/40 mx-4" />
        <SettingsRow
          icon={<Fingerprint className="w-4 h-4" />}
          label="Biometrics"
          description="Fingerprint / Face ID"
          right={<Switch data-ocid="profile.switch" />}
        />
        <div className="h-px bg-border/40 mx-4" />
        <SettingsRow
          icon={<BadgeIndianRupee className="w-4 h-4" />}
          label="Loan Manager"
          description="Track EMIs & repayment"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => onNavigate("loans")}
          ocid="profile.link"
        />
        <div className="h-px bg-border/40 mx-4" />
        <SettingsRow
          icon={<Download className="w-4 h-4" />}
          label="Export Data"
          description="Download your financial data"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
          ocid="profile.button"
        />
      </div>

      {/* ── About ── */}
      <div
        className="glass-card overflow-hidden animate-fade-up"
        style={{ animationDelay: "240ms" }}
      >
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            About
          </p>
        </div>
        <SettingsRow
          icon={<Info className="w-4 h-4" />}
          label="App Version"
          description="AI Expense Pro v2.0"
          right={<span className="text-xs text-muted-foreground">Latest</span>}
        />
        <div className="h-px bg-border/40 mx-4" />
        <SettingsRow
          icon={<Shield className="w-4 h-4" />}
          label="Privacy Policy"
          description="How we handle your data"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
          ocid="profile.link"
        />
      </div>

      {/* ── Logout ── */}
      <div
        className="glass-card overflow-hidden animate-fade-up"
        style={{ animationDelay: "300ms" }}
      >
        <SettingsRow
          icon={<LogOut className="w-4 h-4" />}
          label="Sign Out"
          description="Logout from your account"
          danger
          onClick={onLogout}
          ocid="profile.delete_button"
        />
      </div>
    </div>
  );
}
