/**
 * 天気メッセージ保存サービスのテスト
 * @file testSaveWeather.js
 */

const { saveWeatherMessage } = require("../../../../src/services/weather");
const {
  initializeFirebase,
  createTestWeatherData,
  cleanupTestData,
} = require("../../utils/testHelper");
const logger = require("../../utils/testLogger");
const { COLLECTIONS } = require("../../../../src/config/firestore");

/**
 * 天気メッセージ保存のテスト実行
 */
const testSaveWeather = async () => {
  logger.startTest("天気メッセージ保存サービスのテスト");
  let success = true;
  let testDocId = null;

  try {
    // Firebase初期化
    logger.step("Firebase初期化");
    initializeFirebase();

    // テストケース1: 通常データの保存
    logger.testCase("通常データの保存");

    // テストデータの準備
    logger.step("テストデータの準備");
    const areaCode = "130000";
    const weatherData = createTestWeatherData(areaCode);
    const message = "今日は良い天気です。傘は必要ありません。";

    // データ保存
    logger.step("Firestoreへの保存実行");
    testDocId = await saveWeatherMessage({
      areaCode,
      weatherData,
      message,
    });

    // 保存結果の検証
    logger.step("保存結果の検証");
    if (!testDocId) {
      throw new Error("ドキュメントIDが返却されませんでした");
    }
    logger.success(`ドキュメントID: ${testDocId}`);

    // テストケース2: エラーケース（無効なデータ）
    logger.testCase("無効なデータの保存");
    try {
      logger.step("無効なデータでの保存実行");
      await saveWeatherMessage({
        areaCode: null,
        weatherData: null,
        message: null,
      });
      throw new Error("エラーが発生すべき処理が成功しました");
    } catch (error) {
      logger.success("期待通りエラーが発生しました");
      logger.logData("エラーメッセージ", error.message);
    }
  } catch (error) {
    success = false;
    logger.error("テスト実行中にエラーが発生", error);
  } finally {
    // テストデータのクリーンアップ
    if (testDocId) {
      logger.step("テストデータのクリーンアップ");
      try {
        await cleanupTestData(COLLECTIONS.WEATHER_DATA, {
          field: "areaCode",
          value: "130000",
        });
        logger.success("テストデータを削除しました");
      } catch (error) {
        logger.error("テストデータの削除に失敗", error);
      }
    }
  }

  logger.endTest(success);
  if (!success) {
    process.exit(1);
  }
};

// テストの実行
if (require.main === module) {
  testSaveWeather();
}

module.exports = {
  testSaveWeather,
};
