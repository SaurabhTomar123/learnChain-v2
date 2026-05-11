import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { X, Eye, EyeOff, Mail, Lock, User, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    setEmail("");
    setPassword("");
    setName("");
    setDob("");
    setSubscribed(false);
    setError(null);
    setMessage(null);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    reset();
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    else {
      reset();
      onClose();
    }
    setLoading(false);
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        full_name: name,
        email,
        dob: dob || null,
        subscribed,
      });
      if (profileError) {
        // The auth trigger also creates profiles. With email confirmation on,
        // client-side RLS may block this write before a session exists.
        console.info("Profile upsert deferred to auth trigger", profileError.message);
      }
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
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden gap-0" showCloseButton={false}>
        <DialogHeader className="flex-row items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100 text-left">
          <div>
            <DialogTitle className="text-xl font-black text-gray-900">
              {tab === "signin" ? "Welcome back" : "Join LearnChain"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              {tab === "signin"
                ? "Sign in to comment and track your path"
                : "Free forever. No credit card needed."}
            </DialogDescription>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="h-10 w-10 inline-flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="flex mx-6 mt-5 bg-gray-100 rounded-xl p-1" role="tablist" aria-label="Authentication mode">
          {(["signin", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => switchTab(t)}
              className={`min-h-11 flex-1 py-2 rounded-lg text-sm font-semibold transition-all focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30 ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="min-h-11 w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 mb-4 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.5 1 24 1 14.6 1 6.7 6.8 3.3 15l7 5.4C12 14.5 17.5 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.6-4.8 7.3l7.5 5.8c4.3-4 6.1-9.9 6.1-17.6z"/>
              <path fill="#FBBC05" d="M10.3 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L3.3 14C1.2 18 0 22.4 0 27s1.2 9 3.3 12.8l7-5.2z"/>
              <path fill="#34A853" d="M24 47c5.4 0 10-1.8 13.4-4.9l-7.5-5.8c-1.9 1.3-4.3 2-5.9 2-6.5 0-12-5-13.7-11.7l-7 5.2C6.7 41.2 14.6 47 24 47z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-500 font-medium">or with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {error && <p role="alert" className="text-red-600 text-xs mb-3 px-3 py-2 bg-red-50 rounded-lg">{error}</p>}
          {message && <p role="status" className="text-green-700 text-xs mb-3 px-3 py-2 bg-green-50 rounded-lg">{message}</p>}

          {tab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-3">
              <InputWithIcon
                id="signin-email"
                label="Email address"
                icon={<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
                input={<input id="signin-email" type="email" required value={email} autoComplete="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10 pr-4`} />}
              />
              <PasswordInput
                id="signin-password"
                label="Password"
                value={password}
                setValue={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                inputClass={inputClass}
                autoComplete="current-password"
              />
              <SubmitButton loading={loading} label="Sign In" loadingLabel="Signing in..." />
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3">
              <InputWithIcon
                id="signup-name"
                label="Full name"
                icon={<User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
                input={<input id="signup-name" type="text" required value={name} autoComplete="name" placeholder="Your name" onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-10 pr-4`} />}
              />
              <InputWithIcon
                id="signup-dob"
                label="Date of birth"
                icon={<Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
                input={<input id="signup-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={`${inputClass} pl-10 pr-4 text-gray-700`} />}
              />
              <InputWithIcon
                id="signup-email"
                label="Email address"
                icon={<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
                input={<input id="signup-email" type="email" required value={email} autoComplete="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-10 pr-4`} />}
              />
              <PasswordInput
                id="signup-password"
                label="Password"
                value={password}
                setValue={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                inputClass={inputClass}
                autoComplete="new-password"
                minLength={6}
              />
              <label className="flex items-start gap-3 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  checked={subscribed}
                  onChange={(e) => setSubscribed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#1a7f4b] shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Send me new pathways and career updates every week
                </span>
              </label>
              <SubmitButton loading={loading} label="Create Account" loadingLabel="Creating account..." />
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InputWithIcon({ id, label, icon, input }: { id: string; label: string; icon: ReactNode; input: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="relative">
        {icon}
        {input}
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  setValue,
  showPassword,
  setShowPassword,
  inputClass,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  setValue: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean | ((value: boolean) => boolean)) => void;
  inputClass: string;
  autoComplete: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          required
          minLength={minLength}
          value={value}
          autoComplete={autoComplete}
          placeholder={minLength ? "Minimum 6 characters" : "Password"}
          onChange={(e) => setValue(e.target.value)}
          className={`${inputClass} pl-10 pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 inline-flex items-center justify-center text-gray-500 hover:text-gray-800 rounded-lg focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="min-h-11 w-full bg-[#1a7f4b] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#15653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
