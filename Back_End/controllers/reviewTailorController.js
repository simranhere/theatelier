var ReviewColRef = require("../models/model_ReviewTailor.js");
var TailorColRef = require("../models/model_tailor.js");

// ── Find Tailor by Mobile (called on input blur) ────────
function findTailorByMobile(req, resp) {
  console.log(req.body);
  TailorColRef.findOne({ contact: req.body.mobile })
    .select("name specialty profilepic city")
    .then((doc) => {
      if (doc != null)
        resp.status(200).json({ status: true, doc: doc });
      else
        resp.status(200).json({ status: false, msg: "No tailor found with this mobile number" });
    })
    .catch((err) => {
      console.log(err.message);
      resp.status(500).json({ status: false, msg: err.message });
    });
}

// ── Save Review ─────────────────────────────────────────
function saveReview(req, resp) {

  var mobile = req.body.mobile;
  var star   = req.body.star;
  var review = req.body.review;

  TailorColRef.findOne({ contact: mobile })
  .then((tailor)=>{

    if(!tailor)
      return resp.json({
        status:false,
        msg:"No tailor found"
      });

    //  Update if exists else insert
    return ReviewColRef.updateOne(
      { mobile: mobile }, // find
      {
        $set:{
          mobile: mobile,
          star: star,
          review: review
        }
      },
      { upsert:true } // create if not exist
    );

  })
  .then(()=>{

    resp.json({
      status:true,
      msg:"Review Saved Successfully"
    });

  })
  .catch((err)=>{

    resp.json({
      status:false,
      msg:err.message
    });

  });
}

// ── Get All Reviews for a Tailor ───────────────────────
function getReviewsByMobile(req, resp) {
  console.log(req.params);
  ReviewColRef.find({ mobile: req.params.mobile })
    .sort({ createdAt: -1 })
    .then((docs) => {
      var avgRating = 0;
      if (docs.length > 0) {
        var total = docs.reduce(function (sum, r) 
        { return sum + r.star; }, 0);
        avgRating = parseFloat((total / docs.length).toFixed(1));
      }
      resp.status(200).json({
        status: true,
        reviews: docs,
        avgRating: avgRating,
        totalReviews: docs.length,
      });
    })
    .catch((err) => {
      console.log(err.message);
      resp.status(500).json({ status: false, msg: err.message });
    });
}

module.exports = { findTailorByMobile, saveReview, getReviewsByMobile };