const express = require("express");
const { registerClinician, registerPatient, loginPatient } = require("./../controller/user.controller");

const router  = express.Router();

router.post('/registerclinician',registerClinician);
router.post('/registerpatient',registerPatient);
router.post('/loginpatient',loginPatient);

module.exports = router;