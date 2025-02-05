/**
 * 天気解析サービスのテスト
 * @file testAnalyzeWeather.js
 */

const { analyzeWeather } = require("../../../../src/services/weather");
const { createTestWeatherData } = require("../../utils/testHelper");
const logger = require("../../utils/testLogger");

/**
 * 天気解析のテスト実行
 */
const testAnalyzeWeather = async () => {
  logger.startTest("天気解析サービスのテスト");
  let success = true;

  try {
    // テストケース1: テストデータの解析
    logger.testCase("テストデータの解析");

    // テストデータの作成
    logger.step("テストデータの準備");
    const testData = createTestWeatherData("130000");
    logger.logData("テストデータ", testData);

    // 天気解析の実行
    logger.step("Gemini AIによる解析実行");
    const message = await analyzeWeather(testData);

    // 結果の検証
    logger.step("生成されたメッセージの検証");
    if (!message || typeof message !== "string" || message.length === 0) {
      throw new Error("生成されたメッセージが無効です");
    }

    logger.logData("生成されたメッセージ", message);
    logger.success("メッセージ生成テスト成功");

    // テストケース2: エッジケース（最小データ）
    logger.testCase("最小データセットの解析");

    // 最小データの作成
    logger.step("最小データの準備");
    const minimalData = {
      publishingOffice: "テスト気象台",
      reportDatetime: new Date().toISOString(),
      timeSeries: [
        {
          timeDefines: [new Date().toISOString()],
          areas: {
            area: { name: "テスト地域", code: "130000" },
            weatherCodes: ["100"],
            weathers: ["晴れ"],
          },
        },
      ],
    };
    logger.logData("最小データ", minimalData);

    // 最小データの解析
    logger.step("最小データの解析実行");
    const minimalMessage = await analyzeWeather(minimalData);
    logger.logData("生成されたメッセージ（最小データ）", minimalMessage);
    logger.success("最小データ解析テスト成功");
  } catch (error) {
    success = false;
    logger.error("テスト実行中にエラーが発生", error);
  }

  logger.endTest(success);
  if (!success) {
    process.exit(1);
  }
};

// テストの実行
if (require.main === module) {
  testAnalyzeWeather();
}

module.exports = {
  testAnalyzeWeather,
};
