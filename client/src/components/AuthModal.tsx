import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Mail, Lock, User, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "signin" | "signup";

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reset = () => {
    setEmail(""); setPassword(""); setName(""); setDob("");
    setSubscribed(false); setError(null); setMessage(null);
  };

  const switchTab = (t: Tab) => { setTab(t); reset(); };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else { reset(); onClose(); }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        email,
        dob: dob || null,
        subscribed,
      });
    }
    setMessage("Check your email for a confirmation link, then sign in.");
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const inputClass =
    "w-full py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1a7f4b]/20 focus:border-[#1a7f4b] outline-none transition-all";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    {tab === "signin" ? "Welcome back" : "Join LearnChain"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {tab === "signin"
                      ? "Sign in to comment and track your path"
                      : "Free forever. No credit card needed."}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex mx-6 mt-5 bg-gray-100 rounded-xl p-1">
                {(["signin", "signup"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {t === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              <div className="px-6 pb-6 pt-4">
                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 mb-4 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                    <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.5 1 24 1 14.6 1 6.7 6.8 3.3 15l7 5.4C12 14.5 17.5 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.6-4.8 7.3l7.5 5.8c4.3-4 6.1-9.9 6.1-17.6z"/>
                    <path fill="#FBBC05" d="M10.3 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L3.3 14C1.2 18 0 22.4 0 27s1.2 9 3.3 12.8l7-5.2z"/>
                    <path fill="#34A853" d="M24 47c5.4 0 10-1.8 13.4-4.9l-7.5-5.8c-1.9 1.3-4.3 2-5.9 2-6.5 0-12-5-13.7-11.7l-7 5.2C6.7 41.2 14.6 47 24 47z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">or with email</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {error && (
                  <p className="text-red-500 text-xs mb-3 px-1 py-2 bg-red-50 rounded-lg">{error}</p>
                )}
                {message && (
                  <p className="text-green-700 text-xs mb-3 px-1 py-2 bg-green-50 rounded-lg">{message}</p>
                )}

                {tab === "signin" ? (
                  <form onSubmit={handleSignIn} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="email" required value={email} placeholder="Email address"
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputClass} pl-10 pr-4`}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"} required value={password} placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pl-10 pr-10`}
                      />
                      <button
                        type="button" onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="submit" disabled={loading}
                      className="w-full bg-[#1a7f4b] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#15653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Signing in…" : "Sign In"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text" required value={name} placeholder="Full name"
                        onChange={(e) => setName(e.target.value)}
                        className={`${inputClass} pl-10 pr-4`}
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="date" value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={`${inputClass} pl-10 pr-4 text-gray-600`}
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="email" required value={email} placeholder="Email address"
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${inputClass} pl-10 pr-4`}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"} required minLength={6}
                        value={password} placeholder="Password (min 6 characters)"
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputClass} pl-10 pr-10`}
                      />
                      <button
                        type="button" onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox" checked={subscribed}
                        onChange={(e) => setSubscribed(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#1a7f4b] shrink-0"
                      />
                      <span className="text-xs text-gray-500 leading-relaxed">
                        Send me new pathways and career updates every week
                      </span>
                    </label>
                    <button
                      type="submit" disabled={loading}
                      className="w-full bg-[#1a7f4b] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#15653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creating account…" : "Create Account"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
