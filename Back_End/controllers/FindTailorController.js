var TailorColRef = require("../models/model_tailor");  
// No hardcoded specialty map — all values come live from the DB
// based on what tailors actually filled in their profile's specialty field


// ─────────────────────────────────────────────────────────────
// GET DISTINCT CITIES
// GET /tailor/cities
// ─────────────────────────────────────────────────────────────

function doGetCities(req, resp) {
  TailorColRef.distinct("city")
    .then((cities) => {
      const clean = cities
        .map((c) => String(c || "").trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      resp.status(200).json({ status: true, cities: clean });
    })
    .catch((err) => {
      resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// GET SPECIALTIES FOR A CATEGORY  (dynamic dress-type combo)
// POST /tailor/specialties   body: { category: "Men" }
// ─────────────────────────────────────────────────────────────

function doGetSpecialties(req, resp) {
  const category = (req.body.category || "").trim();

  if (!category) {
    return resp.status(200).json({ status: false, msg: "Category required" });
  }

  // Pull ONLY the distinct specialty values that tailors actually saved
  // for this category — exactly what they typed in TailorProfile's specialty field
  TailorColRef.distinct("specialty", { category })
    .then((dbSpecialties) => {
      const specialties = dbSpecialties
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      resp.status(200).json({ status: true, specialties });
    })
    .catch((err) => {
      resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// FIND TAILORS  (paginated search)
// POST /tailor/find-tailors
// body: { city, category, specialty, page, limit }
// ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

function doFindTailors(req, resp) {
  const { city, category, specialty } = req.body;
  const page  = Math.max(1, parseInt(req.body.page)  || 1);
  const limit = Math.max(1, parseInt(req.body.limit) || PAGE_SIZE);
  const skip  = (page - 1) * limit;

  // Build filter dynamically
  const filter = {};

  if (city && city.trim())
    filter.city = new RegExp(city.trim(), "i");

  if (category && category.trim())
    filter.category = category.trim();

  if (specialty && specialty.trim())
    filter.specialty = new RegExp(specialty.trim(), "i");

  // Run count + paginated find in parallel
  Promise.all([
    TailorColRef.countDocuments(filter),
    TailorColRef.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name specialty city profilepic worktype shopCity since contact social"),
  ])
    .then(([total, docs]) => {
      resp.status(200).json({
        status:     true,
        docs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    })
    .catch((err) => {
      resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = {
  doGetCities,
  doGetSpecialties,
  doFindTailors,
};