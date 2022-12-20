const User = require("../models/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!email || !name || !password) {
    return next(new CustomError("Please send Email , name and password", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new CustomError("You are not registered", 400));
  }

  const isPasswordCorrect = await user.IsvalidatedPassword(password);

  if (!isPasswordCorrect) {
    return next(
      new CustomError("Email and Password doesnot match or exists", 400)
    );
  }

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new CustomError("Email not exists!", 400));
  }

  const forgotToken = user.getForgotPassword();

  await user.save({ validateBeforeSave: false });

  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  const message = `copy paste this link to your url and hit enter \n\n\n ${myUrl}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Library Store - Password Reset Mail",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    forgotPasswordToken = undefined;
    forgotPasswordTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new CustomError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encrytoken = crypto.createHash("sha256").update(token).digest("hex");

  //find a user based on encrytoken
  const user = await User.findOne({
    encrytoken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired!", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("password and confirm password donot match!", 400)
    );
  }

  user.password = req.body.password;

  forgotPasswordToken = undefined;
  forgotPasswordTokenExpiry = undefined;

  await user.save();

  cookieToken(user, res);

});
