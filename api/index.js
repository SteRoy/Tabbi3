const router = require('express').Router();

router.use("/accounts", require("./accounts"));
router.use("/ballots", require("./ballots"));
router.use("/institutions", require("./institutions"));
router.use("/people", require("./people"));
router.use("/preregistration", require("./preregistration"));
router.use("/tournaments", require("./tournaments"));

module.exports = router;