var express = require("express");
var router  = express.Router();

// ── Existing controller ──────────────────────────────────────
var {
  doSaveProfile,
  doUpdateProfile,
  doFindTailor,
  doExtractAadhaar,
  doListTailors,
} = require("../controllers/TailorController");

// ── New find-tailor controller ───────────────────────────────
var {
  doGetCities,
  doGetSpecialties,
  doFindTailors,
} = require("../controllers/FindTailorController");

// ── Existing routes ──────────────────────────────────────────
router.post("/save-tailor-profile",   doSaveProfile);
router.post("/update-tailor-profile", doUpdateProfile);
router.post("/find-tailor",           doFindTailor);
router.post("/extract-aadhaar",       doExtractAadhaar);
router.get("/list-tailors",           doListTailors);

// ── New routes ───────────────────────────────────────────────
router.get("/cities",                 doGetCities);        // GET  /tailor/cities
router.post("/specialties",           doGetSpecialties);   // POST /tailor/specialties
router.post("/find-tailors",          doFindTailors);      // POST /tailor/find-tailors

module.exports = router;