/**
 * 天気データ取得サービスのテスト
 * @file testFetchWeather.js
 */

const { fetchWeatherData } = require("../../../../src/services/weather");
const logger = require("../../utils/testLogger");

/**
 * 天気データ取得のテスト実行
 */
const testFetchWeather = async () => {
  logger.startTest("天気データ取得サービスのテスト");
  let success = true;

  try {
    // テストケース1: 東京のデータ取得
    logger.testCase("東京の天気データ取得");
    logger.step("気象庁APIからデータを取得");
    const tokyoData = await fetchWeatherData("130000");

    // 基本的なデータ構造の検証
    logger.step("データ構造の検証");
    const validationPoints = [
      { field: "publishingOffice", type: "string" },
      { field: "reportDatetime", type: "string" },
      { field: "timeSeries", type: "array" },
      { field: "areaCode", value: "130000" },
      { field: "fetchedAt", type: "string" },
    ];

    validationPoints.forEach(({ field, type, value }) => {
      if (value) {
        if (tokyoData[field] !== value) {
          throw new Error(`${field}の値が期待値と異なります: ${tokyoData[field]} !== ${value}`);
        }
        logger.success(`${field}の値を確認`);
      } else {
        if (typeof tokyoData[field] !== type) {
          throw new Error(
            `${field}の型が期待値と異なります: ${typeof tokyoData[field]} !== ${type}`
          );
        }
        logger.success(`${field}の型を確認`);
      }
    });

    // データの内容を表示
    logger.logData("取得したデータ", tokyoData);
    logger.success("東京の天気データ取得テスト成功");

    // テストケース2: 大阪のデータ取得
    logger.testCase("大阪の天気データ取得");
    logger.step("気象庁APIからデータを取得");
    const osakaData = await fetchWeatherData("270000");
    logger.logData("取得したデータ", osakaData);
    logger.success("大阪の天気データ取得テスト成功");
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
  testFetchWeather();
}

module.exports = {
  testFetchWeather,
};
