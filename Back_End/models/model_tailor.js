const mongoose = require("mongoose");

const tailorSchema = new mongoose.Schema(
  {
    // ── Personal ──────────────────────────────
    emailid:    { type: String, required: true, unique: true, trim: true },
    name:       { type: String, required: true, trim: true },
    contact:    { type: String, required: true, trim: true },
    dob:        { type: String, default: "" },
    gender:     { type: String, default: "" },
    address:    { type: String, default: "" },
    city:       { type: String, default: "", trim: true },
    aadharno:   { type: String, default: "" },

    // ── Professional ─────────────────────────
    category:   { type: String, default: "" },   // Men / Women / Children
    specialty:  { type: String, default: "" },   // Pant, Shirt, Suit, etc.
    since:      { type: String, default: "" },   // Year e.g. "2010"
    worktype:   { type: String, default: "" },   // Shop / Freelance / Home

    // ── Shop (optional) ──────────────────────
    shopAddress: { type: String, default: "" },
    shopCity:    { type: String, default: "", trim: true },

    // ── Extra ────────────────────────────────
    otherInfo:  { type: String, default: "" },

    // ── Files (Cloudinary URLs) ───────────────
    profilepic: { type: String, default: "nopic.jpg" },
    aadharcard: { type: String, default: "" },
  },
  {
    timestamps: true,   // adds createdAt, updatedAt automatically
  }
);

const TailorColRef = mongoose.model("tailors", tailorSchema);

module.exports = TailorColRef;