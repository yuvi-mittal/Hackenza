const { response } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asynchandler = require("../utils/asynchandler");
const Clinician = require("../models/clinician.model");
const Patient = require("../models/patient.model");
const APIError = require("../utils/APIError");

const generateRefreshAccessToken = async (user) => {
    try {
        const accessToken = jwt.sign(
            { _id: user._id, name: user.name, email: user.email, type: "patient" },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        user.refreshToken = refreshToken;
        await user.save(); // Save the refresh token in the database

        return { accessToken, refreshToken };
    } catch (error) {
        throw new APIError(400, "Failed to generate tokens");
    }
};

exports.registerClinician = asynchandler(async (req, res) => {
    const {
        name,
        email,
        password,
        specialization,
        yearsOfExperience,
        phoneNumber,
        currentClinic,
        clinicAddress,
        professionalBio,
    } = req.body;

    if ([email, password, specialization, name].some((field) => !field?.trim())) {
        throw new APIError(400, "All required fields must be provided");
    }

    let clinician = await Clinician.findOne({ email });
    if (clinician) {
        throw new APIError(400, "Clinician email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    clinician = new Clinician({
        name,
        email,
        password: hashedPassword,
        specialization,
        yearsOfExperience,
        phoneNumber,
        currentClinic,
        clinicAddress,
        professionalBio,
    });

    await clinician.save();
    res.status(201).json({ msg: "Clinician registered successfully" });
});

exports.registerPatient = asynchandler(async (req, res) => {
    const { name, email, password, dateOfBirth, gender, medicalHistory } = req.body;

    if (!name || !email || !password || !dateOfBirth || !gender) {
        throw new APIError(400, "All fields are required");
    }

    let patient = await Patient.findOne({ email });
    if (patient) {
        throw new APIError(400, "Patient email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    patient = new Patient({
        name,
        email,
        password: hashedPassword,
        dateOfBirth,
        gender,
        medicalHistory,
    });

    await patient.save();

    const tokens = await generateRefreshAccessToken(patient);

    res.status(201).json({ msg: "Patient registered successfully", ...tokens });
});

exports.loginPatient = asynchandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new APIError(400, "Email and password are required");
    }

    const patient = await Patient.findOne({ email });
    if (!patient) {
        throw new APIError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
        throw new APIError(401, "Invalid credentials");
    }

    const tokens = await generateRefreshAccessToken(patient);

    res.json({ msg: "Login successful", ...tokens });
});
