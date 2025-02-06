const { saveWeatherData } = require("../../../clients/firebase");
const logger = require("../../../utils/logger");

async function storeMessage(areaCode, message, weatherData) {
  try {
    await saveWeatherData(areaCode, message, weatherData);
  } catch (error) {
    logger.error("メッセージと天気データの保存中にエラーが発生", error, {
      areaCode,
    });
    error.step = "store_message";
    throw error;
  }
}

module.exports = { storeMessage };
