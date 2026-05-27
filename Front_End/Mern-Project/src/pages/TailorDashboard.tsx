import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scissors, Star, Users, TrendingUp, Award
} from "lucide-react";
import Navbar from "./Navbar";

/* ─── Types ─── */
interface UserData {
  utype?: string;
  emailid?: string;
  [key: string]: any; 
}

/* ─── Mock data ─── */
const STATS = [
  { label: "Total Orders", value: "128", icon: <Scissors size={20} />, delta: "+12 this month" },
  { label: "Rating", value: "4.8", icon: <Star size={20} />, delta: "42 reviews" },
  { label: "Clients Served", value: "94", icon: <Users size={20} />, delta: "+5 this week" },
  { label: "Revenue", value: "₹ 82k", icon: <TrendingUp size={20} />, delta: "↑ 18% vs last month" },
];

const ORDERS = [
  { id: "ORD-001", client: "Priya Sharma", item: "Bridal Lehenga", status: "In Progress", due: "28 Mar" },
  { id: "ORD-002", client: "Rohan Mehta", item: "3-Piece Suit", status: "Pending", due: "02 Apr" },
  { id: "ORD-003", client: "Aisha Khan", item: "Anarkali Set", status: "Completed", due: "20 Mar" },
  { id: "ORD-004", client: "Vikram Singh", item: "Sherwani", status: "In Progress", due: "05 Apr" },
];

const REVIEWS = [
  { name: "Priya S.", stars: 5, text: "Absolutely stunning work.", avatar: "P" },
  { name: "Aisha K.", stars: 5, text: "Perfect fit and early delivery.", avatar: "A" },
  { name: "Rohan M.", stars: 4, text: "Very professional.", avatar: "R" },
];

const statusColor: Record<string, string> = {
  "In Progress": "#C6A75E",
  "Pending": "#B08642",
  "Completed": "#5E8C6A",
};

export default function TailorDashboard() {
  const navigate = useNavigate();

  const user = useMemo<UserData | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user || user.utype !== "Tailor") {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#F5EDD8]">
      <Navbar />

      <main className="pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto">

        {/* HERO */}
        <div className="mb-10 flex justify-between flex-wrap gap-4 items-center">
          <div>
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="text-gray-600">{user?.emailid || "Guest"}</p>
          </div>
          <div className="px-4 py-2 bg-yellow-200 rounded-full flex items-center gap-2 font-medium">
            <Award size={16} /> Master Craftsman
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STATS.map((s, i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center gap-2 text-yellow-600 font-medium mb-2">
                {s.icon} {s.label}
              </div>
              <h2 className="text-2xl font-bold">{s.value}</h2>
              <p className="text-xs text-gray-500 mt-1">{s.delta}</p>
            </div>
          ))}
        </div>

        {/* ORDERS */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Orders</h2>

          {ORDERS.map((o) => (
            <div key={o.id} className="flex justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-semibold">{o.client}</p>
                <p className="text-sm text-gray-500">{o.item}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span
                  className="px-2 py-1 text-xs text-white rounded font-medium"
                  style={{ background: statusColor[o.status] || "#999" }}
                >
                  {o.status}
                </span>
                <p className="text-xs text-gray-500">{o.due}</p>
              </div>
            </div>
          ))}
        </div>

        {/* REVIEWS */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>

          {REVIEWS.map((r, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <p className="font-semibold">{r.name}</p>
              <div className="flex gap-1 my-1 text-yellow-500">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-gray-600">{r.text}</p>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Update Profile", path: "/tailor-profile" },
              { label: "View Reviews", path: "/reviews" },
            ].map((a) => (
              <div
                key={a.label}
                onClick={() => navigate(a.path)}
                className="cursor-pointer p-4 bg-yellow-100 rounded text-center font-medium hover:scale-105 transition-transform"
              >
                {a.label}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}