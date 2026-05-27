var express = require("express");
var router  = express.Router();

var {
  doSaveProfile,
  doUpdateProfile,
  doFindTailor,
  doExtractAadhaar,
  doListTailors,
} = require("../controllers/TailorController");

var {
  doGetCities,
  doGetSpecialties,
  doFindTailors,
} = require("../controllers/FindTailorController");

router.post("/save-tailor-profile", doSaveProfile);
router.post("/update-tailor-profile", doUpdateProfile);
router.post("/find-tailor", doFindTailor);
router.post("/extract-aadhaar", doExtractAadhaar);
router.get("/list-tailors", doListTailors);

router.get("/cities", doGetCities);
router.post("/specialties", doGetSpecialties);
router.post("/find-tailors", doFindTailors);

module.exports = router;