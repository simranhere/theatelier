var path = require("path");
var TailorColRef = require("../models/model_tailor");

// Cloudinary
const cloudinary = require("cloudinary").v2;
var { cloudObj } = require("../config/config");
cloudinary.config(cloudObj);

// OCR
const Tesseract = require("tesseract.js");

// ─────────────────────────────────────────────────────────────
// SAVE PROFILE
// ─────────────────────────────────────────────────────────────

function doSaveProfile(req, resp) {

    TailorColRef.findOne({ emailid: req.body.emailid }).then((existing) => {

        if (existing != null) {
            return resp.status(200).json({ status: false, msg: "Email already registered" });
        }

        let picPromise = Promise.resolve("nopic.jpg"); // Default if no file
        if (req.files && req.files.profilepic) {
            let fileName = req.files.profilepic.name;
            let uploadsFolderPath = path.join(__dirname, "..", "uploads", fileName);

            req.files.profilepic.mv(uploadsFolderPath);

            picPromise = cloudinary.uploader.upload(uploadsFolderPath).then(function (picUrlResult) {
                return picUrlResult.url;
            });
        }

        let aadharPromise = Promise.resolve(""); // Default if no file
        if (req.files && req.files.aadharcard) {
            let fileName = req.files.aadharcard.name;
            let uploadsFolderPath = path.join(__dirname, "..", "uploads", fileName);

            req.files.aadharcard.mv(uploadsFolderPath);

            aadharPromise = cloudinary.uploader.upload(uploadsFolderPath).then(function (aadharUrlResult) {
                return aadharUrlResult.url;
            });
        }

        // Wait for BOTH uploads to finish before saving to DB
        Promise.all([picPromise, aadharPromise]).then(function (results) {
            req.body.profilepic = results[0];
            req.body.aadharcard = results[1];

            let obj = new TailorColRef(req.body);

            obj.save().then((doc) => {
                resp.status(200).json({ status: true, msg: "Profile Saved", doc: doc });
            }).catch((err) => {
                resp.status(200).json({ status: false, msg: err.message });
            });

        }).catch(function (err) {
            resp.status(200).json({ status: false, msg: err.message });
        });

    }).catch((err) => {
        resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────

function doUpdateProfile(req, resp) {

    let updateData = req.body;

    let picPromise = Promise.resolve();
    if (req.files && req.files.profilepic) {
        let fileName = req.files.profilepic.name;
        let uploadsFolderPath = path.join(__dirname, "..", "uploads", fileName);

        req.files.profilepic.mv(uploadsFolderPath);

        picPromise = cloudinary.uploader.upload(uploadsFolderPath).then(function (picUrlResult) {
            updateData.profilepic = picUrlResult.url;
        });
    }

    let aadharPromise = Promise.resolve();
    if (req.files && req.files.aadharcard) {
        let fileName = req.files.aadharcard.name;
        let uploadsFolderPath = path.join(__dirname, "..", "uploads", fileName);

        req.files.aadharcard.mv(uploadsFolderPath);

        aadharPromise = cloudinary.uploader.upload(uploadsFolderPath).then(function (aadharUrlResult) {
            updateData.aadharcard = aadharUrlResult.url;
        });
    }

    // Wait for potential uploads to finish before updating DB
    Promise.all([picPromise, aadharPromise]).then(function () {

        TailorColRef.findOneAndUpdate(
            { emailid: req.body.emailid },
            { $set: updateData },
            { new: true }
        ).then((doc) => {

            if (doc != null)
                resp.status(200).json({ status: true, msg: "Profile Updated", doc: doc });
            else
                resp.status(200).json({ status: false, msg: "Profile Not Found" });

        }).catch((err) => {
            resp.status(200).json({ status: false, msg: err.message });
        });

    }).catch(function (err) {
        resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// FIND TAILOR
// ─────────────────────────────────────────────────────────────

function doFindTailor(req, resp) {

    TailorColRef.findOne({ emailid: req.body.emailid }).then((doc) => {

        if (doc != null)
            resp.status(200).json({ status: true, doc: doc });
        else
            resp.status(200).json({ status: false, msg: "No Profile Found" });

    }).catch((err) => {
        resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// LIST TAILORS
// ─────────────────────────────────────────────────────────────

function doListTailors(req, resp) {

    let filter = {};

    if (req.query.city)
        filter.city = new RegExp(req.query.city, "i");

    if (req.query.category)
        filter.category = req.query.category;

    if (req.query.worktype)
        filter.worktype = req.query.worktype;

    TailorColRef.find(filter).sort({ createdAt: -1 }).then((docs) => {
        resp.status(200).json({ status: true, docs: docs });
    }).catch((err) => {
        resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// EXTRACT AADHAAR (OCR)
// ─────────────────────────────────────────────────────────────

function doExtractAadhaar(req, resp) {

    if (!req.files || !req.files.aadharcard) {
        return resp.status(200).json({ status: false, msg: "No file uploaded" });
    }

    let fileName = req.files.aadharcard.name;
    let uploadsFolderPath = path.join(__dirname, "..", "uploads", fileName);

    // Wait for the file to move before running Tesseract
    req.files.aadharcard.mv(uploadsFolderPath).then(function () {

        Tesseract.recognize(uploadsFolderPath, "eng").then((result) => {

            let text = result.data.text;

            let aadhaarMatch = text.match(/\d{4}\s?\d{4}\s?\d{4}/);
            let aadhaarno = aadhaarMatch ? aadhaarMatch[0].replace(/\s/g, "") : "";

            let dobMatch = text.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
            let dob = "";
            if (dobMatch)
                dob = `${dobMatch[3]}-${dobMatch[2]}-${dobMatch[1]}`;

            let gender = "";
            if (/female/i.test(text)) gender = "Female";
            else if (/male/i.test(text)) gender = "Male";

            resp.status(200).json({ status: true, aadhaarno, dob, gender });

        }).catch((err) => {
            resp.status(200).json({ status: false, msg: err.message });
        });

    }).catch(function (err) {
        resp.status(200).json({ status: false, msg: err.message });
    });
}


// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = {
    doSaveProfile,
    doUpdateProfile,
    doFindTailor,
    doExtractAadhaar,
    doListTailors
};