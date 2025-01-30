const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { COLLECTION_NAME } = require("../config/constants");
const logger = require("../utils/logger");

// Firebase Admin の初期化（ADCを使用）
admin.initializeApp();

const db = getFirestore();

async function saveWeatherData({
  documentId,
  areaCode,
  weatherForecasts,
  generatedMessage,
  createdat,
}) {
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(documentId);

    await docRef.set({
      area_code: areaCode,
      weather_forecasts: weatherForecasts,
      generated_message: generatedMessage,
      createdat: admin.firestore.Timestamp.fromDate(createdat),
    });

    logger.info("Document successfully written!");
    return true;
  } catch (error) {
    logger.error("Firestore write error", error);
    throw error;
  }
}

module.exports = { saveWeatherData };
