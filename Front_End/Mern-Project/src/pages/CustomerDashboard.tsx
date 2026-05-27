import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search, Star, Heart, Package, Clock,
  ChevronRight, MapPin, Scissors, Sparkles, User
} from "lucide-react";

import Navbar from "./Navbar";

/* ─── Mock data  ─── */
const MY_ORDERS = [
  { id: "ORD-019", tailor: "Razia Begum", item: "Salwar Kameez", status: "In Progress", due: "30 Mar", rating: null },
  { id: "ORD-015", tailor: "Suresh Tailors", item: "Formal Blazer", status: "Completed", due: "18 Mar", rating: 5 },
  { id: "ORD-022", tailor: "Meena Couture", item: "Lehenga Blouse", status: "Pending", due: "10 Apr", rating: null },
];

const TAILORS_NEARBY = [
  { name: "Razia Begum", specialty: "Bridal & Ethnic Wear", city: "Amritsar", rating: 4.9, reviews: 58 },
  { name: "Suresh Tailors", specialty: "Formal & Western", city: "Amritsar", rating: 4.7, reviews: 34 },
  { name: "Meena Couture", specialty: "Ladies Suits & Lehengas", city: "Amritsar", rating: 4.8, reviews: 47 },
];

const TIPS = [
  { icon: <Scissors size={20} />, title: "Share Measurements", desc: "Always share updated measurements for best fit results." },
  { icon: <Clock size={20} />, title: "Book Early", desc: "Wedding season bookings fill up 2–3 months in advance." },
  { icon: <Heart size={20} />, title: "Save References", desc: "Bring photos or fabric swatches to inspire your tailor." },
];

// FIX 1: Restored Type Record to prevent TS indexing errors
const statusColor: Record<string, string> = {
  "In Progress": "#C6A75E",
  "Pending": "#B08642",
  "Completed": "#5E8C6A",
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  
  // Safe parsing to prevent infinite re-renders & SSR errors
  const user = useMemo(() => {
    try {
      if (typeof window === "undefined") return null;
      const userRaw = localStorage.getItem("user");
      return userRaw ? JSON.parse(userRaw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user || user.utype !== "Customer") navigate("/login");
  }, [user, navigate]);

  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen" style={{ background: "#F5EDD8", fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Playfair+Display:wght@400;700&display=swap');

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F5EDD8; }
        ::-webkit-scrollbar-thumb { background: #C6A75E; border-radius: 3px; }

        .glass-card {
          background: rgba(255,252,245,0.72);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(198,167,94,0.28);
          border-radius: 16px;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(198,167,94,0.4), transparent);
          margin: 1.25rem 0;
        }
        .tailor-card {
          background: rgba(255,252,245,0.85);
          border: 1px solid rgba(198,167,94,0.25);
          border-radius: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .tailor-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(168,132,60,0.15);
          border-color: rgba(198,167,94,0.6);
        }
      `}</style>

      <Navbar />

      <main className="pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto">

        {/* ── HERO BANNER ── */}
        <div
          className="relative mb-10 rounded-2xl overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: "linear-gradient(120deg, #2A1F0E 0%, #4A3520 60%, #6B4C2A 100%)",
          }}>

          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #C6A75E 0, #C6A75E 1px, transparent 0, transparent 50%)`,
              backgroundSize: "12px 12px",
            }} />

          <div className="relative z-10">
            <p className="text-[#C6A75E] tracking-[0.22em] text-xs uppercase mb-2">Your Bespoke Journey</p>
            <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(2.5rem,6vw,4rem)", color: "#FFF8EC", lineHeight: 1.1 }}>
              Good to see you
            </h1>
            <p className="text-[#D6C7A8] mt-1 text-base">{user?.emailid || "Guest"}</p>
          </div>

          <div className="relative z-10 flex gap-4">
            {[
              { label: "Orders", value: MY_ORDERS.length },
              { label: "Completed", value: MY_ORDERS.filter(o => o.status === "Completed").length },
              { label: "Saved Tailors", value: 3 },
            ].map((s) => (
              <div key={s.label} className="text-center px-5 py-4 rounded-xl"
                style={{ background: "rgba(198,167,94,0.15)", border: "1px solid rgba(198,167,94,0.25)" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#FFF8EC", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p className="text-[#C6A75E] text-xs mt-1 tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        <div className="mb-8 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8843C]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tailors by name, specialty or city…"
            className="w-full pl-11 pr-5 py-4 rounded-xl text-[#2A2A2A] outline-none"
            style={{
              background: "rgba(255,252,245,0.8)",
              border: "1px solid rgba(198,167,94,0.35)",
              backdropFilter: "blur(10px)",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1rem",
            }}
          />
        </div>

        {/* ── MAIN 2-COL ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* MY ORDERS */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2A2A2A" }}>
                My Orders
              </h2>
              <button className="flex items-center gap-1 text-[#A8843C] text-sm hover:gap-2 transition-all">
                All orders <ChevronRight size={14} />
              </button>
            </div>
            <div className="divider" />

            <div className="space-y-3">
              {MY_ORDERS.map((o) => (
                <div key={o.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[rgba(198,167,94,0.08)] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C6A75E] to-[#A8843C] flex items-center justify-center text-white">
                      <Scissors size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2A2A2A] text-sm">{o.item}</p>
                      <p className="text-xs text-[#8B7355]">by {o.tailor} · {o.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ background: statusColor[o.status] }}>
                      {o.status}
                    </span>
                    <p className="text-xs text-[#8B7355] mt-1 flex items-center gap-1 justify-end">
                      <Clock size={10} /> Due {o.due}
                    </p>
                    {o.rating && (
                      <div className="flex gap-0.5 mt-1 justify-end">
                        {/* Added safety fallback for null rating array mapping */}
                        {Array.from({ length: o.rating || 0 }).map((_, i) => (
                          <Star key={i} size={10} fill="#C6A75E" color="#C6A75E" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STYLE TIPS */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-[#A8843C]" />
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2A2A2A" }}>
                Atelier Tips
              </h2>
            </div>
            <div className="divider" />
            <div className="space-y-5">
              {TIPS.map((t) => (
                <div key={t.title} className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[#A8843C]"
                    style={{ background: "rgba(198,167,94,0.12)" }}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2A2A2A]">{t.title}</p>
                    <p className="text-xs text-[#6B5B3E] mt-0.5 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TAILORS NEARBY ── */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2A2A2A" }}>
              Tailors Near You
            </h2>
           
            <Link to="/find-tailor" className="flex items-center gap-1 text-[#A8843C] text-sm hover:gap-2 transition-all">
              Browse all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {TAILORS_NEARBY
              .filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || search === "")
              .map((t) => (
                <div key={t.name} className="tailor-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C6A75E] to-[#7A5C2E] flex items-center justify-center text-white font-bold text-lg"
                      style={{ fontFamily: "'Playfair Display', serif" }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2A2A2A]">{t.name}</p>
                      <p className="text-xs text-[#8B7355]">{t.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#6B5B3E] mb-3">
                    <MapPin size={12} className="text-[#A8843C]" /> {t.city}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={13} fill="#C6A75E" color="#C6A75E" />
                      <span className="font-semibold text-[#2A2A2A] text-sm">{t.rating}</span>
                      <span className="text-xs text-[#8B7355]">({t.reviews})</span>
                    </div>
                    <button
                      className="px-4 py-1.5 rounded-full text-xs text-white"
                      style={{ background: "linear-gradient(135deg, #C6A75E, #A8843C)" }}>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="mt-6 glass-card p-6">
          <h2 className="mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#2A2A2A" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Find Tailor",    to: "/find-tailor",        icon: <Search size={18} /> },
              { label: "My Profile",     to: "/customer-profile",   icon: <User size={18} /> },
              { label: "My Orders",      to: "#",                   icon: <Package size={18} /> },
              { label: "Review Tailor",  to: "/reviews",            icon: <Star size={18} /> },
            ].map((a) => (
            
              <Link key={a.label} to={a.to}
                className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-center hover:scale-105 transition-all"
                style={{ background: "rgba(198,167,94,0.08)", border: "1px solid rgba(198,167,94,0.2)", color: "#6B5B3E" }}>
                <span className="text-[#A8843C]">{a.icon}</span>
                <span className="text-xs font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}