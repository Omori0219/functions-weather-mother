const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleAuth } = require("google-auth-library");

// 認証情報のデバッグ
async function checkAuth() {
  const auth = new GoogleAuth();
  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  console.log("Using project:", projectId);
  console.log("Auth client:", client.constructor.name);
}

// Firebase Admin の初期化（ADCを使用）
admin.initializeApp({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const db = getFirestore();

async function saveWeatherData() {
  try {
    const docRef = db.collection("weather_data").doc("20250127-130000");

    await docRef.set({
      area_code: "130000",
      weather_forecasts: "dummy_weather_data",
      generated_message: "お昼は10℃くらいだけど、明日の朝は2℃まで冷え込むらしいから、あったかくして行きなさいね。",
      createdat: admin.firestore.Timestamp.fromMillis(1737954452000), // Unix timestamp を milliseconds に変換
    });

    console.log("Document successfully written!");
    return true;
  } catch (error) {
    console.error("Error writing document: ", error);
    throw error;
  }
}

// 認証情報の確認
checkAuth().catch(console.error);

module.exports = { saveWeatherData };
