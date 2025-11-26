const express = require("express");
const router = express.Router();
const { generateCaptions } = require("../controllers/captionController");

router.post("/generate-captions", generateCaptions);

module.exports = router;
