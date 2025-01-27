const { VertexAI } = require("@google-cloud/vertexai");
const { GoogleAuth } = require("google-auth-library");

// Vertex AI の設定
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = "us-central1"; // または適切なリージョン
const model = "gemini-pro";

// 認証情報のデバッグ
async function checkAuth() {
  const auth = new GoogleAuth();
  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  console.log("Using project:", projectId);
  console.log("Auth client:", client.constructor.name);
}

async function getGeminiResponse() {
  // ADCを使用するため、認証情報の明示的な指定は不要
  const vertexAI = new VertexAI({
    project: projectId,
    location: location,
  });

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

// getGeminiResponse関数の前で呼び出し
checkAuth().catch(console.error);

module.exports = { getGeminiResponse };
