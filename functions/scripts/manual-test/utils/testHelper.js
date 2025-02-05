/**
 * テストヘルパー関数
 * @file testHelper.js
 */

const admin = require("firebase-admin");
const { COLLECTIONS } = require("../../../src/config/firestore");

/**
 * Firebase Admin の初期化
 */
const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  return admin;
};

/**
 * テストデータの作成
 * @param {string} areaCode - 地域コード
 * @returns {Object} テスト用の天気予報データ
 */
const createTestWeatherData = (areaCode) => {
  return {
    publishingOffice: "テスト気象台",
    reportDatetime: new Date().toISOString(),
    timeSeries: [
      {
        timeDefines: [
          new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1時間後
          new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2時間後
        ],
        areas: {
          area: {
            name: "テスト地域",
            code: areaCode,
          },
          weatherCodes: ["100", "200"],
          weathers: ["晴れ", "くもり"],
          winds: ["北の風", "南の風"],
          waves: ["0.5メートル", "1メートル"],
        },
      },
    ],
    areaCode,
    fetchedAt: new Date().toISOString(),
  };
};

/**
 * テストデータのクリーンアップ
 * @param {string} collectionName - コレクション名
 * @param {Object} query - 検索クエリ
 */
const cleanupTestData = async (collectionName, query) => {
  const db = admin.firestore();
  const snapshot = await db.collection(collectionName).where(query.field, "==", query.value).get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

/**
 * 一時的なテストデータの保存
 * @param {string} collectionName - コレクション名
 * @param {Object} data - 保存するデータ
 * @returns {string} ドキュメントID
 */
const saveTemporaryTestData = async (collectionName, data) => {
  const db = admin.firestore();
  const docRef = await db.collection(collectionName).add({
    ...data,
    isTestData: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

module.exports = {
  initializeFirebase,
  createTestWeatherData,
  cleanupTestData,
  saveTemporaryTestData,
};
