var customerController = require("../controllers/customerController");
var app = require("express");
var router = app.Router();

router.post("/saveprofile", customerController.doSaveProfile);
router.post("/updateprofile", customerController.doUpdateProfile);
router.post("/findcustomer", customerController.doFindCustomer);

module.exports = router;