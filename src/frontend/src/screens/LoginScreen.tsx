import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Wallet } from "lucide-react";
import { useState } from "react";
import { SiGoogle } from "react-icons/si";

interface Props {
  onComplete: (name: string, email: string) => void;
}

export default function LoginScreen({ onComplete }: Props) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    setError("");
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    onComplete(name.trim() || email.split("@")[0], email.trim());
  }

  function handleGoogle() {
    onComplete("Google User", "user@google.com");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{
        background:
          "linear-gradient(135deg, #D7E6FF 0%, #E9D9FF 50%, #D7F6EE 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-40 blur-3xl pointer-events-none"
        style={{ background: "#4FA6FF", transform: "translate(-40%, -40%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "#7B5CFF", transform: "translate(40%, 40%)" }}
      />
      <div
        className="absolute bottom-1/3 left-0 w-40 h-40 rounded-full opacity-25 blur-2xl pointer-events-none"
        style={{ background: "#2EE59D" }}
      />

      {/* Card */}
      <div
        className="w-full max-w-sm animate-scale-in"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "24px",
          padding: "28px 24px",
          boxShadow: "0 20px 60px rgba(79, 50, 200, 0.15)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
              boxShadow: "0 8px 24px rgba(123, 92, 255, 0.4)",
            }}
          >
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {tab === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tab === "signin"
              ? "Sign in to manage your finances"
              : "Start your financial journey"}
          </p>
        </div>

        {/* Tab toggle */}
        <div
          className="flex rounded-xl p-1 mb-5"
          style={{ background: "rgba(123,92,255,0.08)" }}
          data-ocid="login.tab"
        >
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? "text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={
                tab === t
                  ? {
                      background:
                        "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
                    }
                  : {}
              }
              data-ocid={`login.${t}.tab`}
            >
              {t === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          {tab === "signup" && (
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Full Name
              </Label>
              <Input
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKey}
                className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl"
                data-ocid="login.input"
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Email Address
            </Label>
            <Input
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKey}
              className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl"
              data-ocid="login.input"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Password
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
              className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl"
              data-ocid="login.input"
            />
          </div>

          {tab === "signup" && (
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Mobile Number
              </Label>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="+91 98765 43210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onKeyDown={handleKey}
                className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl"
                data-ocid="login.input"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p
            className="text-red-500 text-xs mt-2"
            data-ocid="login.error_state"
          >
            {error}
          </p>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl font-bold text-white mt-4 transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #4FA6FF 0%, #7B5CFF 100%)",
            boxShadow: "0 6px 24px rgba(123, 92, 255, 0.35)",
          }}
          data-ocid="login.submit_button"
        >
          {tab === "signin" ? "Sign In" : "Create Account"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">
            or continue with
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google login */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
          data-ocid="login.secondary_button"
        >
          <SiGoogle className="w-4 h-4" style={{ color: "#4285F4" }} />
          Continue with Google
        </button>
      </div>

      {/* Bottom tagline */}
      <div className="mt-6 flex items-center gap-1.5 opacity-70">
        <Sparkles className="w-3.5 h-3.5 text-violet-500" />
        <p className="text-xs text-gray-600 font-medium">
          AI-powered financial intelligence
        </p>
      </div>
    </div>
  );
}
