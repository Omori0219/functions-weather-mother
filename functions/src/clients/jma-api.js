/**
 * 気象庁API クライアント
 * @file jma-api.js
 */

const axios = require("axios");
const logger = require("../utils/logger");
const { JMA_API_ENDPOINT } = require("../config/constants");

/**
 * 気象庁APIクライアント
 */
const jmaApi = {
  /**
   * 指定された地域の天気予報を取得
   * @param {string} areaCode - 地域コード
   * @returns {Promise<Object>} 天気予報データ
   * @throws {Error} API通信エラー
   */
  async fetchWeatherForecast(areaCode) {
    try {
      logger.info(`気象庁APIリクエスト開始: ${areaCode}`);

      const response = await axios.get(`${JMA_API_ENDPOINT}/${areaCode}`);

      logger.info(`気象庁APIリクエスト完了: ${areaCode}`);
      return response.data;
    } catch (error) {
      logger.error("気象庁APIリクエストエラー", {
        areaCode,
        error: error.message,
      });
      throw error;
    }
  },
};

module.exports = jmaApi;
