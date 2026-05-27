import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// ───────────────── TYPES ─────────────────

interface ReviewFormState {
  mobile: string;
  star: number;
  review: string;
}

interface TailorInfo {
  name: string;
  specialty: string;
  profilepic: string;
  city: string;
}

type FormErrors = Partial<Record<keyof ReviewFormState, string>>;
type TouchedState = Partial<Record<keyof ReviewFormState, boolean>>;

// ───────────────── CONSTANTS ─────────────────

const INITIAL_STATE: ReviewFormState = {
  mobile: "",
  star: 0,
  review: "",
};

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

// ───────────────── COMPONENT ─────────────────

export default function RateAndReview() {

  const [form, setForm]                   = useState<ReviewFormState>(INITIAL_STATE);
  const [errors, setErrors]               = useState<FormErrors>({});
  const [touched, setTouched]             = useState<TouchedState>({});
  const [tailorInfo, setTailorInfo]       = useState<TailorInfo | null>(null);
  const [isFinding, setIsFinding]         = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting]   = useState<boolean>(false);
  const [hoverStar, setHoverStar]         = useState<number>(0);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // ───────────────── VALIDATION ─────────────────

  const validateField = (name: keyof ReviewFormState, value: any): string => {
    switch (name) {
      case "mobile":
        if (!value || !String(value).trim()) return "Mobile number is required";
        if (!/^\d{10}$/.test(String(value).trim())) return "Must be exactly 10 digits";
        return "";
      case "star":
        if (!value || value === 0) return "Please select a rating";
        return "";
      case "review":
        if (!value || !String(value).trim()) return "Review is required";
        if (String(value).trim().length < 10) return "Review must be at least 10 characters";
        if (String(value).trim().length > 500) return "Review cannot exceed 500 characters";
        return "";
      default:
        return "";
    }
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    (Object.keys(form) as (keyof ReviewFormState)[]).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) nextErrors[key] = err;
    });
    return nextErrors;
  };

  // ───────────────── HANDLERS ─────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: validateField(name as keyof ReviewFormState, value) }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: validateField(name as keyof ReviewFormState, value) }));
    if (name === "mobile" && /^\d{10}$/.test(value.trim())) {
      fetchTailorByMobile(value.trim());
    } else if (name === "mobile") {
      setTailorInfo(null);
    }
  };

  const handleStarClick = (star: number) => {
    setForm((p) => ({ ...p, star }));
    setTouched((p) => ({ ...p, star: true }));
    setErrors((p) => ({ ...p, star: "" }));
  };

  // ───────────────── API ACTIONS ─────────────────

  function fetchTailorByMobile(mobile: string) {
    setIsFinding(true);
    setTailorInfo(null);
    axios.post("http://localhost:2007/review/find-tailor-by-mobile", { mobile })
      .then((resp) => {
        if (resp.data.status) {
          setTailorInfo(resp.data.doc);
        } else {
          setErrors((p) => ({ ...p, mobile: resp.data.msg || "No tailor found with this number" }));
        }
      })
      .catch(() => setErrors((p) => ({ ...p, mobile: "Error fetching tailor info" })))
      .finally(() => setIsFinding(false));
  }

  function doPublishReview(e: React.MouseEvent) {
    e.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    const allTouched: TouchedState = {};
    (Object.keys(form) as (keyof ReviewFormState)[]).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);
    if (Object.keys(nextErrors).length > 0) return;
    if (!tailorInfo) {
      setErrors((p) => ({ ...p, mobile: "Please enter a valid tailor mobile number" }));
      return;
    }
    setIsSubmitting(true);
    axios.post("http://localhost:2007/review/save-review", form)
      .then((resp) => {
        if (resp.data.status) {
          setSubmitSuccess(true);
          setForm(INITIAL_STATE);
          setTailorInfo(null);
          setTouched({});
          setErrors({});
          setTimeout(() => setSubmitSuccess(false), 4000);
        } else {
          alert(resp.data.msg || "Failed to publish review.");
        }
      })
      .catch(() => alert("Submission failed. Please try again."))
      .finally(() => setIsSubmitting(false));
  }

  // ───────────────── UI HELPERS ─────────────────

  const inputClass = (name: keyof ReviewFormState) =>
    `w-full px-4 py-2.5 rounded-lg bg-[#F8F3E8] border transition-all outline-none focus:ring-2 focus:ring-[#C6A75E] ${
      touched[name] && errors[name]
        ? "border-red-600 bg-red-50"
        : "border-[#D6C7A8]"
    }`;

  const showError = (name: keyof ReviewFormState) =>
    touched[name] && errors[name] ? (
      <p className="text-red-600 text-xs mt-1 font-bold">{errors[name]}</p>
    ) : null;

  const activeStar = hoverStar || form.star;

  // ───────────────── RENDER ─────────────────

  return (
    <div className="min-h-screen bg-[#F5E6D3] flex items-start justify-center p-6">
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');`}</style>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-[#D6C7A8] overflow-hidden"
      >
        {/* ── HEADER ── */}
        <div className="bg-[#A8843C] p-6 text-center text-white">
          <h2
            className="text-4xl"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Rate &amp; Review
          </h2>
          <p className="text-[#F5E4C0] text-sm mt-1 tracking-wide">
            Share your experience with your tailor
          </p>
        </div>

        <div className="p-8 space-y-7">

          {/* ── SUCCESS BANNER ── */}
          <AnimatePresence>
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-400 rounded-xl px-5 py-4 flex items-center gap-3"
              >
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-bold text-green-700">Review Published!</p>
                  <p className="text-green-600 text-sm">Thank you for sharing your experience.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── SECTION DIVIDER HELPER ── */}
          {/* Mobile */}
          <div>
            <label className="block mb-1.5 text-xs font-bold uppercase tracking-widest text-[#A8843C]">
              Tailor's Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  className={inputClass("mobile")}
                />
                {showError("mobile")}
              </div>
              <AnimatePresence>
                {isFinding && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2.5 flex items-center gap-1.5 text-[#A8843C] text-sm font-semibold whitespace-nowrap"
                  >
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Finding…
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── TAILOR CARD ── */}
          <AnimatePresence>
            {tailorInfo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-5 bg-[#F8F3E8] border border-[#D6C7A8] rounded-xl p-4 shadow-sm"
              >
                <img
                  src={tailorInfo.profilepic || "nopic.jpg"}
                  alt={tailorInfo.name}
                  className="w-14 h-14 rounded-full border-2 border-[#C6A75E] object-cover shadow"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-[#5C3D1A] text-lg truncate"
                    style={{ fontFamily: "'Great Vibes', cursive", fontSize: "1.4rem" }}
                  >
                    {tailorInfo.name}
                  </p>
                  <p className="text-[#A8843C] text-sm font-medium">{tailorInfo.specialty}</p>
                  <p className="text-[#B8956A] text-xs flex items-center gap-1 mt-0.5">
                    <span>📍</span>{tailorInfo.city}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-300 whitespace-nowrap">
                  ✓ Verified
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STAR RATING ── */}
          <div>
            <label className="block mb-3 text-xs font-bold uppercase tracking-widest text-[#A8843C]">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <svg
                      className={`w-10 h-10 transition-colors duration-150 drop-shadow-sm ${
                        star <= activeStar ? "text-[#C6A75E]" : "text-[#D6C7A8]"
                      }`}
                      fill={star <= activeStar ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </motion.button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeStar > 0 && (
                  <motion.div
                    key={activeStar}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-[#A8843C] font-bold text-lg">{activeStar}/5</span>
                    <span className="bg-[#F8F3E8] border border-[#D6C7A8] text-[#7A5C2E] text-sm font-semibold px-3 py-0.5 rounded-full">
                      {STAR_LABELS[activeStar]}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {touched.star && errors.star && (
                <p className="text-red-600 text-xs font-bold">{errors.star}</p>
              )}
            </div>
          </div>

          {/* ── REVIEW TEXTAREA ── */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[#A8843C]">
                Write Your Review <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs font-medium ${form.review.length > 450 ? "text-red-500" : "text-[#B8956A]"}`}>
                {form.review.length}/500
              </span>
            </div>
            <textarea
              name="review"
              value={form.review}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={5}
              maxLength={500}
              placeholder="Share your experience — quality of work, punctuality, behaviour, pricing..."
              className={`${inputClass("review")} resize-none leading-relaxed`}
            />
            {showError("review")}
          </div>

          {/* ── HORIZONTAL RULE ── */}
          <div className="border-t border-[#E8D9C0]" />

          {/* ── SUBMIT BUTTON ── */}
          <div className="flex justify-center">
            <motion.button
              type="button"
              onClick={doPublishReview}
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.04 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="px-14 py-3 rounded-full bg-gradient-to-r from-[#C6A75E] to-[#A8843C] text-white font-bold text-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Publishing…
                </>
              ) : (
                <>✦ Publish Review</>
              )}
            </motion.button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}