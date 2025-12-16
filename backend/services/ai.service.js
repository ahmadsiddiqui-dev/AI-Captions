const sharp = require("sharp");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processImages(files) {
  const converted = [];
  for (let img of files) {
    const buffer = await sharp(img.buffer)
      .resize(800)
      .jpeg({ quality: 80 })
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
You are a professional Instagram caption writer who creates natural, aesthetic, human-sounding captions.

Your job is to create **TWO different captions** that feel:
• genuine  
• emotional or aesthetic (based on mood)  
• NOT robotic  
• NOT generic  
• NOT repetitive  
• clean, modern, social-media ready  

USER SETTINGS:
• Mood: ${options.mood}
• Length: ${options.length}
• Emojis: ${options.useEmoji ? `yes, up to ${options.emojiCount}` : "no emojis"}
• Hashtags: ${options.useHashtags ? `yes, up to ${options.hashtagCount}` : "no hashtags"}
• Language: ${options.language}
• User Message (context): ${options.message || "Not Provided"}

STYLE RULES:
1. Captions must sound like a real person wrote them.
2. Do NOT describe the image directly like: “There is a sunset” — instead capture the *emotion, vibe, or moment*.
3. Avoid clichés like “living my best life.”
4. Keep the tone consistent with the selected mood.
5. If hashtags are requested, include them naturally at the end.
6. Avoid announcing the output (no: “Here are your captions”).
7. Write only the captions.

${
  hasImages
    ? "Images WERE uploaded — use the FEELING and VIBE of the photo, not literal description."
    : `No images uploaded — create captions ONLY using this message:\n"${options.message}"`
}

Return EXACTLY this:

CAPTION_ONE:
<caption text>

CAPTION_TWO:
<caption text>
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

  //  TOKEN USAGE
  const usage = result.response.usageMetadata;

  console.log("Gemini token usage:", {
    input: usage.promptTokenCount,
    output: usage.candidatesTokenCount,
    total: usage.totalTokenCount,
  });


  const output = result.response.text();
  const [cap1, cap2] = parseOutput(output);

  return {
    captions: [
      { text: cap1 },
      { text: cap2 },
    ],
    // RETURN TOKEN USAGE
    usage: {
      inputTokens: usage.promptTokenCount,
      outputTokens: usage.candidatesTokenCount,
      totalTokens: usage.totalTokenCount,
    },
  };
};
