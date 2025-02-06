const { saveDocument } = require("../../../clients/firebase");
const { generateDocumentId } = require("../../../utils/date");
const { COLLECTION_NAME } = require("../../../config/constants");
const logger = require("../../../utils/logger");

async function storeMessage(areaCode, message, weatherData) {
  try {
    const documentId = generateDocumentId(areaCode);
    const now = new Date();

    logger.debug("天気予報データの保存を開始", {
      documentId,
      areaCode,
      messageLength: message.length,
      timestamp: now.toISOString(),
    });

    // 保存するデータの整形
    const data = {
      areaCode,
      weatherForecasts: JSON.stringify(weatherData),
      generatedMessage: message,
      createdAt: now,
    };

    // データの検証
    if (!message || typeof message !== "string") {
      throw new Error("不正なメッセージ形式");
    }

    await saveDocument(COLLECTION_NAME, documentId, data);

    logger.info("天気予報データの保存が完了", {
      documentId,
      areaCode,
    });
  } catch (error) {
    logger.error("天気予報データの保存中にエラーが発生", error, {
      areaCode,
      step: "store_message",
    });
    throw error;
  }
}

module.exports = { storeMessage };
