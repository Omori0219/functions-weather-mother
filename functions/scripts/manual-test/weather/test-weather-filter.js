/**
 * 天気予報データのフィルタリング処理の動作確認
 * @file test-weather-filter.js
 *
 * このファイルは気象庁APIから取得した天気予報データから
 * 週間予報データが正しく除外されているかを確認するためのテストスクリプトです。
 */

const { getWeatherForecast } = require("../../../../src/clients/weather");

// 定数定義
/** 東京都の地域コード（気象庁API準拠） */
const TEST_AREA_CODE = "130000";

/**
 * 天気予報データのフィルタリング処理をテストする
 *
 * 以下の項目を確認します：
 * 1. APIからのデータ取得が成功すること
 * 2. 基本的なデータ構造（publishingOffice, reportDatetime, timeSeries）が存在すること
 * 3. 週間予報データ（平均気温、平均降水量）が除外されていること
 *
 * @returns {Promise<void>}
 */
async function testWeatherFilter() {
  console.log("=== 天気予報データフィルタリングテスト開始 ===");
  console.log(`テスト対象地域コード: ${TEST_AREA_CODE}`);

  try {
    // 気象庁APIを呼び出してデータを取得
    // 取得したデータは既にフィルタリング済みであることを期待
    const weatherData = await getWeatherForecast(TEST_AREA_CODE);

    // 取得したデータの全体構造を確認
    console.log("\n=== 取得したデータ ===");
    console.log(JSON.stringify(weatherData, null, 2));

    // 基本データ構造の存在確認
    // publishingOffice: 発表元の気象台
    // reportDatetime: データの発表日時
    // timeSeries: 予報データの時系列情報
    console.log("\n=== データ構造の確認 ===");
    console.log("publishingOffice:", weatherData.publishingOffice);
    console.log("reportDatetime:", weatherData.reportDatetime);
    console.log("timeSeries の数:", weatherData.timeSeries.length);

    // 週間予報データが正しく除外されているか確認
    // 平均気温、平均降水量のプロパティが存在しないことを期待
    console.log("\n=== 週間予報データの確認 ===");
    console.log("平均気温データの有無:", weatherData.hasOwnProperty("平均気温") ? "あり" : "なし");
    console.log(
      "平均降水量データの有無:",
      weatherData.hasOwnProperty("平均降水量") ? "あり" : "なし"
    );

    console.log("\n=== テスト完了 ===");
  } catch (error) {
    // エラーハンドリング
    // APIリクエストの失敗やデータ構造の不整合を検知
    console.error("\n=== テスト実行中にエラーが発生 ===");
    console.error(error);
  }
}

// テストの実行
testWeatherFilter();
