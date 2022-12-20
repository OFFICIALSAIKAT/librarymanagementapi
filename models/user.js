const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide a name"],
    maxlength: [40, "Name should be under 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Provide a email"],
    validate: [validator.isEmail, "Please enter email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Provide a password"],
    minlength: [8, "Password should be minimum 8 characters"],
    select: false,
  },
  role: {
    type: String,
    default: "user",
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry:Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypt password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.IsvalidatedPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getJwtToken = function () {
 return jwt.sign({ id: this._id }, 
    process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

userSchema.methods.getForgotPassword = function(){
   const forgotToken = crypto.randomBytes(20).toString('hex')
   this.forgotPasswordToken = crypto.createHash('sha256').update(forgotToken).digest('hex')

   this.forgotPasswordTokenExpiry = Date.now()+ 20*60*1000

   return forgotToken
}

module.exports = mongoose.model("User", userSchema);
