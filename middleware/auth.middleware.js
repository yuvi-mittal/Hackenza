const APIError = require('./../utils/APIError');
const jwt = require('jsonwebtoken');
const asynchandler = require('./../utils/asynchandler');
const User = require("./../models/User");

const verifyJWT = asynchandler(async(req,_,next)=>{

    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log("Middleware checkpoint: ",token);
        if(!token){
            throw new APIError(401,"Unauthorized Access");
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        // remove the password and refreshtoken from the field of response
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        // const user = await User.findOne({name : 'aryan'});

        if(!user){
            throw new APIError(400,"Invalid Token");
        }
    
        req.user = user;
        next()
    }
    catch(err){
        next(err);
    }
})

module.exports = {verifyJWT};