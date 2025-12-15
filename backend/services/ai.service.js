const sharp = require("sharp");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert images
async function processImages(files) {
  const converted = [];
  for (let img of files) {
    const buffer = await sharp(img.buffer)
      .resize(900)
      .jpeg({ quality: 85 })
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

// Build prompt
function buildPrompt(options, hasImages) {
  return `
You are a professional Instagram caption writer who produces natural, aesthetic, human-sounding captions.

Your task: Create **TWO different captions** that feel:
• genuine  
• emotional or aesthetic  
• natural, modern, human-written  
• NOT robotic, NOT generic, NOT repetitive  

USER SETTINGS:
• Mood: ${options.mood}
• Length: ${options.length}
• Emojis: ${options.useEmoji ? `yes, up to ${options.emojiCount}` : "no emojis"}
• Hashtags: ${options.useHashtags ? `yes, up to ${options.hashtagCount}` : "no hashtags"}
• Language: ${options.language}
• User Message (context): ${options.message || "Not Provided"}

STYLE RULES:
1. Captions must feel organic and human.
2. Do NOT describe the image literally. Focus on emotion, vibe, story.
3. Avoid clichés.
4. Match the selected mood.
5. Add hashtags at the end only if requested.
6. Output ONLY the captions.

${
  hasImages
    ? "Images WERE uploaded — captions MUST align with the vibe, feeling, aesthetic, or mood of the photos."
    : `No images uploaded — use ONLY this message:\n"${options.message}"`
}

Return EXACTLY:

CAPTION_ONE:
<caption text>

CAPTION_TWO:
<caption text>
`;
}

// Parse model output
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

  
  let model;
  try {
    model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
  } catch (err) {
    console.warn("Fallback model activated:", err);
    model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-8b" });
  }

  const result = await model.generateContent([
    { text: prompt },
    ...imageInputs,
  ]);

  const output = result.response.text();
  const [cap1, cap2] = parseOutput(output);

  return [
    { text: cap1 },
    { text: cap2 },
  ];
};
