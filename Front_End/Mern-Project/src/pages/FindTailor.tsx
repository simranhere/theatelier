// ═══════════════════════════════════════════════════════════════════════════════
// FindTailor.tsx
// A React + TypeScript page that lets users search for tailors by city,
// category (Men/Women/Children/Both), and dress type (specialty).
// It fetches data from a Node.js/Express backend running at the-atelier-phi.vercel.app.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── React Hooks ───
// useState  → declares a reactive variable + its setter function
// useEffect → runs a side-effect (e.g. API call) after render when dependencies change
// useCallback → memoizes a function so it is NOT re-created on every render
import { useState, useEffect, useCallback } from "react";

// axios → third-party HTTP client; cleaner than fetch(), auto-parses JSON
import axios from "axios";

// motion       → wraps any HTML tag to add animations (fade, slide, scale, hover, tap)
// AnimatePresence → makes elements animate OUT (exit) when they are removed from the DOM
import { motion, AnimatePresence } from "framer-motion";


// ───────────────────────────────────────────────────────────────────────────────
// SECTION 1 — TYPE DEFINITIONS (TypeScript interfaces)
// These describe the exact shape of objects so TypeScript can catch typos/mistakes.
// ───────────────────────────────────────────────────────────────────────────────

// Describes one tailor document as it comes back from the MongoDB database.
// Every field is a string because MongoDB stores them that way here.
interface TailorCard {
  _id: string;        // MongoDB's auto-generated unique ID (e.g. "64abc123...")
  name: string;       // Tailor's full name
  specialty: string;  // What they stitch — e.g. "Coat", "Salwar Kameez"
  city: string;       // Tailor's home/registered city
  profilepic: string; // URL path to their profile photo
  worktype: string;   // "Shop" or "Freelance"
  shopCity: string;   // Only relevant when worktype === "Shop"
  since: string;      // Year they started — stored as string, e.g. "2005"
  contact: string;    // Phone number used in the tel: link
  social: string;     // Optional website or social media URL
}

// Describes the three filter values the user can fill in the sidebar form.
interface SearchForm {
  city: string;      // Free-text city name (also supports dropdown selection)
  category: string;  // One of: "Men" | "Women" | "Children" | "Both"
  specialty: string; // One of the dress types fetched from DB for the chosen category
}


// ───────────────────────────────────────────────────────────────────────────────
// SECTION 2 — CONSTANTS
// Defined once at the top so they are easy to change without hunting through code.
// ───────────────────────────────────────────────────────────────────────────────

// The four category radio-button options.
// value → what gets sent to the backend
// label → what the user sees
// icon  → decorative emoji shown beside the label
const CATEGORIES = [
  { value: "Men",      label: "Men",      icon: "👔" },
  { value: "Women",    label: "Women",    icon: "👗" },
  { value: "Children", label: "Children", icon: "🧒" },
  { value: "Both",     label: "Both",     icon: "👨‍👩‍👧" },
];

// Base URL for all API calls. Change this one string to point to production.
const BASE = "https://theatelier-wheat.vercel.app/tailor";

// How many tailor cards to show per page in the results grid.
const PAGE_SIZE = 6;


// ───────────────────────────────────────────────────────────────────────────────
// SECTION 3 — CityCombo COMPONENT
// A custom "combo box": a text input + animated dropdown.
// The user can type a city name OR pick one from the list fetched from the API.
// Props:
//   value    → the currently selected city (controlled from parent)
//   onChange → callback to notify the parent when the city changes
// ───────────────────────────────────────────────────────────────────────────────
function CityCombo({ value, onChange }: { value: string; onChange: (v: string) => void }) {

  // Full list of city strings fetched from GET /tailor/cities
  const [cities, setCities] = useState<string[]>([]);

  // Whether the dropdown suggestion list is currently visible
  const [open, setOpen] = useState(false);

  // The current text typed in the input box (may differ from the confirmed value)
  const [input, setInput] = useState(value);

  // ── On first mount: fetch all available cities from the backend ──
  // The empty array [] means this runs ONCE, like componentDidMount.
  useEffect(() => {
    axios.get(`${BASE}/cities`)
      .then((r) => {
        // r.data is the JSON response body
        // Only save cities if the backend replied with status: true
        if (r.data.status) setCities(r.data.cities);
      })
      .catch(() => {}); // Silently ignore network errors (cities list is non-critical)
  }, []); // ← empty dep array = run once on mount

  // ── Sync the input text box when the parent clears the value ──
  // e.g. when user clicks "Clear Filters", value becomes "" → reset the visible input too
  useEffect(() => {
    if (!value) setInput("");
  }, [value]); // runs whenever the `value` prop from parent changes

  // Compute a filtered subset of cities on every render.
  // Filters cities whose name contains what the user has typed so far (case-insensitive).
  const filtered = cities.filter((c) =>
    c.toLowerCase().includes(input.toLowerCase())
  );

  // Called when the user clicks a city in the dropdown list.
  // Updates: the visible input text, the parent's form state, and closes the dropdown.
  const select = (c: string) => {
    setInput(c);    // ← update the input box text
    onChange(c);    // ← bubble the selection up to the parent (updates form.city)
    setOpen(false); // ← hide the dropdown
  };

  return (
    // Outer div is position:relative so the dropdown can be absolutely positioned below it
    <div className="relative">

      {/* Input row — pin icon + text input + optional clear button */}
      <div className="relative">

        {/* 📍 pin icon — purely decorative, pointer-events-none so it doesn't block clicks */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8843C] text-sm pointer-events-none">📍</span>

        <input
          value={input} // controlled input — always reflects the `input` state

          onChange={(e) => {
            setInput(e.target.value);   // update local display text as user types
            onChange(e.target.value);   // also update parent so form.city stays in sync
            setOpen(true);              // show dropdown while typing
          }}

          onFocus={() => setOpen(true)}  // show dropdown when user clicks into the field

          // Hide dropdown when user clicks away.
          // 150ms delay is intentional: it gives the onMouseDown on a list item
          // time to fire BEFORE the blur event closes the dropdown.
          onBlur={() => setTimeout(() => setOpen(false), 150)}

          placeholder="Type or select city…"
          className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-[#F8F3E8] border border-[#D6C7A8] outline-none focus:ring-2 focus:ring-[#C6A75E] text-[#3E2723] text-sm"
        />

        {/* ✕ clear button — only shown when there is text in the box */}
        {input && (
          <button
            // onMouseDown (not onClick) so it fires BEFORE the input's onBlur event
            onMouseDown={() => {
              setInput("");    // clear the displayed text
              onChange("");    // tell parent city is now empty
              setOpen(false);  // close the dropdown
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8956A] hover:text-[#A8843C] text-xs"
          >✕</button>
        )}
      </div>

      {/* Animated dropdown list — only shown when open AND there are matching cities */}
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}   // starts invisible, slightly above
            animate={{ opacity: 1, y: 0 }}    // fades in, slides to natural position
            exit={{ opacity: 0, y: -4 }}      // reverses on close
            transition={{ duration: 0.15 }}
            // z-30 ensures the dropdown floats above other page elements
            className="absolute z-30 mt-1 w-full bg-white border border-[#D6C7A8] rounded-xl shadow-xl max-h-48 overflow-y-auto"
          >
            {/* Render one <li> per matching city */}
            {filtered.map((c) => (
              <li
                key={c}
                onMouseDown={() => select(c)} // onMouseDown (not onClick) — see blur note above
                className={`px-4 py-2.5 cursor-pointer text-sm hover:bg-[#F8F3E8] transition-colors ${
                  // Highlight the city that is currently selected
                  c === value ? "font-bold text-[#A8843C] bg-[#F8F3E8]" : "text-[#3E2723]"
                }`}
              >
                {c}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────────────────────
// SECTION 4 — TailorCardUI COMPONENT
// Renders a single tailor as a card: photo, name, specialty, city, call/link buttons.
// Props:
//   tailor → the tailor data object
//   index  → position in the results list (0, 1, 2...) — used to stagger animations
// ───────────────────────────────────────────────────────────────────────────────
function TailorCardUI({ tailor, index }: { tailor: TailorCard; index: number }) {

  // Calculate years of experience from the `since` field.
  // parseInt converts "2005" → 2005, then subtract from current year.
  // If `since` is missing/empty, exp stays null and the badge is hidden.
  const exp = tailor.since ? new Date().getFullYear() - parseInt(tailor.since) : null;

  // Decide which city label to display on the card:
  // If tailor works from a Shop AND has a shopCity → show shopCity
  // Otherwise fall back to their registered city
  const displayCity = tailor.worktype === "Shop" && tailor.shopCity
    ? tailor.shopCity
    : tailor.city;

  return (
    <motion.div
      // Cards start invisible and 24px below their final position
      initial={{ opacity: 0, y: 24 }}
      // Animate to fully visible at their natural position
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06, // each card appears 60ms after the previous one (stagger effect)
      }}
      // On hover: lift the card up 5px and add a warm gold drop-shadow
      whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(168,132,60,0.2)" }}
      // `group` class enables group-hover utilities on child elements (e.g. image zoom)
      className="bg-white rounded-2xl border border-[#D6C7A8] overflow-hidden shadow-md group cursor-pointer"
    >

      {/* ── PHOTO SECTION ── */}
      {/* Fixed height of 48 (192px). overflow-hidden clips the zoomed image on hover. */}
      <div className="relative h-48 bg-[#F8F3E8] overflow-hidden">

        <img
          // Use profilepic URL; fall back to nopic.jpg if field is empty string
          src={tailor.profilepic || "nopic.jpg"}
          alt={tailor.name}
          // If the image URL is broken/404, replace src with placeholder image
          onError={(e: any) => { e.target.src = "nopic.jpg"; }}
          // On card hover, image smoothly scales up to 105% (zoom effect)
          // group-hover works because the parent div has className="group"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Dark gradient overlay at the bottom of the photo — improves badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* TOP-RIGHT BADGE: work type — "Shop" or "Freelance" */}
        <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full bg-[#A8843C] text-white shadow-md">
          {tailor.worktype || "Freelance"} {/* fallback to "Freelance" if field is empty */}
        </span>

        {/* BOTTOM-LEFT BADGE: experience years — only shown if exp is a non-negative number */}
        {exp !== null && exp >= 0 && (
          <span className="absolute bottom-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#7A5C2E] shadow">
            🏅 {exp}+ yrs
          </span>
        )}
      </div>

      {/* ── CONTENT SECTION ── */}
      <div className="p-4">

        {/* Tailor name — truncate prevents long names from breaking the card layout */}
        <h3 className="text-[#5C3D1A] truncate mb-0.5 font-bold text-lg">
          {tailor.name}
        </h3>

        {/* Specialty / dress type (e.g. "Coat", "Anarkali") */}
        <p className="text-[#A8843C] text-sm font-semibold flex items-center gap-1.5 mb-1">
          <span>✂️</span> {tailor.specialty}
        </p>

        {/* City — uses displayCity (shop city if applicable, else registered city) */}
        <p className="text-[#B8956A] text-xs flex items-center gap-1 mb-3">
          <span>📍</span> {displayCity}
        </p>

        {/* Action buttons row */}
        {/* border-t adds a separator line above the buttons */}
        <div className="border-t border-[#EDE0CC] pt-3 flex gap-2">

          {/* CALL BUTTON — href="tel:..." triggers the phone dialer on mobile */}
          <a
            href={`tel:${tailor.contact}`}
            className="flex-1 text-center text-sm font-bold py-2 rounded-lg bg-gradient-to-r from-[#C6A75E] to-[#A8843C] text-white hover:opacity-90 transition"
          >
            📞 Call
          </a>

          {/* SOCIAL LINK — only rendered if the tailor has a social/website URL */}
          {tailor.social && (
            <a
              href={tailor.social}
              target="_blank"    // open in new tab
              rel="noreferrer"   // security best-practice: prevents target page from accessing window.opener
              className="px-3 py-2 rounded-lg border border-[#D6C7A8] text-[#A8843C] hover:bg-[#F8F3E8] transition text-sm font-bold"
            >
              🔗
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}


// ───────────────────────────────────────────────────────────────────────────────
// SECTION 5 — Pagination COMPONENT
// Renders Previous / numbered pages / Next buttons below the results grid.
// Props:
//   page       → the currently active page number (1-based)
//   totalPages → total number of pages available
//   onPage     → callback fired when the user clicks a page button
// ───────────────────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  // No pagination needed when there's only 1 page (or 0 results)
  if (totalPages <= 1) return null;

  // Build array [1, 2, 3, ... totalPages] to render individual page buttons
  // Array.from({ length: n }, fn) creates an array of n elements; (_, i) gives the index
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">

      {/* PREVIOUS BUTTON — disabled when already on the first page */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1} // HTML disabled attribute prevents click AND greys it out
        className="px-4 py-2 rounded-lg border border-[#D6C7A8] bg-white text-[#A8843C] font-bold disabled:opacity-30 hover:bg-[#F8F3E8] transition text-sm"
      >
        ‹ Prev
      </button>

      {/* NUMBERED PAGE BUTTONS — one button per page */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-lg font-bold text-sm transition border ${
            // Active page: gold background. Other pages: white with gold border.
            p === page
              ? "bg-[#A8843C] text-white border-[#A8843C] shadow"
              : "bg-white text-[#A8843C] border-[#D6C7A8] hover:bg-[#F8F3E8]"
          }`}
        >
          {p}
        </button>
      ))}

      {/* NEXT BUTTON — disabled when already on the last page */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-lg border border-[#D6C7A8] bg-white text-[#A8843C] font-bold disabled:opacity-30 hover:bg-[#F8F3E8] transition text-sm"
      >
        Next ›
      </button>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────────────────────
// SECTION 6 — FindTailor (MAIN / DEFAULT EXPORT COMPONENT)
// This is the top-level page component that:
//   1. Manages all shared state (form inputs, results, pagination, loading flags)
//   2. Calls the backend API
//   3. Assembles the sidebar + results panel into the final page layout
// ───────────────────────────────────────────────────────────────────────────────
export default function FindTailor() {

  // ── STATE DECLARATIONS ──

  // The three filter values bound to the sidebar form inputs
  const [form, setForm] = useState<SearchForm>({ city: "", category: "", specialty: "" });

  // List of dress types (specialties) fetched from DB when category is selected
  const [specialties, setSpecialties] = useState<string[]>([]);

  // True while the specialty API call is in-flight (shows a spinner in the dropdown area)
  const [specialtyLoading, setSpecialtyLoading] = useState(false);

  // The array of tailor cards to render in the current results page
  const [tailors, setTailors] = useState<TailorCard[]>([]);

  // Total number of matching tailors across ALL pages (shown in summary bar)
  const [total, setTotal] = useState(0);

  // Currently visible page number (1-based)
  const [page, setPage] = useState(1);

  // Total number of pages available for the current search
  const [totalPages, setTotalPages] = useState(0);

  // True while the find-tailors API call is in-flight (shows skeleton cards)
  const [loading, setLoading] = useState(false);

  // Becomes true the FIRST TIME the user clicks "Find Tailors".
  // Used to decide what to show in the right panel:
  //   false → show welcome/instructions screen
  //   true  → show results grid OR empty-state message
  const [searched, setSearched] = useState(false);


  // ── EFFECT: Fetch Specialties whenever Category Changes ──
  // This runs every time form.category changes (dependency array: [form.category])
  useEffect(() => {

    // Reset specialty selection so a stale value from the old category isn't sent
    setForm((p) => ({ ...p, specialty: "" }));

    // Remove old specialty options immediately so the UI doesn't flash stale data
    setSpecialties([]);

    // If no category is selected yet, there's nothing to fetch — exit early
    if (!form.category) return;

    // Show spinner in the dress-type area while loading
    setSpecialtyLoading(true);

    // POST to /tailor/specialties with the selected category
    // Backend returns distinct specialty values from tailors who match this category
    axios
      .post(`${BASE}/specialties`, { category: form.category })
      .then((r) => {
        // If status is true, save the array; otherwise store empty array
        setSpecialties(r.data.status ? r.data.specialties : []);
      })
      .catch(() => setSpecialties([]))     // network error → empty dropdown
      .finally(() => setSpecialtyLoading(false)); // always hide spinner when done

  }, [form.category]); // ← re-run whenever the selected category changes


  // ── doSearch: The Core Search Function ──
  // useCallback memoizes this function so it is only re-created when `form` changes.
  // Without useCallback, a new function reference would be created on every render,
  // which can cause unintended useEffect re-runs or stale closures.
  const doSearch = useCallback((pageNum = 1) => {

    setLoading(true);   // show skeleton loader cards
    setSearched(true);  // switch the right panel from welcome-screen to results-screen
    setPage(pageNum);   // track which page we are now on

    // POST to /tailor/find-tailors with all current filter values + pagination params
    // Spread operator (...form) sends city, category, specialty all at once
    axios
      .post(`${BASE}/find-tailors`, { ...form, page: pageNum, limit: PAGE_SIZE })
      .then((r) => {
        if (r.data.status) {
          // Success: save the page of tailor documents and pagination metadata
          setTailors(r.data.docs);           // array of TailorCard objects for this page
          setTotal(r.data.total);            // total matching count across all pages
          setTotalPages(r.data.totalPages);  // how many pages exist
        } else {
          // Backend returned status: false (no matches, or filter error)
          setTailors([]); setTotal(0); setTotalPages(0);
        }
      })
      .catch(() => {
        // Network/server error → clear results so empty state is shown
        setTailors([]); setTotal(0); setTotalPages(0);
      })
      .finally(() => setLoading(false)); // always hide the loading skeleton when done

  }, [form]); // ← re-create doSearch only when form values change


  // Called when the user clicks a page number or Prev/Next
  const handlePageChange = (p: number) => {
    doSearch(p); // fetch the new page of results
    // Smoothly scroll the browser window back to the top so user sees the new cards
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Resets everything back to the initial empty state (welcome screen)
  const handleClear = () => {
    setForm({ city: "", category: "", specialty: "" }); // clear all filter inputs
    setSpecialties([]);  // remove specialty dropdown options
    setTailors([]);      // remove result cards
    setTotal(0);
    setTotalPages(0);
    setSearched(false);  // go back to the welcome screen
  };


  // ───────────────────────────────────────────────────────────────────────────────
  // RENDER
  // Layout: full-page background → header → max-width container → sidebar + main
  // ───────────────────────────────────────────────────────────────────────────────
  return (
    // Full-page warm cream background
    <div className="min-h-screen bg-[#F5E6D3]">

      {/* Inline <style> to load the "Great Vibes" cursive font from Google Fonts.
          Used for the decorative headings throughout the page. */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}</style>

      {/* ── PAGE HEADER ── */}
      {/* Full-width gold bar at the top */}
      <div className="bg-[#A8843C] py-6 px-6 text-center shadow-md">
        {/* Large cursive heading */}
        <h1 className="text-7xl text-white" style={{ fontFamily: "'Great Vibes', cursive" }}>
          Find a Tailor
        </h1>
        {/* Subtitle in light gold */}
        <p className="text-[#F5E4C0] text-sm mt-1 tracking-wide">
          Discover skilled tailors near you
        </p>
      </div>

      {/* ── MAIN LAYOUT CONTAINER ──
          max-w-7xl keeps content from stretching too wide on large screens.
          On large screens (lg:) it becomes a horizontal row (flex-row).
          On smaller screens it stacks vertically (flex-col is the default). */}
      <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6 items-start">


        {/* ════════════════════════════════════════════
            LEFT SIDEBAR — Search Filters Panel
            ════════════════════════════════════════════ */}
        {/* Animated: slides in from the left (x: -20 → 0) and fades in */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          // w-72 = fixed width of 288px on large screens; full-width on mobile
          // flex-shrink-0 prevents it from squishing when main panel is wide
          className="w-full lg:w-72 flex-shrink-0"
        >
          {/* sticky top-6 keeps the sidebar visible as the user scrolls down results */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#D6C7A8] overflow-hidden sticky top-6">

            {/* Sidebar header bar */}
            <div className="bg-[#A8843C] px-5 py-4">
              <h2 className="text-white font-bold text-lg tracking-wide">🔍 Search Filters</h2>
            </div>

            {/* Filter fields — space-y-6 adds vertical gap between each section */}
            <div className="p-5 space-y-6">

              {/* ── CITY FILTER ── */}
              <div>
                <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest text-[#A8843C]">
                  City
                </label>
                {/* CityCombo handles its own dropdown; we just pass value + onChange */}
                <CityCombo
                  value={form.city}
                  // Functional update: spread existing form, override only city
                  onChange={(v) => setForm((p) => ({ ...p, city: v }))}
                />
              </div>

              {/* ── CATEGORY FILTER ── */}
              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-[#A8843C]">
                  Category
                </label>
                <div className="flex flex-col gap-2">
                  {/* Map over CATEGORIES constant to render 4 styled radio buttons */}
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat.value}
                      // Entire label is clickable (wraps the hidden radio input)
                      // Active category gets a highlighted gold border + background
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all select-none ${
                        form.category === cat.value
                          ? "border-[#A8843C] bg-[#F8F3E8] text-[#7A5C2E] font-bold shadow-sm"
                          : "border-[#D6C7A8] bg-white text-[#5C3D1A] hover:bg-[#F8F3E8]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"          // same name groups them as mutually exclusive
                        value={cat.value}
                        checked={form.category === cat.value} // controlled by form state
                        onChange={() =>
                          // When category changes, also clear specialty to avoid stale filter
                          setForm((p) => ({ ...p, category: cat.value, specialty: "" }))
                        }
                        className="accent-[#A8843C]" // Tailwind: sets the radio button's accent color
                      />
                      <span className="text-sm">{cat.icon} {cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── DRESS TYPE (SPECIALTY) FILTER ──
                  This entire block only appears after a category is selected.
                  AnimatePresence + motion.div animate it in (height 0→auto) and out (auto→0). */}
              <AnimatePresence>
                {/* Conditionally rendered: only when form.category is truthy */}
                {form.category && (
                  <motion.div
                    key="dress-type-block" // stable key so AnimatePresence can track this element
                    initial={{ opacity: 0, height: 0 }}    // starts collapsed
                    animate={{ opacity: 1, height: "auto" }} // expands to content height
                    exit={{ opacity: 0, height: 0 }}       // collapses when removed
                    transition={{ duration: 0.25 }}
                    style={{ overflow: "hidden" }} // required for height animation to clip content
                  >
                    <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest text-[#A8843C]">
                      Dress Type
                    </label>

                    {/* STATE 1: Loading spinner — shown while the API call is in-flight */}
                    {specialtyLoading && (
                      <div className="w-full px-4 py-2.5 rounded-lg bg-[#F8F3E8] border border-[#D6C7A8] flex items-center gap-2 text-[#B8956A] text-sm">
                        {/* SVG spinner — animate-spin rotates it continuously */}
                        <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                          {/* Semi-transparent circle — the "track" of the spinner */}
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          {/* The rotating arc segment */}
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Loading…
                      </div>
                    )}

                    {/* STATE 2: No dress types in DB for this category */}
                    {!specialtyLoading && specialties.length === 0 && (
                      <div className="w-full px-4 py-2.5 rounded-lg bg-[#F8F3E8] border border-[#D6C7A8] text-[#B8956A] text-sm italic">
                        No dress types registered yet
                      </div>
                    )}

                    {/* STATE 3: Dropdown populated with values from the database */}
                    {!specialtyLoading && specialties.length > 0 && (
                      <select
                        value={form.specialty} // controlled — always reflects form state
                        onChange={(e) =>
                          setForm((p) => ({ ...p, specialty: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-lg bg-[#F8F3E8] border border-[#D6C7A8] outline-none focus:ring-2 focus:ring-[#C6A75E] text-[#3E2723] text-sm"
                      >
                        {/* Default "show all" option — sends empty string to backend (no filter) */}
                        <option value="">— All Dress Types —</option>
                        {/* One <option> per specialty returned from the database */}
                        {specialties.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── FIND TAILORS BUTTON ── */}
              <motion.button
                onClick={() => doSearch(1)} // always start on page 1 for a fresh search
                whileHover={{ scale: 1.03 }} // subtle grow on hover
                whileTap={{ scale: 0.97 }}   // subtle shrink on click (press feedback)
                disabled={loading}           // prevent double-submitting while loading
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#C6A75E] to-[#A8843C] text-white font-bold shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {/* Show spinner + "Searching…" text while loading, otherwise the normal label */}
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Searching…
                  </>
                ) : <>✦ Find Tailors</>}
              </motion.button>

              {/* ── CLEAR FILTERS BUTTON ──
                  Only shown when at least one filter has a value (avoids clutter when empty) */}
              {(form.city || form.category || form.specialty) && (
                <button
                  onClick={handleClear}
                  className="w-full py-2 rounded-full border border-[#D6C7A8] text-[#A8843C] text-sm font-semibold hover:bg-[#F8F3E8] transition"
                >
                  ✕ Clear Filters
                </button>
              )}

            </div>
          </div>
        </motion.aside>


        {/* ════════════════════════════════════════════
            RIGHT MAIN PANEL — Results Area
            ════════════════════════════════════════════ */}
        {/* flex-1 makes it take all remaining horizontal space.
            min-w-0 is a flexbox fix — prevents the panel from overflowing if content is wide. */}
        <main className="flex-1 min-w-0">

          {/* ── SUMMARY BAR ──
              Shows "X tailors found · Category · Specialty in City" and page info.
              Only visible after a search has been performed AND loading is done. */}
          <AnimatePresence>
            {searched && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 flex items-center justify-between flex-wrap gap-2"
              >
                <p className="text-[#7A5C2E] font-semibold text-sm">
                  {/* Ternary: show count if there are results, else "No tailors found" */}
                  {total > 0 ? `${total} tailor${total !== 1 ? "s" : ""} found` : "No tailors found"}
                  {/* Conditionally append active filters to the summary text */}
                  {form.category ? ` · ${form.category}` : ""}
                  {form.specialty ? ` · ${form.specialty}` : ""}
                  {form.city ? ` in ${form.city}` : ""}
                </p>
                {/* Page indicator — only shown when there's more than one page */}
                {totalPages > 1 && (
                  <p className="text-[#B8956A] text-xs">Page {page} of {totalPages}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── SKELETON LOADER ──
              Shown while loading === true. Renders PAGE_SIZE (6) placeholder cards.
              animate-pulse makes them fade in/out to indicate "loading" state. */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* Array.from creates an array of 6 undefined elements just to map over */}
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#D6C7A8] overflow-hidden shadow animate-pulse">
                  {/* Placeholder for the photo area */}
                  <div className="h-48 bg-[#EDE0CC]" />
                  <div className="p-4 space-y-2.5">
                    {/* Placeholder lines mimicking name, specialty, city, button */}
                    <div className="h-6 bg-[#EDE0CC] rounded w-2/3" />
                    <div className="h-3 bg-[#EDE0CC] rounded w-1/2" />
                    <div className="h-3 bg-[#EDE0CC] rounded w-1/3" />
                    <div className="h-9 bg-[#EDE0CC] rounded-lg mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── RESULTS GRID ──
              Only shown when NOT loading AND there are tailor results to display.
              Responsive grid: 1 col on mobile, 2 on sm, 3 on xl screens. */}
          {!loading && tailors.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {tailors.map((t, i) => (
                // key={t._id} uses MongoDB's unique ID — more reliable than array index
                // index={i} passed for the staggered entry animation
                <TailorCardUI key={t._id} tailor={t} index={i} />
              ))}
            </div>
          )}

          {/* ── EMPTY STATE ──
              Shown when: not loading, user has searched, but zero results came back. */}
          {!loading && searched && tailors.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="text-3xl text-[#A8843C] mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>
                No Tailors Found
              </h3>
              <p className="text-[#B8956A] text-sm">
                Try a different city, category, or dress type.
              </p>
            </motion.div>
          )}

          {/* ── WELCOME / INSTRUCTIONS STATE ──
              Shown when: not loading AND user has NOT yet searched (initial state).
              Guides the user on how to use the filters. */}
          {!loading && !searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <span className="text-7xl mb-4">✂️</span>
              <h3 className="text-4xl text-[#A8843C] mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>
                Discover Skilled Tailors
              </h3>
              <p className="text-[#B8956A] text-sm max-w-xs leading-relaxed">
                {/* {" "} is a JSX whitespace trick to ensure a space between inline elements */}
                Pick a <strong>city</strong>, select a <strong>category</strong>, choose a{" "}
                <strong>dress type</strong>, then hit <strong>Find Tailors</strong>.
              </p>
            </motion.div>
          )}

          {/* ── PAGINATION ──
              Only shown when not loading AND there are cards to page through.
              The Pagination component itself hides if totalPages <= 1. */}
          {!loading && tailors.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
          )}

        </main>
      </div>
    </div>
  );
}