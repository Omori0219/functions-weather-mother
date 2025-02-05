/**
 * 天気予報フローの統合テスト
 * @file testWeatherFlow.js
 */

const {
  fetchWeatherData,
  analyzeWeather,
  saveWeatherMessage,
} = require("../../../src/services/weather");
const { initializeFirebase, cleanupTestData } = require("../utils/testHelper");
const logger = require("../utils/testLogger");
const { COLLECTIONS } = require("../../../src/config/firestore");

/**
 * 天気予報フローのテスト実行
 */
const testWeatherFlow = async () => {
  logger.startTest("天気予報フロー統合テスト");
  let success = true;
  let testDocId = null;

  try {
    // Firebase初期化
    logger.step("Firebase初期化");
    initializeFirebase();

    // テストケース: 東京の天気予報フロー
    logger.testCase("東京の天気予報フロー");

    // 1. 天気データ取得
    logger.step("1. 気象庁APIからデータを取得");
    const weatherData = await fetchWeatherData("130000");
    logger.logData("取得した天気データ", weatherData);
    logger.success("天気データ取得完了");

    // 2. 天気解析
    logger.step("2. Gemini AIで天気を解析");
    const message = await analyzeWeather(weatherData);
    logger.logData("生成されたメッセージ", message);
    logger.success("天気解析完了");

    // 3. メッセージ保存
    logger.step("3. Firestoreにメッセージを保存");
    testDocId = await saveWeatherMessage({
      areaCode: "130000",
      weatherData,
      message,
    });
    logger.success(`メッセージを保存完了: ${testDocId}`);

    // フロー全体の成功
    logger.success("天気予報フロー全体が正常に完了");
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
  testWeatherFlow();
}

module.exports = {
  testWeatherFlow,
};
