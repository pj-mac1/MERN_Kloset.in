import { pipeline } from "@huggingface/transformers";

let parser = null;

export async function detectClothing(image) {
  console.log("1️⃣ detectClothing() started");
  console.log("Image:", image);

  try {
    if (!parser) {
      console.log("2️⃣ Loading clothing AI model...");

      parser = await pipeline(
        "image-segmentation",
        "faisal-shohag/fashn-human-parser-onnx",
        {
          dtype: "q8",
        }
      );

      console.log("3️⃣ Clothing AI model loaded!");
    }

    console.log("4️⃣ Sending image to AI...");

    const results = await parser(image);

    console.log("5️⃣ AI finished!");
    console.log("Raw results:", results);

    return results;
  } catch (error) {
    console.error("❌ Clothing AI error:", error);
    throw error;
  }
}