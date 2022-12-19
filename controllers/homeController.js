const BigPromise = require("../middleware/bigPromise");

exports.home = BigPromise(async(req, res) => {
    res.status(200).json({
      message: true,
      greeting: "Hello from API",
    });
  });