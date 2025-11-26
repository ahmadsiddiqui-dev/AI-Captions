const { generateWithAI } = require("../services/ai.service");
const multer = require("multer");

const upload = multer().array("images", 5);

exports.generateCaptions = (req, res) => {
  upload(req, res, async () => {
    try {
      const files = req.files || [];
      const options = JSON.parse(req.body.options || "{}");

      const captions = await generateWithAI(files, options);

      res.json({ captions });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
};
