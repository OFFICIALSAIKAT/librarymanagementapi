const express = require ('express')
require('dotenv').config()
const app = express();
var morgan = require('morgan')
const cookieParser = require('cookie-parser')

//morgan middleware
app.use(morgan("tiny"))

//for json in form-data
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//cookies
app.use(cookieParser())

//import all routes here
const home = require('./routes/home')
const user = require('./routes/user')
//router middleware
app.use('/api/v1', home)
app.use('/api/v1', user)

//export app.js
module.exports = app;