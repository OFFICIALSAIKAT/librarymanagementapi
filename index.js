const app = require('./app')
const connectToDb = require('./config/db')
require('dotenv').config()

connectToDb()

app.listen(process.env.PORT , () => {
    console.log(`server is running at port: ${process.env.PORT}`)
})