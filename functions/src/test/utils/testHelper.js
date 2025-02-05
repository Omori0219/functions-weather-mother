/**
 * テストデータの作成や後処理を管理するユーティリティ
 */

const admin = require("firebase-admin");
const { COLLECTIONS } = require("../../config");

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  return admin.firestore();
};

const createTestWeatherData = (areaCode = "130000") => {
  return {
    publishingOffice: "テスト気象台",
    reportDatetime: new Date().toISOString(),
    timeSeries: [
      {
        timeDefines: [
          new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        ],
        areas: [
          {
            area: { name: "テストエリア", code: areaCode },
            weatherCodes: ["100", "200"],
            weathers: ["晴れ", "曇り"],
            winds: ["北の風", "南の風"],
            waves: ["1m", "2m"],
          },
        ],
      },
    ],
  };
};

const cleanupTestData = async (collection, queryField = "isTest") => {
  const db = initializeFirebase();
  const snapshot = await db.collection(collection).where(queryField, "==", true).get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  if (snapshot.size > 0) {
    await batch.commit();
    console.log(`${snapshot.size}件のテストデータを削除しました`);
  }
};

const saveTemporaryTestData = async (collection, data) => {
  const db = initializeFirebase();
  const testData = {
    ...data,
    isTest: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection(collection).add(testData);
  return docRef.id;
};

module.exports = {
  initializeFirebase,
  createTestWeatherData,
  cleanupTestData,
  saveTemporaryTestData,
};
