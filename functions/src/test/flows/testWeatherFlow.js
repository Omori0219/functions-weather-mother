/**
 * 天気予報フローの統合テスト
 */

const {
  fetchWeatherData,
  analyzeWeather,
  saveWeatherMessage,
} = require("../../../services/weather");
const { initializeFirebase, cleanupTestData } = require("../../utils/testHelper");
const { COLLECTIONS } = require("../../../config");
const logger = require("../../utils/testLogger");

const testWeatherFlow = async () => {
  let success = true;
  logger.startTest("天気予報フロー統合テスト");

  try {
    // Firebaseの初期化
    initializeFirebase();

    // ステップ1: 天気データの取得
    logger.step("天気データを取得中...");
    const weatherData = await fetchWeatherData("130000");
    if (!weatherData) {
      throw new Error("天気データの取得に失敗しました");
    }
    logger.success("天気データを取得しました");
    logger.logData("取得データ", weatherData);

    // ステップ2: 天気データの解析
    logger.step("天気データを解析中...");
    const message = await analyzeWeather(weatherData);
    if (!message) {
      throw new Error("天気データの解析に失敗しました");
    }
    logger.success("天気データを解析しました");
    logger.logData("生成メッセージ", message);

    // ステップ3: メッセージの保存
    logger.step("メッセージを保存中...");
    const saveData = {
      message,
      areaCode: "130000",
      areaName: "東京",
      isTest: true,
    };
    const docId = await saveWeatherMessage(saveData);
    if (!docId) {
      throw new Error("メッセージの保存に失敗しました");
    }
    logger.success("メッセージを保存しました");
    logger.logData("ドキュメントID", docId);
  } catch (error) {
    success = false;
    logger.error("天気予報フローの実行に失敗しました", error);
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
  testWeatherFlow();
}

module.exports = testWeatherFlow;
