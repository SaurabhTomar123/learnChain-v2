import { motion } from "framer-motion";
import { X, ChevronRight, Home, TrendingUp, Users, Layers } from "lucide-react";
import { useLocation } from "wouter";

interface SidebarItem {
  id: string;
  title: string;
  role: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Trending", icon: TrendingUp, href: "/#specialized-tracks" },
  { label: "Community", icon: Users, href: "/#community" },
];

function SidebarContent({
  items,
  activeId,
  onSelect,
  onClose,
}: {
  items: SidebarItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  onClose?: () => void;
}) {
  const [location, navigate] = useLocation();

  return (
    <>
      {/* Logo */}
      <div className="p-8 flex items-center justify-between shrink-0">
        <button
          onClick={() => { navigate("/"); onClose?.(); }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 bg-[#1a7f4b] rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: "1px", opacity: 0.9 }}
            className="text-xl text-gray-900"
          >
            LearnChain
          </span>
        </button>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-6 overflow-y-auto custom-scrollbar space-y-8 pb-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Navigation</p>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
              const isActive = href === "/" ? location === "/" : false;
              return (
                <li key={label}>
                  <button
                    onClick={() => {
                      if (href.startsWith("/#")) {
                        const id = href.split("#")[1];
                        if (location === "/") {
                          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                        } else {
                          navigate("/");
                        }
                      } else {
                        navigate(href);
                      }
                      onClose?.();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#1a7f4b] bg-green-50"
                        : "text-gray-500 hover:text-[#1a7f4b] hover:bg-green-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Popular Paths</p>
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => { onSelect(item.id); onClose?.(); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors group ${
                    activeId === item.id
                      ? "text-[#1a7f4b] bg-green-50 font-semibold"
                      : "text-gray-500 hover:text-[#1a7f4b] hover:bg-green-50"
                  }`}
                >
                  <span className="truncate">{item.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                    activeId === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Weekly digest card */}
      <div className="p-6 border-t border-gray-100 shrink-0">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-600 mb-1">Weekly Digest</p>
          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            Get latest market salaries & roadmap updates.
          </p>
          <button className="w-full py-2 bg-white border border-gray-200 text-xs font-bold rounded-lg hover:border-[#1a7f4b] hover:text-[#1a7f4b] transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ items, activeId, onSelect, isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop: always-visible sticky sidebar ── */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-0 h-screen border-r border-gray-100 bg-white overflow-hidden">
        <SidebarContent items={items} activeId={activeId} onSelect={onSelect} />
      </aside>

      {/* ── Mobile: animated overlay ── */}
      <div className="lg:hidden">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}
        <motion.div
          initial={{ x: -288 }}
          animate={{ x: isOpen ? 0 : -288 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 z-50 flex flex-col"
        >
          <SidebarContent items={items} activeId={activeId} onSelect={onSelect} onClose={onClose} />
        </motion.div>
      </div>
    </>
  );
}
