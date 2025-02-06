const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

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

async function saveDocument(collection, documentId, data) {
  try {
    const docRef = db.collection(collection).doc(documentId);
    await docRef.set(data);
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
