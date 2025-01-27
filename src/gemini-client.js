const { VertexAI } = require("@google-cloud/vertexai");

// Vertex AI の設定
const projectId = "YOUR_PROJECT_ID";
const location = "us-central1"; // または適切なリージョン
const model = "gemini-pro";

async function getGeminiResponse() {
  // Vertex AI インスタンスの作成
  const vertexAI = new VertexAI({ project: projectId, location: location });

  // モデルの取得
  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: model,
  });

  const prompt = "ユーザーの地域の特色を返してください";
  const userInput = "私は中野区に住んでいます";

  try {
    const request = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${prompt}\n\nユーザー入力: ${userInput}` }],
        },
      ],
    };

    const response = await generativeModel.generateContent(request);
    const result = await response.response;
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

module.exports = { getGeminiResponse };
