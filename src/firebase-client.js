const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Firebase Admin の初期化
const serviceAccount = require("../" + process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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

module.exports = { saveWeatherData };
