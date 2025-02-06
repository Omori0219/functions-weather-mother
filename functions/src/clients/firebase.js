const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const FirestoreError = class extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = "FirestoreError";
    this.type = type;
  }
};

// Firebase Admin の初期化（多重初期化を防ぐ）
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

async function saveDocument(collection, documentId, data) {
  try {
    const docRef = db.collection(collection).doc(documentId);
    await docRef.set(data);
    return true;
  } catch (error) {
    if (error.code === "permission-denied") {
      throw new FirestoreError("auth", "Firestoreへのアクセス権限がありません", error);
    }
    if (error.code === "not-found") {
      throw new FirestoreError("not_found", "指定されたドキュメントが見つかりません", error);
    }
    throw new FirestoreError("unknown", "Firestoreへの書き込みに失敗", error);
  }
}

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

module.exports = { saveDocument, saveWeatherData };
