/**
 * 気象庁API クライアント
 * @file jma-api.js
 */

const axios = require("axios");
const logger = require("../utils/logger");
const { API_ENDPOINTS } = require("../config/constants");

/**
 * 気象庁APIから天気予報データを取得
 * @param {string} areaCode - 地域コード
 * @returns {Promise<Object>} 天気予報データ
 * @throws {Error} API通信エラー
 */
const fetchWeatherForecast = async (areaCode) => {
  try {
    logger.info(`気象データ取得開始: ${areaCode}`);

    const url = `${API_ENDPOINTS.JMA}/${areaCode}.json`;
    const response = await axios.get(url);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response format from JMA API");
    }

    logger.info(`気象データ取得成功: ${areaCode}`);
    return response.data[0]; // 最初の予報データセットを返す
  } catch (error) {
    logger.error("気象データ取得エラー", {
      areaCode,
      error: error.message,
      status: error.response?.status,
    });
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

module.exports = {
  fetchWeatherForecast,
};
