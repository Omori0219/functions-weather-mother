require("dotenv").config();
const { getWeatherForecast } = require("./weather-client");
const { getGeminiResponse } = require("./gemini-client");
const { saveWeatherData } = require("./firebase-client");

// 定数
const AREA_CODE = "130000"; // 東京
const WEATHER_PROMPT = "この天気予報の情報を一般家庭のお母さんが朝のテレビで知ったとします。その後、家を出かけようとした女子高生の娘に対して今日の天気に対して話すだろうセリフを出力してください";

// 日付からドキュメントIDを生成
function generateDocumentId(areaCode) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  return `${dateStr}-${areaCode}`;
}

async function processWeatherData() {
  try {
    // 1. 天気予報の取得
    console.log("天気予報を取得中...");
    const weatherData = await getWeatherForecast(AREA_CODE);

    // 2. Geminiでメッセージ生成
    console.log("メッセージを生成中...");
    const prompt = `${WEATHER_PROMPT}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;
    const generatedMessage = await getGeminiResponse(prompt);

    // 3. Firestoreにデータを保存
    console.log("データを保存中...");
    const documentId = generateDocumentId(AREA_CODE);
    await saveWeatherData({
      documentId,
      areaCode: AREA_CODE,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage,
      createdat: new Date(),
    });

    console.log("処理が完了しました！");
    return { weatherData, generatedMessage };
  } catch (error) {
    console.error("エラーが発生しました:", error);
    throw error;
  }
}

// テスト用の実行コード
if (require.main === module) {
  processWeatherData()
    .then((result) => {
      console.log("\n生成されたメッセージ:", result.generatedMessage);
    })
    .catch((error) => {
      console.error("実行エラー:", error);
      process.exit(1);
    });
}

module.exports = { processWeatherData };
