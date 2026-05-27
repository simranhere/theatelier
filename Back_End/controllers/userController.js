var UserColRef = require("../models/model_user");
var sendEmail  = require("../utils/sendEmail");
var jwt        = require("jsonwebtoken");

function doSignup(req, resp) {
  console.log(req.body);

  let objUserColRef = new UserColRef(req.body);

  objUserColRef.save()
    .then((doc) => {
      return sendEmail(
        doc.emailid,
        "Welcome to The Atelier",
        `<h2></h2><p>Your bespoke journey begins now.</p>`
      ).then(() => doc);
    })
    .then((doc) => {
      resp.status(200).json({ status: true, msg: "User registered successfully & email sent", doc: doc });
    })
    .catch((err) => {
      resp.status(500).json({ status: false, msg: err.message });
    });
}

function doLogin(req, resp) {
  UserColRef.findOne({ emailid: req.body.emailid, pwd: req.body.pwd })
    .then((doc) => {
      if (doc != null) {
        if (doc.status == true) {
          let token = jwt.sign(
            { emailid: req.body.emailid },
            process.env.SEC_KEY,
            { expiresIn: "7d" }
          );

          resp.status(200).json({ status: true, msg: "Login successful", doc: doc, token: token });

        } else {
          resp.status(200).json({ status: false, msg: "Account is deactivated" });
        }
      } else {
        resp.status(200).json({ status: false, msg: "Invalid credentials" });
      }
    })
    .catch((err) => {
      resp.status(500).json({ status: false, msg: err.message });
    });
}

function doFindUser(req, resp) {
  UserColRef.findOne({ emailid: req.body.emailid })
    .then((doc) => {
      if (doc != null)
        resp.status(200).json({ status: true, doc: doc });
      else
        resp.status(200).json({ status: false, msg: "Invalid User" });
    })
    .catch((err) => {
      resp.status(200).json({ status: false, msg: err.message });
    });
}

module.exports = { doSignup, doLogin, doFindUser };