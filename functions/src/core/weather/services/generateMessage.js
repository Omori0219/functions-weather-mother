const { generateContent } = require("../../../clients/gemini");
const { WEATHER_MOTHER } = require("../../../config/prompts");
const logger = require("../../../utils/logger");

async function generateMessage(weatherData) {
  try {
    logger.debug("メッセージ生成を開始", {
      weatherDataSize: JSON.stringify(weatherData).length,
    });

    const prompt = `${WEATHER_MOTHER}\n\n天気予報データ: ${JSON.stringify(weatherData, null, 2)}`;

    // レスポーススキーマの定義
    const schema = {
      type: "object",
      properties: {
        mother_message: { type: "string" },
      },
      required: ["mother_message"],
    };

    // メッセージの生成
    const rawResponse = await generateContent(prompt, schema);

    // レスポンスのパース
    let response;
    try {
      response = JSON.parse(rawResponse);
    } catch (error) {
      logger.error("メッセージのJSONパースに失敗", error, {
        rawResponse,
      });
      throw new Error("メッセージの形式が不正です");
    }

    logger.info("メッセージ生成が完了", {
      messageLength: response.mother_message.length,
    });

    return response.mother_message;
  } catch (error) {
    logger.error("メッセージ生成中にエラーが発生", error, {
      step: "generate_message",
    });
    throw error;
  }
}

module.exports = { generateMessage };
