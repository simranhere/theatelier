var path = require("path");
var CustomerColRef = require("../models/model_customer");

// Cloudinary
const cloudinary = require('cloudinary').v2;
var { cloudObj } = require("../config/config");
cloudinary.config(cloudObj);
//----------------------------------------

async function doSaveProfile(req, resp) {

    let fileName = "nopic.jpg";

    if (req.files != null && req.files.profilepic) {

        fileName = req.files.profilepic.name;

        let uploadsFolderPath = path.join(__dirname, "..", "uploads", fileName);

        await req.files.profilepic.mv(uploadsFolderPath);

        // Upload to Cloudinary
        await cloudinary.uploader.upload(uploadsFolderPath)
            .then(function (picUrlResult) {
                fileName = picUrlResult.url;
            });
    }

    req.body.profilepic = fileName;

    let objCustomerColRef = new CustomerColRef(req.body);

    objCustomerColRef.save()
        .then((doc) => {
            resp.status(200).json({ status: true, msg: "Profile saved", doc: doc })
        })
        .catch((err) => {
            resp.status(200).json({ status: false, msg: err.message })
        });
}


// ---------------- UPDATE PROFILE ----------------

async function doUpdateProfile(req, resp) {

    let updateData = {
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        gender: req.body.gender
    };

    if (req.files != null && req.files.profilepic) {

        let fileName = req.files.profilepic.name;

        let uploadsFolderPath = path.join(__dirname, "..", "uploads", fileName);

        req.files.profilepic.mv(uploadsFolderPath);

        await cloudinary.uploader.upload(uploadsFolderPath)
            .then(function (picUrlResult) {
                updateData.profilepic = picUrlResult.url;
            });
    }

    CustomerColRef.findOneAndUpdate(
        { emailid: req.body.emailid },
        { $set: updateData }
    )
        .then((doc) => {
            if (doc != null)
                resp.status(200).json({ status: true, msg: "Profile updated" })
            else
                resp.status(200).json({ status: false, msg: "Profile not found" })
        })
        .catch((err) => {
            resp.status(200).json({ status: false, msg: err.message })
        });
}


// ---------------- FIND CUSTOMER ----------------

function doFindCustomer(req, resp) {

    CustomerColRef.findOne({ emailid: req.body.emailid })
        .then((doc) => {

            if (doc != null)
                resp.status(200).json({ status: true, doc: doc })
            else
                resp.status(200).json({ status: false, msg: "No profile found" })

        })
        .catch((err) => {
            resp.status(200).json({ status: false, msg: err.message })
        });
}


module.exports = { doSaveProfile, doUpdateProfile, doFindCustomer };
