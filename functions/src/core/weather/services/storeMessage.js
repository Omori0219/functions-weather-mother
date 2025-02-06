const { saveDocument } = require("../../../clients/firebase");
const { generateDocumentId } = require("../../../utils/date");
const { COLLECTION_NAME } = require("../../../config/constants");
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

    const data = {
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: message,
      createdAt: now,
    };

    const { success, docRef } = await saveDocument(COLLECTION_NAME, documentId, data);

    logger.info("天気予報データの保存に成功しました", {
      documentId,
      areaCode,
      docPath: docRef.path,
    });

    return { success, docRef };
  } catch (error) {
    logger.error("メッセージと天気データの保存中にエラーが発生", error, {
      areaCode,
    });
    error.step = "store_message";
    throw error;
  }
}

module.exports = { storeMessage };
