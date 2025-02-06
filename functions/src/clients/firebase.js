const admin = require("firebase-admin");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const FirestoreError = class extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = "FirestoreError";
    this.type = type;
    if (originalError) {
      this.cause = originalError;
    }
  }
};

// Firebase Admin の初期化（多重初期化を防ぐ）
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

/**
 * JavaScriptのDateオブジェクトをFirestore Timestampに変換
 * @param {Object} data - 変換対象のデータオブジェクト
 * @returns {Object} Timestamp型に変換されたデータオブジェクト
 */
function convertDatesToTimestamps(data) {
  const converted = { ...data };
  for (const [key, value] of Object.entries(converted)) {
    if (value instanceof Date) {
      converted[key] = Timestamp.fromDate(value);
    }
  }
  return converted;
}

async function saveDocument(collection, documentId, data) {
  try {
    const docRef = db.collection(collection).doc(documentId);
    const convertedData = convertDatesToTimestamps(data);
    await docRef.set(convertedData);
    return { success: true, docRef };
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

module.exports = { saveDocument };
