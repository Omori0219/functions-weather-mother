/**
 * 天気解析のテスト
 */

const { analyzeWeather } = require("../../../services/weather");
const { createTestWeatherData } = require("../../utils/testHelper");
const logger = require("../../utils/testLogger");

const testAnalyzeWeather = async () => {
  let success = true;
  logger.startTest("天気解析テスト");

  try {
    // テストケース1: 通常の天気データを解析
    logger.testCase("通常の天気データを解析");
    const weatherData = createTestWeatherData();
    const message = await analyzeWeather(weatherData);

    // メッセージの検証
    if (!message || typeof message !== "string" || message.length === 0) {
      throw new Error("メッセージの生成に失敗しました");
    }
    logger.success("天気データを正常に解析しました");
    logger.logData("生成メッセージ", message);

    // テストケース2: 最小限のデータを解析
    logger.testCase("最小限のデータを解析");
    const minimalData = {
      publishingOffice: "テスト気象台",
      reportDatetime: new Date().toISOString(),
      timeSeries: [
        {
          timeDefines: [new Date().toISOString()],
          areas: [
            {
              area: { name: "テストエリア", code: "130000" },
              weatherCodes: ["100"],
              weathers: ["晴れ"],
            },
          ],
        },
      ],
    };
    const minimalMessage = await analyzeWeather(minimalData);

    // メッセージの検証
    if (!minimalMessage || typeof minimalMessage !== "string" || minimalMessage.length === 0) {
      throw new Error("最小限データのメッセージ生成に失敗しました");
    }
    logger.success("最小限データを正常に解析しました");
    logger.logData("生成メッセージ", minimalMessage);
  } catch (error) {
    success = false;
    logger.error("天気データの解析に失敗しました", error);
  }

  logger.endTest(success);
  return success;
};

// スクリプトが直接実行された場合のみテストを実行
if (require.main === module) {
  testAnalyzeWeather();
}

module.exports = testAnalyzeWeather;
