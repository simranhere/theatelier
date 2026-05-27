var userController = require("../controllers/userController");
var app = require("express");
var {validateTokenn2} = require("../config/validate")
var router = app.Router();

router.post("/signup", userController.doSignup);
router.post("/login", userController.doLogin);
router.post("/finduser", validateTokenn2, userController.doFindUser);

module.exports = router;