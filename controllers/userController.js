const User = require('../models/user')
const BigPromise = require("../middleware/bigPromise")
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');

exports.signup = BigPromise(async (req,res,next)=> {
    const { name,email, password} = req.body;
    if (!email || !name || !password) {
        return next(new CustomError('Please send Email , name and password', 400))
    }

   const user = await User.create({
        name,
        email,
        password
    })

    cookieToken(user, res);
})