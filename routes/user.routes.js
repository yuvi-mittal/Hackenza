const express = require("express");
const { registerClinician } = require("./../controller/user.controller");

router  = express.Router();

router.post('/register',registerClinician);

module.exports = router;