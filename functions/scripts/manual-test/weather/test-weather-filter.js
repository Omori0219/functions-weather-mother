/**
 * 天気予報データのフィルタリング処理の動作確認
 * @file test-weather-filter.js
 */

const { getWeatherForecast } = require("../../../../src/clients/weather");

// 東京都の地域コード
const TEST_AREA_CODE = "130000";

async function testWeatherFilter() {
  console.log("=== 天気予報データフィルタリングテスト開始 ===");
  console.log(`テスト対象地域コード: ${TEST_AREA_CODE}`);

  try {
    // 実際にAPIを呼び出してデータを取得
    const weatherData = await getWeatherForecast(TEST_AREA_CODE);

    // 結果を確認
    console.log("\n=== 取得したデータ ===");
    console.log(JSON.stringify(weatherData, null, 2));

    // データ構造の確認
    console.log("\n=== データ構造の確認 ===");
    console.log("publishingOffice:", weatherData.publishingOffice);
    console.log("reportDatetime:", weatherData.reportDatetime);
    console.log("timeSeries の数:", weatherData.timeSeries.length);

    // 週間予報データが含まれていないことを確認
    console.log("\n=== 週間予報データの確認 ===");
    console.log("平均気温データの有無:", weatherData.hasOwnProperty("平均気温") ? "あり" : "なし");
    console.log(
      "平均降水量データの有無:",
      weatherData.hasOwnProperty("平均降水量") ? "あり" : "なし"
    );

    console.log("\n=== テスト完了 ===");
  } catch (error) {
    console.error("\n=== テスト実行中にエラーが発生 ===");
    console.error(error);
  }
}

// テストの実行
testWeatherFilter();
