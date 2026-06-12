import { AlertCircle, Eye, EyeOff, Key, Lock } from "lucide-react";
import { useState } from "react";

declare global {
  interface ImportMetaEnv {
    readonly VITE_FLASK_APP_API_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
}

export default function AdminLoginPage({
  onLoginSuccess,
}: AdminLoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const normalizedUser = username.trim().toLowerCase();
    const normalizedPass = password.trim();

    // Send POST request to Flask server
    try {
      const response = await fetch(
        `${import.meta.env.VITE_FLASK_APP_API_URL}/admin/login`, // ! Changed to hardcoded url
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: normalizedUser,
            password: normalizedPass,
          }),
        },
      );

      if (response.ok) {
        onLoginSuccess();
      } else {
        const data = await response.json();
        setError(
          data.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Decorative branding header */}
      <div className="bg-slate-900 px-6 py-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand/10 border border-brand/35 flex items-center justify-center text-brand/65 mb-3 mt-1 shadow-inner">
          <Lock className="w-5 h-5 text-brand" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">
          Admin Access Portal
        </h2>
        <p className="text-[11px] text-zinc-400 font-mono mt-1">
          Authorized administration &amp; inventory management
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Core Instructions */}
        <div className="text-center space-y-1.5">
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-sans">
            Sign in with your credentials to manage vehicle listings, track
            inventory changes, and monitor system activity.
          </p>
        </div>

        {/* Form container */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Error notice */}
          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-150 p-3 rounded-lg text-rose-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed font-sans">
                {error}
              </p>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 tracking-wide block font-sans">
              Username
            </label>
            <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 focus-within:ring-1 focus-within:ring-brand/30 focus-within:border-brand">
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white"
                id="admin_username"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Passcode Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-705 tracking-wide block font-sans">
              Password
            </label>
            <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 focus-within:ring-1 focus-within:ring-brand/30 focus-within:border-brand flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={isSubmitting}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-white px-3.5 py-2.5 text-sm text-slate-805 placeholder-slate-400 focus:outline-none"
                id="admin_password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand hover:bg-brand-dark text-white rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all shadow-xs border border-brand-dark focus:outline-none ${
              isSubmitting ? "opacity-80 cursor-wait" : ""
            }`}
            id="admin_login_submit">
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Logging In...</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-brand/10" />
                <span>Login</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
