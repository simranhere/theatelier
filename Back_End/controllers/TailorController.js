var TailorColRef = require("../models/model_tailor");
var cloudinary   = require("../config/config"); // ← already configured
const Tesseract  = require("tesseract.js");

// ── SAVE PROFILE ────────────────────────────────────────
function doSaveProfile(req, resp) {

  TailorColRef.findOne({ emailid: req.body.emailid }).then((existing) => {

    if (existing != null)
      return resp.status(200).json({ status: false, msg: "Email already registered" });

    //  Upload directly from /tmp — no local uploads/ folder needed
    let picPromise = Promise.resolve("nopic.jpg");
    if (req.files && req.files.profilepic) {
      picPromise = cloudinary.uploader.upload(req.files.profilepic.tempFilePath, {
        resource_type: "auto",
        folder: "tailor-profiles",
      }).then((r) => r.secure_url);
    }

    let aadharPromise = Promise.resolve("");
    if (req.files && req.files.aadharcard) {
      aadharPromise = cloudinary.uploader.upload(req.files.aadharcard.tempFilePath, {
        resource_type: "auto",
        folder: "tailor-aadhar",
      }).then((r) => r.secure_url);
    }

    Promise.all([picPromise, aadharPromise]).then((results) => {
      req.body.profilepic = results[0];
      req.body.aadharcard = results[1];

      let obj = new TailorColRef(req.body);
      obj.save()
        .then((doc) => resp.status(200).json({ status: true, msg: "Profile Saved", doc: doc }))
        .catch((err) => resp.status(200).json({ status: false, msg: err.message }));

    }).catch((err) => resp.status(200).json({ status: false, msg: err.message }));

  }).catch((err) => resp.status(200).json({ status: false, msg: err.message }));
}

// ── UPDATE PROFILE ──────────────────────────────────────
function doUpdateProfile(req, resp) {

  let updateData = req.body;

  //  Upload directly from /tmp
  let picPromise = Promise.resolve();
  if (req.files && req.files.profilepic) {
    picPromise = cloudinary.uploader.upload(req.files.profilepic.tempFilePath, {
      resource_type: "auto",
      folder: "tailor-profiles",
    }).then((r) => { updateData.profilepic = r.secure_url; });
  }

  let aadharPromise = Promise.resolve();
  if (req.files && req.files.aadharcard) {
    aadharPromise = cloudinary.uploader.upload(req.files.aadharcard.tempFilePath, {
      resource_type: "auto",
      folder: "tailor-aadhar",
    }).then((r) => { updateData.aadharcard = r.secure_url; });
  }

  Promise.all([picPromise, aadharPromise]).then(() => {

    TailorColRef.findOneAndUpdate(
      { emailid: req.body.emailid },
      { $set: updateData },
      { new: true }
    ).then((doc) => {
      if (doc != null)
        resp.status(200).json({ status: true, msg: "Profile Updated", doc: doc });
      else
        resp.status(200).json({ status: false, msg: "Profile Not Found" });
    }).catch((err) => resp.status(200).json({ status: false, msg: err.message }));

  }).catch((err) => resp.status(200).json({ status: false, msg: err.message }));
}

// ── FIND TAILOR ─────────────────────────────────────────
function doFindTailor(req, resp) {
  TailorColRef.findOne({ emailid: req.body.emailid })
    .then((doc) => {
      if (doc != null)
        resp.status(200).json({ status: true, doc: doc });
      else
        resp.status(200).json({ status: false, msg: "No Profile Found" });
    })
    .catch((err) => resp.status(200).json({ status: false, msg: err.message }));
}

// ── LIST TAILORS ────────────────────────────────────────
function doListTailors(req, resp) {
  let filter = {};
  if (req.query.city)     filter.city     = new RegExp(req.query.city, "i");
  if (req.query.category) filter.category = req.query.category;
  if (req.query.worktype) filter.worktype = req.query.worktype;

  TailorColRef.find(filter).sort({ createdAt: -1 })
    .then((docs) => resp.status(200).json({ status: true, docs: docs }))
    .catch((err) => resp.status(200).json({ status: false, msg: err.message }));
}

// ── EXTRACT AADHAAR (OCR) ───────────────────────────────
function doExtractAadhaar(req, resp) {

  if (!req.files || !req.files.aadharcard)
    return resp.status(200).json({ status: false, msg: "No file uploaded" });

  // Tesseract reads directly from /tmp — no mv() needed
  const tempPath = req.files.aadharcard.tempFilePath;

  Tesseract.recognize(tempPath, "eng").then((result) => {
    let text = result.data.text;

    let aadhaarMatch = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
    let aadhaarno   = aadhaarMatch ? aadhaarMatch[0].replace(/\s/g, "") : "";

    let dobMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    let dob = "";
    if (dobMatch) dob = `${dobMatch[3]}-${dobMatch[2]}-${dobMatch[1]}`;

    let gender = "";
    if (/female/i.test(text))      gender = "Female";
    else if (/male/i.test(text))   gender = "Male";

    resp.status(200).json({ status: true, aadhaarno, dob, gender });

  }).catch((err) => resp.status(200).json({ status: false, msg: err.message }));
}

module.exports = { doSaveProfile, doUpdateProfile, doFindTailor, doExtractAadhaar, doListTailors };