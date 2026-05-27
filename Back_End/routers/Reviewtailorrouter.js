var express = require("express");
var router  = express.Router();

var reviewCtrl = require("../controllers/reviewTailorController");

// POST /review/find-tailor-by-mobile  → fetch tailor info on mobile blur
router.post("/find-tailor-by-mobile", reviewCtrl.findTailorByMobile);

// POST /review/save-review            → publish a new review
router.post("/save-review", reviewCtrl.saveReview);

// GET  /review/get-reviews/:mobile    → get all reviews for a tailor
router.get("/get-reviews/:mobile", reviewCtrl.getReviewsByMobile);

module.exports = router;