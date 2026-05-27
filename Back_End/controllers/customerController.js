var CustomerColRef = require("../models/model_customer");
var cloudinary     = require("../config/config"); 

// ── SAVE PROFILE ────────────────────────────────────────
async function doSaveProfile(req, resp) {

  let fileName = "nopic.jpg";

  if (req.files && req.files.profilepic) {
    //  Upload directly from /tmp — no local uploads/ folder needed
    const result = await cloudinary.uploader.upload(req.files.profilepic.tempFilePath, {
      resource_type: "auto",
      folder: "customer-profiles",
    });
    fileName = result.secure_url;
  }

  req.body.profilepic = fileName;

  let objCustomerColRef = new CustomerColRef(req.body);

  objCustomerColRef.save()
    .then((doc) => {
      resp.status(200).json({ status: true, msg: "Profile saved", doc: doc });
    })
    .catch((err) => {
      resp.status(200).json({ status: false, msg: err.message });
    });
}

// ── UPDATE PROFILE ──────────────────────────────────────
async function doUpdateProfile(req, resp) {

  let updateData = {
    name:    req.body.name,
    address: req.body.address,
    city:    req.body.city,
    state:   req.body.state,
    gender:  req.body.gender,
  };

  if (req.files && req.files.profilepic) {
    //  Upload directly from /tmp
    const result = await cloudinary.uploader.upload(req.files.profilepic.tempFilePath, {
      resource_type: "auto",
      folder: "customer-profiles",
    });
    updateData.profilepic = result.secure_url;
  }

  CustomerColRef.findOneAndUpdate(
    { emailid: req.body.emailid },
    { $set: updateData }
  )
    .then((doc) => {
      if (doc != null)
        resp.status(200).json({ status: true, msg: "Profile updated" });
      else
        resp.status(200).json({ status: false, msg: "Profile not found" });
    })
    .catch((err) => {
      resp.status(200).json({ status: false, msg: err.message });
    });
}

// ── FIND CUSTOMER ───────────────────────────────────────
function doFindCustomer(req, resp) {

  CustomerColRef.findOne({ emailid: req.body.emailid })
    .then((doc) => {
      if (doc != null)
        resp.status(200).json({ status: true, doc: doc });
      else
        resp.status(200).json({ status: false, msg: "No profile found" });
    })
    .catch((err) => {
      resp.status(200).json({ status: false, msg: err.message });
    });
}

module.exports = { doSaveProfile, doUpdateProfile, doFindCustomer };