/**
 * Firestore関連のユーティリティ
 * @file firestore.js
 */

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Firestoreインスタンスを取得する関数
function getDb() {
  // アプリが初期化されていない場合は初期化
  if (admin.apps.length === 0) {
    admin.initializeApp({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
  }
  return getFirestore();
}

module.exports = {
  getDb,
};
