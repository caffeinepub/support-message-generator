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
  User,
} from "lucide-react";
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

  function SettingsRow({
    icon,
    label,
    description,
    right,
    onClick,
    ocid,
  }: {
    icon: React.ReactNode;
    label: string;
    description?: string;
    right?: React.ReactNode;
    onClick?: () => void;
    ocid?: string;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-4 rounded-xl transition-colors ${
          onClick
            ? "hover:bg-muted/50 active:bg-muted/70 cursor-pointer"
            : "cursor-default"
        }`}
        data-ocid={ocid}
      >
        <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center flex-shrink-0 text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">{right}</div>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-8">
      {/* Header */}
      <div className="pt-4">
        <h2 className="text-lg font-extrabold text-foreground">Profile</h2>
        <p className="text-xs text-muted-foreground">Settings & Preferences</p>
      </div>

      {/* User avatar card */}
      <div
        className="p-5 rounded-2xl flex items-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(79,166,255,0.12) 0%, rgba(123,92,255,0.12) 100%)",
          border: "1px solid rgba(123,92,255,0.2)",
        }}
        data-ocid="profile.card"
      >
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
            boxShadow: "0 6px 20px rgba(123,92,255,0.35)",
          }}
        >
          {initials || <User className="w-7 h-7" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base truncate">
            {userName}
          </p>
          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          <div className="flex gap-2 mt-2">
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
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-white/40 dark:bg-white/10 flex items-center justify-center"
          aria-label="Edit profile"
          data-ocid="profile.edit_button"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Finance stats */}
      <div className="grid grid-cols-2 gap-3">
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
          <div key={s.label} className="glass-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Preferences
          </p>
        </div>
        <SettingsRow
          icon={<Moon className="w-4 h-4" />}
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
        <SettingsRow
          icon={<Bell className="w-4 h-4" />}
          label="Notifications"
          description="Smart alerts and reminders"
          right={<Switch defaultChecked data-ocid="profile.switch" />}
        />
      </div>

      {/* Security */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Security
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
        <SettingsRow
          icon={<Fingerprint className="w-4 h-4" />}
          label="Biometrics"
          description="Fingerprint / Face ID"
          right={<Switch data-ocid="profile.switch" />}
        />
        <SettingsRow
          icon={<Shield className="w-4 h-4" />}
          label="Privacy & Security"
          description="Data encryption enabled"
          right={
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-semibold">
              On
            </span>
          }
        />
      </div>

      {/* Finance */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Finance
          </p>
        </div>
        <SettingsRow
          icon={<BadgeIndianRupee className="w-4 h-4" />}
          label="Loan Manager"
          description="Track EMIs & repayment"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => onNavigate("loans")}
          ocid="profile.link"
        />
        <SettingsRow
          icon={<Download className="w-4 h-4" />}
          label="Export Data"
          description="Download your financial data"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
          ocid="profile.button"
        />
      </div>

      {/* About */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            About
          </p>
        </div>
        <SettingsRow
          icon={<Info className="w-4 h-4" />}
          label="App Version"
          description="v2.0.0"
          right={<span className="text-xs text-muted-foreground">Latest</span>}
        />
        <SettingsRow
          icon={<Shield className="w-4 h-4" />}
          label="Privacy Policy"
          right={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          onClick={() => {}}
          ocid="profile.link"
        />
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="w-full h-12 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 text-red-500 border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 transition-all active:scale-[0.98]"
        data-ocid="profile.delete_button"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
