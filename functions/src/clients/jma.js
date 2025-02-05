/**
 * 気象庁APIクライアント
 * 気象庁APIから天気予報データを取得します
 */

const axios = require("axios");
const logger = require("../utils/logger");

// 気象庁APIのベースURL
const JMA_API_BASE_URL = "https://www.jma.go.jp/bosai/forecast/data/forecast";

/**
 * 天気予報を取得
 * @param {string} areaCode - 地域コード
 * @returns {Promise<Array<Object>>} 天気予報データ
 */
async function getWeatherForecast(areaCode) {
  try {
    logger.info(`気象庁APIから天気予報を取得中... (地域コード: ${areaCode})`);
    const url = `${JMA_API_BASE_URL}/${areaCode}.json`;
    const response = await axios.get(url, {
      headers: {
        "Accept-Encoding": "gzip",
      },
      timeout: 10000, // 10秒でタイムアウト
    });

    if (!response.data || !Array.isArray(response.data)) {
      logger.error("無効な天気予報データを受信しました");
      throw new Error("無効な天気予報データです");
    }

    logger.info("天気予報の取得が完了しました");
    return response.data;
  } catch (error) {
    if (error.response) {
      // APIからのエラーレスポンス
      logger.error("気象庁APIからエラーレスポンスを受信しました", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // リクエストは送信されたがレスポンスが受信できない
      logger.error("気象庁APIからレスポンスを受信できませんでした", error.request);
    } else {
      // リクエストの作成時にエラーが発生
      logger.error("気象庁APIリクエストの作成に失敗しました", error.message);
    }
    throw error;
  }
}

module.exports = { getWeatherForecast };
