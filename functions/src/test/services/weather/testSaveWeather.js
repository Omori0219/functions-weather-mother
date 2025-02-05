/**
 * メッセージ保存のテスト
 */

const { saveWeatherMessage } = require("../../../services/weather");
const { initializeFirebase, cleanupTestData } = require("../../utils/testHelper");
const { COLLECTIONS } = require("../../../config");
const logger = require("../../utils/testLogger");

const testSaveWeather = async () => {
  let success = true;
  logger.startTest("メッセージ保存テスト");

  try {
    // Firebaseの初期化
    initializeFirebase();

    // テストケース1: 有効なデータを保存
    logger.testCase("有効なデータを保存");
    const validData = {
      message: "テスト天気メッセージ",
      areaCode: "130000",
      areaName: "東京",
      isTest: true,
    };
    const docId = await saveWeatherMessage(validData);

    // 保存結果の検証
    if (!docId) {
      throw new Error("ドキュメントIDが返されませんでした");
    }
    logger.success("メッセージを正常に保存しました");
    logger.logData("ドキュメントID", docId);

    // テストケース2: 無効なデータを保存
    logger.testCase("無効なデータを保存");
    try {
      const invalidData = {
        // 必須フィールドを欠落
        areaCode: "130000",
        isTest: true,
      };
      await saveWeatherMessage(invalidData);
      throw new Error("無効なデータが保存されてしまいました");
    } catch (error) {
      if (error.message === "無効なデータが保存されてしまいました") {
        throw error;
      }
      logger.success("無効なデータは適切に拒否されました");
    }
  } catch (error) {
    success = false;
    logger.error("メッセージの保存に失敗しました", error);
  } finally {
    // テストデータのクリーンアップ
    try {
      await cleanupTestData(COLLECTIONS.WEATHER_MESSAGES);
    } catch (error) {
      logger.error("テストデータのクリーンアップに失敗しました", error);
    }
  }

  logger.endTest(success);
  return success;
};

// スクリプトが直接実行された場合のみテストを実行
if (require.main === module) {
  testSaveWeather();
}

module.exports = testSaveWeather;
