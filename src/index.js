require("dotenv").config();
const { getGeminiResponse } = require("./gemini-client");

async function main() {
  try {
    const response = await getGeminiResponse();
    console.log("Gemini Response:", response);
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
