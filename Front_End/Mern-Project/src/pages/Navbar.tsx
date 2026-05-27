import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Scissors, LogOut, User, LayoutDashboard, Star, Search } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const utype: string = user?.utype ?? "";

  function doLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  /* Links vary by role */
  const tailorLinks = [
    { label: "Dashboard", href: "/tailor-dashboard", icon: <LayoutDashboard size={16} /> },
    { label: "My Profile", href: "/tailor-profile", icon: <User size={16} /> },
    { label: "Reviews", href: "/reviews", icon: <Star size={16} /> },
  ];

  const customerLinks = [
    { label: "Dashboard", href: "/customer-dashboard", icon: <LayoutDashboard size={16} /> },
    { label: "My Profile", href: "/customer-profile", icon: <User size={16} /> },
    { label: "Find Tailor", href: "/find-tailor", icon: <Search size={16} /> },
  ];

  const links = utype === "Tailor" ? tailorLinks : customerLinks;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(255,252,245,0.72)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(198,167,94,0.25)",
          boxShadow: "0 2px 32px rgba(168,132,60,0.08)",
        }}
      >
        {/* LOGO */}
        <a href={utype === "Tailor" ? "/tailor-dashboard" : "/customer-dashboard"}
          className="flex items-center gap-2 no-underline">
          <Scissors size={22} className="text-[#A8843C]" strokeWidth={1.5} />
          <span
            style={{ fontFamily: "'Great Vibes', cursive", fontSize: "2rem", color: "#2A2A2A", lineHeight: 1 }}
          >
            The Atelier
          </span>
        </a>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="flex items-center gap-1.5 text-sm font-medium text-[#6B5B3E] hover:text-[#A8843C] transition-colors"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", letterSpacing: "0.04em" }}
            >
              {l.icon}
              {l.label}
            </a>
          ))}
        </div>

        {/* USER CHIP + LOGOUT */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: "rgba(198,167,94,0.12)", border: "1px solid rgba(198,167,94,0.35)" }}>
            <span className="w-6 h-6 rounded-full bg-[#C6A75E] flex items-center justify-center text-white text-xs font-bold">
              {user?.emailid?.[0]?.toUpperCase() ?? "U"}
            </span>
            <span className="text-sm text-[#4A3B2A]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {utype}
            </span>
          </div>

          <button
            onClick={doLogout}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #C6A75E, #A8843C)",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.95rem",
              letterSpacing: "0.04em",
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* MOBILE HAMBURGER */}
        <button className="md:hidden text-[#A8843C]" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[68px] left-0 right-0 z-40 md:hidden px-6 py-6 flex flex-col gap-4"
            style={{
              background: "rgba(255,252,245,0.96)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(198,167,94,0.2)",
            }}
          >
            {links.map((l) => (
              <a key={l.label} href={l.href}
                className="flex items-center gap-2 text-[#6B5B3E] text-lg"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {l.icon} {l.label}
              </a>
            ))}
            <button onClick={doLogout}
              className="flex items-center gap-2 text-[#A8843C] text-lg mt-2"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}