const sharp = require("sharp");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processImages(files) {
  const converted = [];
  for (let img of files) {
    const buffer = await sharp(img.buffer)
      .resize(640)
      .jpeg({ quality: 70 })
      .toBuffer();
    converted.push({
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "image/jpeg",
      },
    });
  }
  return converted;
}

function buildPrompt(options, hasImages) {
  return `
You are an expert Instagram caption writer.

Generate **TWO different captions** that:
- sound natural and human
- match the selected mood
- feel emotional or aesthetic
- are modern, clean, and non-generic
- are NOT robotic or repetitive

SETTINGS:
Mood: ${options.mood}
Length: ${options.length}
Language: ${options.language}
Emojis: ${
  options.emojiCount && options.emojiCount !== "Off"
    ? `allowed, up to ${options.emojiCount === "Auto" ? 5 : options.emojiCount}`
    : "not allowed"
}
Hashtags: ${
  options.hashtagCount && options.hashtagCount !== "Off"
    ? `allowed, up to ${options.hashtagCount === "Auto" ? 8 : options.hashtagCount}`
    : "not allowed"
}
User context: ${options.message || "None"}

RULES:
- Do NOT describe the image literally
- Capture emotion, vibe, or moment instead
- Avoid clichés
- Keep tone consistent with mood
- If used, place hashtags at the end
- Output captions only (no explanations)

${
  hasImages
    ? "Images are provided — use their vibe and feeling only."
    : `No images — base captions only on this text:\n"${options.message}"`
}

Return EXACTLY:

CAPTION_ONE:
<caption>

CAPTION_TWO:
<caption>
`;
}

function parseOutput(text) {
  const cap1 = text
    .split("CAPTION_TWO:")[0]
    .replace("CAPTION_ONE:", "")
    .trim();
  const cap2 = text.split("CAPTION_TWO:")[1]?.trim() || cap1;
  return [cap1, cap2];
}

exports.generateWithAI = async (files, options) => {
  const hasImages = files && files.length > 0;

  if (!hasImages && (!options.message || options.message.trim().length < 3)) {
    throw new Error("Please enter a description to generate a caption without photos.");
  }

  let imageInputs = [];
  if (hasImages) {
    imageInputs = await processImages(files);
  }

  const prompt = buildPrompt(options, hasImages);

  // Use supported model gemini-2.5-flash
  let model;
  try {
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  } catch (err) {
    // Fallback: try another model name if first fails
    console.warn("Model gemini-2.5-flash not available, fallback to gemini-2.0-flash-exp", err);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  const result = await model.generateContent([
    { text: prompt },
    ...imageInputs,
  ]);

  // 🔹 ADDED (SAFE): TOKEN LOGGING ONLY — NO RETURN CHANGE
  const usage = result.response?.usageMetadata;
  if (usage) {
    console.log("Gemini token usage:", {
      input: usage.promptTokenCount,
      output: usage.candidatesTokenCount,
      total: usage.totalTokenCount,
    });
  }
  // 🔹 END ADDED

  const output = result.response.text();
  const [cap1, cap2] = parseOutput(output);

  return [
    { text: cap1 },
    { text: cap2 },
  ];
};
