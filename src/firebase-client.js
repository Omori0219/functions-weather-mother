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

async function saveWeatherData({ documentId, areaCode, weatherForecasts, generatedMessage, createdat }) {
  try {
    const docRef = db.collection("weather_data").doc(documentId);

    await docRef.set({
      area_code: areaCode,
      weather_forecasts: weatherForecasts,
      generated_message: generatedMessage,
      createdat: admin.firestore.Timestamp.fromDate(createdat),
    });

    console.log("Document successfully written!");
    return true;
  } catch (error) {
    console.error("Firestore Error:", error);
    throw error;
  }
}

// 認証情報の確認
checkAuth().catch(console.error);

module.exports = { saveWeatherData };
