const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { COLLECTION_NAME } = require("../config/constants");
const logger = require("../utils/logger");

// Firebase Admin の初期化
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "demo-weathermother";
admin.initializeApp({
  projectId: projectId,
});

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

    // Timestampの生成方法を変更
    const timestamp = Timestamp.now();

    await docRef.set({
      areaCode,
      weatherForecasts,
      generatedMessage,
      createdAt: timestamp,
    });

    logger.info("Document successfully written!");
    return true;
  } catch (error) {
    logger.error("Firestore write error", error);
    throw error;
  }
}

module.exports = { saveWeatherData };
