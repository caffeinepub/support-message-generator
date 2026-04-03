import { Switch } from "@/components/ui/switch";
import {
  BadgeIndianRupee,
  Bell,
  ChevronRight,
  Delete,
  Download,
  Fingerprint,
  Info,
  Lock,
  LogOut,
  Moon,
  PencilLine,
  Shield,
  Sun,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  onUpdateProfile: (p: UserProfile) => void;
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

/* ── PIN Modal ─────────────────────────────────────────── */
type PinFlowStep =
  | "set-enter"
  | "set-confirm"
  | "change-current"
  | "change-new"
  | "change-confirm";

const PIN_STEP_LABELS: Record<PinFlowStep, string> = {
  "set-enter": "Set PIN",
  "set-confirm": "Confirm PIN",
  "change-current": "Enter Current PIN",
  "change-new": "Enter New PIN",
  "change-confirm": "Confirm New PIN",
};

function PinDots({ count, total = 4 }: { count: number; total?: number }) {
  return (
    <div className="flex gap-3 justify-center my-5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static index
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            i < count
              ? "bg-violet-500 border-violet-500 scale-110"
              : "bg-transparent border-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

function NumPad({
  onDigit,
  onBackspace,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
}) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] mx-auto">
      {digits.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onDigit(d)}
          className="ripple-container h-14 rounded-2xl text-xl font-bold text-foreground bg-muted/50 border border-border/40 hover:bg-muted/80 active:scale-95 transition-all select-none"
          data-ocid="pin.button"
        >
          {d}
        </button>
      ))}
      {/* Bottom row: empty | 0 | backspace */}
      <div />
      <button
        type="button"
        onClick={() => onDigit("0")}
        className="ripple-container h-14 rounded-2xl text-xl font-bold text-foreground bg-muted/50 border border-border/40 hover:bg-muted/80 active:scale-95 transition-all select-none"
        data-ocid="pin.button"
      >
        0
      </button>
      <button
        type="button"
        onClick={onBackspace}
        className="ripple-container h-14 rounded-2xl flex items-center justify-center text-muted-foreground bg-muted/50 border border-border/40 hover:bg-muted/80 active:scale-95 transition-all select-none"
        data-ocid="pin.button"
      >
        <Delete className="w-5 h-5" />
      </button>
    </div>
  );
}

function PinModal({
  hasPin,
  onClose,
  onSaved,
}: {
  hasPin: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<PinFlowStep>(
    hasPin ? "change-current" : "set-enter",
  );
  const [current, setCurrent] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    };
  }, []);

  function triggerShake(msg: string) {
    setError(msg);
    setShake(true);
    shakeTimerRef.current = setTimeout(() => setShake(false), 500);
  }

  // Which digit string is "active" right now
  function activePin(): string {
    if (step === "set-enter" || step === "change-current") return current;
    if (step === "set-confirm" || step === "change-confirm") return confirm;
    return newPin;
  }

  function setActivePin(val: string) {
    if (step === "set-enter" || step === "change-current") setCurrent(val);
    else if (step === "set-confirm" || step === "change-confirm")
      setConfirm(val);
    else setNewPin(val);
  }

  function handleDigit(d: string) {
    const cur = activePin();
    if (cur.length >= 4) return;
    const next = cur + d;
    setActivePin(next);
    if (next.length === 4) {
      // slight delay so last dot fill is visible
      setTimeout(() => advance(next), 180);
    }
  }

  function handleBackspace() {
    const cur = activePin();
    setActivePin(cur.slice(0, -1));
    setError("");
  }

  function advance(pin: string) {
    setError("");
    const stored = localStorage.getItem("security_pin") ?? "";

    switch (step) {
      case "set-enter":
        setStep("set-confirm");
        break;

      case "set-confirm":
        if (pin !== current) {
          triggerShake("PINs do not match. Try again.");
          setConfirm("");
          setCurrent("");
          setStep("set-enter");
        } else {
          localStorage.setItem("security_pin", pin);
          setSuccess(true);
          setTimeout(() => {
            onSaved();
            onClose();
          }, 1200);
        }
        break;

      case "change-current":
        if (pin !== stored) {
          triggerShake("Incorrect PIN. Try again.");
          setCurrent("");
        } else {
          setStep("change-new");
        }
        break;

      case "change-new":
        setStep("change-confirm");
        break;

      case "change-confirm":
        if (pin !== newPin) {
          triggerShake("PINs do not match. Try again.");
          setConfirm("");
          setNewPin("");
          setStep("change-new");
        } else {
          localStorage.setItem("security_pin", pin);
          setSuccess(true);
          setTimeout(() => {
            onSaved();
            onClose();
          }, 1200);
        }
        break;
    }
  }

  const title = PIN_STEP_LABELS[step];
  const dots = activePin().length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(4px)" }}
      data-ocid="pin.modal"
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-3xl p-6 flex flex-col items-center animate-scale-in"
        style={{
          background: "linear-gradient(160deg, #111827 0%, #0d1328 100%)",
          border: "1px solid rgba(123,92,255,0.25)",
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(123,92,255,0.1)",
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          data-ocid="pin.close_button"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
          style={{
            background:
              "linear-gradient(135deg, rgba(79,166,255,0.2) 0%, rgba(123,92,255,0.2) 100%)",
            border: "1px solid rgba(123,92,255,0.3)",
          }}
        >
          <Lock className="w-6 h-6 text-violet-400" />
        </div>

        <h3 className="text-lg font-extrabold text-white mt-1">{title}</h3>

        {/* Step indicator */}
        {hasPin && (
          <div className="flex gap-1.5 mt-2">
            {(
              [
                "change-current",
                "change-new",
                "change-confirm",
              ] as PinFlowStep[]
            ).map((s, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static index
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-6 bg-violet-500"
                    : (
                          [
                            "change-current",
                            "change-new",
                            "change-confirm",
                          ].indexOf(step) > i
                        )
                      ? "w-3 bg-violet-500/60"
                      : "w-3 bg-muted/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Dots */}
        <div
          style={{
            animation: shake
              ? "pinShake 0.45s cubic-bezier(.36,.07,.19,.97) both"
              : "none",
          }}
        >
          <PinDots count={dots} />
        </div>

        {/* Error */}
        {error ? (
          <p
            className="text-xs text-red-400 font-medium text-center mb-3 min-h-[1rem]"
            data-ocid="pin.error_state"
          >
            {error}
          </p>
        ) : (
          <div className="mb-3 min-h-[1rem]" />
        )}

        {/* Success */}
        {success && (
          <div
            className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center z-10"
            style={{ background: "rgba(13,19,40,0.97)" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 8px 32px rgba(16,185,129,0.5)",
                animation:
                  "successPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                role="img"
                aria-label="Success checkmark"
              >
                <path
                  d="M7 16l6 6 12-12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="60"
                  strokeDashoffset="0"
                  style={{ animation: "checkDraw 0.4s 0.2s ease both" }}
                />
              </svg>
            </div>
            <p className="text-white font-bold text-base">
              {hasPin ? "PIN Updated!" : "PIN Set Successfully!"}
            </p>
          </div>
        )}

        {/* Numpad */}
        {!success && (
          <NumPad onDigit={handleDigit} onBackspace={handleBackspace} />
        )}

        {/* Cancel */}
        {!success && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="pin.cancel_button"
          >
            Cancel
          </button>
        )}
      </div>

      <style>{`
        @keyframes pinShake {
          10%, 90% { transform: translateX(-3px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function ProfileScreen({
  profile,
  userName,
  userEmail,
  theme,
  onToggleTheme,
  onNavigate,
  onLogout,
  onUpdateProfile,
}: Props) {
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [incomeVal, setIncomeVal] = useState("");
  const [fixedVal, setFixedVal] = useState("");
  const [goalVal, setGoalVal] = useState("");
  const [error, setError] = useState("");
  const ripple = useRipple();

  // PIN state
  const [hasPin, setHasPin] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  // Biometric state
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedPin = localStorage.getItem("security_pin");
    setHasPin(!!storedPin && storedPin.length === 4);

    const storedBio = localStorage.getItem("biometric_enabled");
    setBiometricEnabled(storedBio === "true");
  }, []);

  // ── PIN handlers ──
  function openPinModal() {
    setPinModalOpen(true);
  }
  function closePinModal() {
    setPinModalOpen(false);
  }
  function onPinSaved() {
    setHasPin(true);
  }

  // ── Biometric handlers ──
  async function handleBiometricToggle(checked: boolean) {
    setBiometricError("");

    if (!checked) {
      // Turning off
      setBiometricEnabled(false);
      localStorage.setItem("biometric_enabled", "false");
      return;
    }

    // Turning on — check WebAuthn availability
    if (typeof window.PublicKeyCredential === "undefined") {
      setBiometricError(
        "Biometric authentication is not supported on this device or browser.",
      );
      return;
    }

    try {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setBiometricError("No biometric sensor detected on this device.");
        return;
      }
      // Available — enable
      setBiometricEnabled(true);
      localStorage.setItem("biometric_enabled", "true");
      setBiometricError("");
    } catch {
      setBiometricError(
        "Could not verify biometric support. Please try again.",
      );
    }
  }

  // ── Profile editing ──
  function openEdit() {
    setIncomeVal(String(profile.monthlyIncome));
    setFixedVal(String(profile.fixedExpenses));
    setGoalVal(String(profile.savingsGoal));
    setError("");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setError("");
  }

  function saveEdit() {
    const income = Number.parseFloat(incomeVal);
    const fixed = Number.parseFloat(fixedVal);
    const goal = Number.parseFloat(goalVal);

    if (Number.isNaN(income) || income <= 0) {
      setError("Monthly income must be a positive number.");
      return;
    }
    if (Number.isNaN(fixed) || fixed < 0) {
      setError("Fixed expenses must be 0 or more.");
      return;
    }
    if (fixed >= income) {
      setError("Fixed expenses must be less than monthly income.");
      return;
    }
    if (Number.isNaN(goal) || goal <= 0) {
      setError("Savings goal must be a positive number.");
      return;
    }

    onUpdateProfile({
      ...profile,
      monthlyIncome: income,
      fixedExpenses: fixed,
      savingsGoal: goal,
    });
    setIsEditing(false);
    setError("");
  }

  return (
    <>
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
                  background:
                    "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
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

        {/* ── Edit Financial Profile ── */}
        <div
          className="glass-card overflow-hidden animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Financial Profile
            </p>
            {!isEditing && (
              <button
                type="button"
                onMouseDown={ripple}
                onTouchStart={ripple}
                onClick={openEdit}
                className="ripple-container flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(79,166,255,0.18) 0%, rgba(123,92,255,0.18) 100%)",
                  color: "#7B5CFF",
                  border: "1px solid rgba(123,92,255,0.25)",
                }}
                data-ocid="profile.edit_button"
              >
                <PencilLine className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {!isEditing ? (
            /* Read-only view */
            <div className="divide-y divide-border/40">
              {[
                {
                  label: "Monthly Income",
                  value: `₹${profile.monthlyIncome.toLocaleString("en-IN")}`,
                },
                {
                  label: "Fixed Expenses",
                  value: `₹${profile.fixedExpenses.toLocaleString("en-IN")}`,
                },
                {
                  label: "Savings Goal",
                  value: `₹${profile.savingsGoal.toLocaleString("en-IN")}`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-4 py-3.5"
                >
                  <span className="text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Inline edit form */
            <div className="px-4 py-4 flex flex-col gap-3">
              {/* Monthly Income */}
              <div>
                <label
                  htmlFor="profile-income"
                  className="text-xs font-medium text-muted-foreground mb-1.5 block"
                >
                  Monthly Income (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                    ₹
                  </span>
                  <input
                    id="profile-income"
                    type="number"
                    inputMode="numeric"
                    value={incomeVal}
                    onChange={(e) => setIncomeVal(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted/50 border border-border/50 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
                    placeholder="e.g. 50000"
                    data-ocid="profile.input"
                  />
                </div>
              </div>

              {/* Fixed Expenses */}
              <div>
                <label
                  htmlFor="profile-fixed"
                  className="text-xs font-medium text-muted-foreground mb-1.5 block"
                >
                  Fixed Expenses (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                    ₹
                  </span>
                  <input
                    id="profile-fixed"
                    type="number"
                    inputMode="numeric"
                    value={fixedVal}
                    onChange={(e) => setFixedVal(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted/50 border border-border/50 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
                    placeholder="e.g. 15000"
                    data-ocid="profile.input"
                  />
                </div>
              </div>

              {/* Savings Goal */}
              <div>
                <label
                  htmlFor="profile-goal"
                  className="text-xs font-medium text-muted-foreground mb-1.5 block"
                >
                  Savings Goal (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                    ₹
                  </span>
                  <input
                    id="profile-goal"
                    type="number"
                    inputMode="numeric"
                    value={goalVal}
                    onChange={(e) => setGoalVal(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-medium text-foreground bg-muted/50 border border-border/50 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all"
                    placeholder="e.g. 100000"
                    data-ocid="profile.input"
                  />
                </div>
              </div>

              {/* Validation error */}
              {error && (
                <p
                  className="text-xs text-red-400 font-medium px-1"
                  data-ocid="profile.error_state"
                >
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onMouseDown={ripple}
                  onTouchStart={ripple}
                  onClick={saveEdit}
                  className="ripple-container flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.97]"
                  style={{
                    background:
                      "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
                    boxShadow: "0 4px 16px rgba(123,92,255,0.35)",
                  }}
                  data-ocid="profile.save_button"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  data-ocid="profile.cancel_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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
            description={
              theme === "dark" ? "Currently dark" : "Currently light"
            }
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

        {/* ── Security Settings ── */}
        <div
          className="glass-card overflow-hidden animate-fade-up"
          style={{ animationDelay: "180ms" }}
        >
          <div className="px-4 py-3 border-b border-border/40">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Security
            </p>
          </div>

          {/* PIN Security row */}
          <SettingsRow
            icon={<Lock className="w-4 h-4" />}
            label="PIN Security"
            description={
              hasPin ? "PIN is set  •  Tap to change" : "Set a 4-digit PIN"
            }
            right={
              <div className="flex items-center gap-2">
                {hasPin && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-emerald-400"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    Active
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            }
            onClick={openPinModal}
            ocid="profile.button"
          />

          <div className="h-px bg-border/40 mx-4" />

          {/* Biometrics row */}
          <div>
            <SettingsRow
              icon={<Fingerprint className="w-4 h-4" />}
              label="Biometrics"
              description={
                biometricEnabled
                  ? "Enabled  •  Fingerprint / Face ID"
                  : "Fingerprint / Face ID"
              }
              right={
                <Switch
                  checked={biometricEnabled}
                  onCheckedChange={handleBiometricToggle}
                  data-ocid="profile.switch"
                />
              }
            />
            {biometricError && (
              <div
                className="mx-4 mb-3 px-3 py-2 rounded-xl text-xs text-red-400 font-medium flex items-start gap-2"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
                data-ocid="profile.error_state"
              >
                <Fingerprint className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-70" />
                <span>{biometricError}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── App Settings ── */}
        <div
          className="glass-card overflow-hidden animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          <div className="px-4 py-3 border-b border-border/40">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Settings
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
          style={{ animationDelay: "260ms" }}
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
            right={
              <span className="text-xs text-muted-foreground">Latest</span>
            }
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
          style={{ animationDelay: "320ms" }}
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

      {/* ── PIN Modal Overlay ── */}
      {pinModalOpen && (
        <PinModal
          hasPin={hasPin}
          onClose={closePinModal}
          onSaved={onPinSaved}
        />
      )}
    </>
  );
}
