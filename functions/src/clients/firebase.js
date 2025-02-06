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
    logger.debug("Saving weather data", {
      documentId,
      areaCode,
      createdAtType: typeof createdAt,
      createdAtValue: createdAt,
    });

    const docRef = db.collection(COLLECTION_NAME).doc(documentId);

    await docRef.set({
      areaCode,
      weatherForecasts,
      generatedMessage,
      createdAt: Timestamp.fromDate(createdAt),
    });

    logger.info("天気予報データの保存に成功しました", {
      documentId,
      areaCode,
    });
    return true;
  } catch (error) {
    logger.error("Firestoreへの書き込みに失敗しました", error, {
      documentId,
      areaCode,
    });
    throw error;
  }
}

module.exports = { saveWeatherData };
