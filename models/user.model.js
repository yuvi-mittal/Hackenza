const mongoose = require("mongoose");
const { Schema } = mongoose;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },

    medicalHistory: { 
        allergies: [{ type: String }], 
        chronicDiseases: [{ type: String }], 
        pastSurgeries: [{ type: String }],
        medications: [{ type: String }] // Long-term medications (NOT current)
    },

    // createdAt: { type: Date, default: Date.now }
},
{ timestamps: true });


module.exports = mongoose.model('Patient', PatientSchema);

const ClinicianSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    phoneNumber: { type: String, required: true },
    currentClinic: { type: String, required: true },
    clinicAddress: { type: String, required: true },
    professionalBio: { type: String },
    // createdAt: { type: Date, default: Date.now }
},
{ timestamps: true });
ClinicianSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    return next();
  })
ClinicianSchema.method('isPasswordCorrect', async function(password){
    // console.log(password);
    return await bcrypt.compare(password,this.password);
  })
ClinicianSchema.method('generateAccessToken', function(){
    return jwt.sign(
      {
        _id : this._id,
        name : this.name,
        email: this.email,
        specialization: this.specialization,
        type : "clinician"
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )
  })
ClinicianSchema.methods.refreshAccessToken = function(){
    return jwt.sign(
      {
        _id : this._id
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
    )
  }


module.exports = mongoose.model("Clinician", ClinicianSchema);


const QuerySchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician' }, // Assigned automatically

    specialization: { type: String, required: true }, // Selected by Patient
    queryText: { type: String, required: true }, // Patient's Query

    currentMedications: [{ type: String }], // Medications specific to this query
    symptoms: [{ type: String }], // Symptoms specific to this query

    aiResponse: { type: String }, // AI Generated Response
    clinicianResponse: { type: String }, // Verified by Clinician

    status: {
        type: String,
        enum: ['pending', 'ai_generated', 'clinician_verified'],
        default: 'pending'
    },

    // timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
},
{ timestamps: true });


const ClinicianNotificationSchema = new mongoose.Schema({
    clinicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinician', required: true }, 
    queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    // createdAt: { type: Date, default: Date.now }
},
{ timestamps: true });

module.exports = mongoose.model('ClinicianNotification', ClinicianNotificationSchema);

const PatientNotificationSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, 
    queryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Query', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    // createdAt: { type: Date, default: Date.now }
},
{ timestamps: true });

module.exports = mongoose.model('PatientNotification', PatientNotificationSchema);

