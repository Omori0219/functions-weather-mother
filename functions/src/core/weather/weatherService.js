require("dotenv").config();

const { fetchWeatherData } = require("./services/fetchWeatherData");
const { generateMessage } = require("./services/generateMessage");
const { storeMessage } = require("./services/storeMessage");
const logger = require("../../utils/logger");

async function processWeatherForArea(areaCode) {
  const startTime = Date.now();

  try {
    logger.debug("天気予報データの処理を開始", {
      areaCode,
      timestamp: new Date().toISOString(),
    });

    const weatherData = await fetchWeatherData(areaCode);
    const message = await generateMessage(weatherData);
    await storeMessage(areaCode, message, weatherData);

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    logger.info("天気予報データの処理が完了", {
      areaCode,
      processingTimeMs: processingTime,
      processingTimeSeconds: (processingTime / 1000).toFixed(3),
    });

    return { weatherData, message };
  } catch (error) {
    logger.error("天気予報データの処理中にエラーが発生", error, {
      areaCode,
      step: error.step || "unknown",
      processingTimeMs: Date.now() - startTime,
    });
    throw error;
  }
}

// スタンドアロン実行のサポート
if (require.main === module) {
  const defaultAreaCode = "130000"; // デフォルトは東京
  processWeatherForArea(defaultAreaCode)
    .then((result) => {
      logger.info("天気予報メッセージの生成が完了", {
        areaCode: defaultAreaCode,
        messageLength: result.message.length,
      });
      process.exit(0);
    })
    .catch((error) => {
      logger.error("メイン処理でエラーが発生", error, {
        areaCode: defaultAreaCode,
      });
      process.exit(1);
    });
}

module.exports = { processWeatherForArea };
