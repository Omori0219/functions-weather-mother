/**
 * テスト用ヘルパー関数群
 * @file test-helper.js
 */

const admin = require("firebase-admin");
const { isTestEnvironment } = require("../../src/config/environment");

class TestDataManager {
  constructor() {
    this.createdUserIds = [];
    this.createdWeatherIds = [];
  }

  /**
   * テスト用のユーザーを作成
   * @param {Object} userData - ユーザーデータ
   * @returns {Promise<string>} - ユーザーID
   */
  async createTestUser(userData) {
    if (!isTestEnvironment) {
      throw new Error("テスト環境でのみ実行可能です");
    }

    const db = admin.firestore();
    const userRef = await db.collection("users").add({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    this.createdUserIds.push(userRef.id);
    return userRef.id;
  }

  /**
   * テスト用の天気情報を作成
   * @param {string} areaCode - 地域コード
   * @returns {Promise<string>} - ドキュメントID
   */
  async createTestWeather(areaCode) {
    if (!isTestEnvironment) {
      throw new Error("テスト環境でのみ実行可能です");
    }

    const db = admin.firestore();
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const docId = `${formattedDate}-${areaCode}`;

    await db
      .collection("weather_data")
      .doc(docId)
      .set({
        areaCode: areaCode,
        weatherForecasts: JSON.stringify({ test: "data" }),
        generatedMessage: `これはテスト用の天気予報です。地域コード: ${areaCode}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    this.createdWeatherIds.push(docId);
    return docId;
  }

  /**
   * テストデータをクリーンアップ
   */
  async cleanup() {
    if (!isTestEnvironment) {
      throw new Error("テスト環境でのみ実行可能です");
    }

    const db = admin.firestore();
    const batch = db.batch();

    // ユーザーの削除
    this.createdUserIds.forEach((userId) => {
      batch.delete(db.collection("users").doc(userId));
    });

    // 天気情報の削除
    this.createdWeatherIds.forEach((weatherId) => {
      batch.delete(db.collection("weather_data").doc(weatherId));
    });

    await batch.commit();

    // 配列をクリア
    this.createdUserIds = [];
    this.createdWeatherIds = [];
  }
}

module.exports = { TestDataManager };
