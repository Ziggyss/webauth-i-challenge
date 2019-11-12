const express = require("express");
const router = express.Router();

router.get("/", restricted, (req, res) => {
  res.send("Restricted path working");
});

function restricted(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(400).json({ message: "You shall not pass!" });
  }
}

module.exports = router;
