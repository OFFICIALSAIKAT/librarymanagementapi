const mongoose = require("mongoose");

const connectToDb = () => {
    mongoose.connect(process.env.DB_URL)
    .then((conn) => {
        console.log("connected to DataBase")
    })
    .catch((err) => {
        console.log(err.message);
        process.exit(1)
    })
}

module.exports = connectToDb