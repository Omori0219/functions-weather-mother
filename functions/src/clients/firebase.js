const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { COLLECTION_NAME } = require("../config/constants");
const logger = require("../utils/logger");

// Firebase Admin の初期化（多重初期化を防ぐ）
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

async function saveWeatherData({
  documentId,
  areaCode,
  weatherForecasts,
  generatedMessage,
  createdAt,
}) {
  try {
    // デバッグ: createdAtの型と値を確認
    logger.info("Type of createdAt:", typeof createdAt);
    logger.info("Value of createdAt:", createdAt);

    const docRef = db.collection(COLLECTION_NAME).doc(documentId);

    await docRef.set({
      areaCode,
      weatherForecasts,
      generatedMessage,
      createdAt: Timestamp.fromDate(createdAt),
    });

    logger.info("Document successfully written!");
    return true;
  } catch (error) {
    logger.error("Firestore write error", error);
    throw error;
  }
}

module.exports = { saveWeatherData };
