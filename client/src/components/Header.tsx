import { useState, useRef, useEffect } from "react";
import { Menu, Search, X, Layers, LogOut, User, LayoutDashboard } from "lucide-react";
import { useLocation } from "wouter";
import { SearchDropdown } from "@/components/SearchModal";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface HeaderProps {
  onMenuToggle: (open: boolean) => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, signOut, openAuthModal } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleQueryChange(q: string) {
    setQuery(q);
    setSearchOpen(q.length > 0);
  }

  function clearSearch() {
    setQuery("");
    setSearchOpen(false);
    inputRef.current?.focus();
  }

  function closeMobileSearch() {
    setMobileSearchOpen(false);
    setQuery("");
    setSearchOpen(false);
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:px-8 py-3.5">
      {/* Mobile: hamburger + logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={() => onMenuToggle(true)}
          aria-label="Open navigation"
          className="h-11 w-11 -ml-2 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40 rounded-xl"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1a7f4b] rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span
            className="font-light tracking-widest text-lg text-gray-900"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em" }}
          >
            LearnChain
          </span>
        </button>
      </div>

      {/* Desktop: search */}
      <div ref={searchRef} className="hidden lg:block relative w-80 xl:w-105">
        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2.5 border border-transparent focus-within:border-[#1a7f4b]/30 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query && setSearchOpen(true)}
            placeholder="Search roadmaps, companies, skills…"
            aria-label="Search roadmaps"
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-gray-400 text-gray-900"
          />
          {query && (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              className="ml-1 h-8 w-8 inline-flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors rounded-full focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/30"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <SearchDropdown
          isOpen={searchOpen}
          query={query}
          onQueryChange={handleQueryChange}
          onClose={() => { setSearchOpen(false); setQuery(""); }}
        />
      </div>

      {/* Desktop: auth actions */}
      <div className="hidden lg:flex items-center gap-3">
        {user ? (
          <>
            {/* XP / streak chips */}
            {profileLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-10 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ) : profile ? (
              <div className="flex items-center gap-2">
                {profile.current_streak > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                    🔥 {profile.current_streak}
                  </span>
                )}
                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  Lv.{profile.level} · {profile.xp.toLocaleString()} XP
                </span>
              </div>
            ) : null}

            {/* Logged-in avatar + dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#1a7f4b] flex items-center justify-center text-white text-xs font-black shrink-0">
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {displayName}
                </span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { navigate("/profile"); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { navigate("/dashboard"); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <div className="border-t border-gray-50 mt-1" />
                  <button
                    onClick={() => { signOut(); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={openAuthModal}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors tracking-wide"
            >
              Sign In
            </button>
            <button
              onClick={openAuthModal}
              className="bg-[#1a7f4b] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:bg-[#15653d] transition-colors"
            >
              Join for free
            </button>
          </>
        )}
      </div>

      {/* Mobile: CTA / avatar */}
      <div className="lg:hidden flex items-center gap-2">
        <button
          onClick={() => { setMobileSearchOpen(true); setSearchOpen(false); }}
          aria-label="Open search"
          className="h-11 w-11 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40"
        >
          <Search className="w-4 h-4" />
        </button>
        {user ? (
          <button
            onClick={() => navigate("/profile")}
            aria-label="My profile"
            className="h-11 flex items-center gap-1.5 px-3 rounded-full border border-gray-200 text-xs font-medium text-gray-600"
          >
            <div className="w-5 h-5 rounded-full bg-[#1a7f4b] flex items-center justify-center text-white text-[9px] font-black shrink-0">
              {initials}
            </div>
            <User className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={openAuthModal}
            className="h-11 bg-[#1a7f4b] text-white px-4 rounded-full text-xs font-bold hover:bg-[#15653d] transition-colors focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40"
          >
            Join free
          </button>
        )}
      </div>

      {mobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1" ref={searchRef}>
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-3 border border-gray-200 focus-within:border-[#1a7f4b]/40">
                <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => { handleQueryChange(e.target.value); setSearchOpen(true); }}
                  placeholder="Search roadmaps, companies, skills..."
                  aria-label="Search roadmaps"
                  aria-expanded={searchOpen}
                  className="bg-transparent border-none text-base w-full outline-none placeholder:text-gray-500 text-gray-900"
                />
              </div>
              <SearchDropdown
                isOpen={searchOpen}
                query={query}
                onQueryChange={handleQueryChange}
                onClose={closeMobileSearch}
              />
            </div>
            <button
              onClick={closeMobileSearch}
              aria-label="Close search"
              className="h-11 w-11 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[#1a7f4b]/40"
            >
              <X className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
