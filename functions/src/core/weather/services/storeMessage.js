const { saveWeatherData } = require("../../../clients/firebase");
const { generateDocumentId } = require("../../../utils/date");
const logger = require("../../../utils/logger");

async function storeMessage(areaCode, message, weatherData) {
  try {
    const documentId = generateDocumentId(areaCode);
    const now = new Date();

    logger.debug("Firestoreにデータを保存", {
      documentId,
      areaCode,
      messageLength: message.length,
      timestamp: now.toISOString(),
    });

    await saveWeatherData({
      documentId,
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: message,
      createdAt: now,
    });
  } catch (error) {
    logger.error("メッセージと天気データの保存中にエラーが発生", error, {
      areaCode,
    });
    error.step = "store_message";
    throw error;
  }
}

module.exports = { storeMessage };
