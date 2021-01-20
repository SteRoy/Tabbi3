const router = require('express').Router();

router.use("/accounts", require("./accounts"));

module.exports = router;