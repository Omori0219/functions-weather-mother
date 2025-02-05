/**
 * 天気データ取得のテスト
 */

const { fetchWeatherData } = require("../../../services/weather");
const logger = require("../../utils/testLogger");

const testFetchWeather = async () => {
  let success = true;
  logger.startTest("天気データ取得テスト");

  try {
    // テストケース1: 東京の天気データを取得
    logger.testCase("東京の天気データを取得");
    const tokyoData = await fetchWeatherData("130000");

    // データ構造の検証
    if (!tokyoData.publishingOffice || !tokyoData.reportDatetime || !tokyoData.timeSeries) {
      throw new Error("必須フィールドが欠落しています");
    }
    logger.success("東京の天気データを正常に取得しました");
    logger.logData("取得データ", tokyoData);

    // テストケース2: 大阪の天気データを取得
    logger.testCase("大阪の天気データを取得");
    const osakaData = await fetchWeatherData("270000");

    // データ構造の検証
    if (!osakaData.publishingOffice || !osakaData.reportDatetime || !osakaData.timeSeries) {
      throw new Error("必須フィールドが欠落しています");
    }
    logger.success("大阪の天気データを正常に取得しました");
    logger.logData("取得データ", osakaData);
  } catch (error) {
    success = false;
    logger.error("天気データの取得に失敗しました", error);
  }

  logger.endTest(success);
  return success;
};

// スクリプトが直接実行された場合のみテストを実行
if (require.main === module) {
  testFetchWeather();
}

module.exports = testFetchWeather;
