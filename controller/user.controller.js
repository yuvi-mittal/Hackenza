const { response } = require("express");
const asynchandler = require("../utils/asynchandler");
const Clinician = require("./../models/user.model");
const APIError = require("./../utils/APIError");
const ApiResponse = require("./../utils/APIResponse");

const generateRefreshAccessToken = async (user_id) => {
    try{
        const user = await Clinician.findById(user_id);
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.refreshAccessToken();
        user.refrestoken = refreshToken;
        user.save();

        return {accessToken, refreshToken};
    }
    catch{
        throw new APIError(400, "Not able to generate Access and RefreshToken");
    }
}

exports.registerClinician = asynchandler(async (req,res)=>{
    const { name, email, password, specialization, yearsOfExperience, phoneNumber, currentClinic, clinicAddress, professionalBio } = req.body;
    if(
        [email, password,specialization,name].some((field) => field?.trim() === "")
    ){
        throw new APIError(400, "All fields required");
    }
     
    let clinician = await Clinician.findOne({email});
    if(
        clinician
    ){
        throw new APIError(400, "Clinician email already Exists");
    }
    clinician = new Clinician({
        name,
        email,
        password,
        specialization,
        yearsOfExperience,
        phoneNumber,
        currentClinic,
        clinicAddress,
        professionalBio,
    });
    await clinician.save();
    res.status(201)
        .json({ msg: "Clinician registered successfully" });
});

