/**
 * 天気予報APIクライアント
 * 気象庁APIから天気予報データを取得し、ドメインで使用しやすい形に変換します
 */

const { getWeatherForecast } = require("../../clients/jma");
const logger = require("../../utils/logger");

/**
 * 天気予報データを取得して整形
 * @param {string} areaCode - 地域コード
 * @returns {Promise<Object>} 整形された天気予報データ
 */
async function fetchWeatherData(areaCode) {
  try {
    logger.info(`天気予報データを取得中... (地域コード: ${areaCode})`);
    const rawWeatherData = await getWeatherForecast(areaCode);

    // 必要なデータを抽出して整形
    const weatherData = {
      areaCode,
      areaName: rawWeatherData[0]?.timeSeries[0]?.areas[0]?.area?.name,
      forecasts: rawWeatherData[0]?.timeSeries[0]?.areas[0]?.weatherCodes?.map((code, index) => ({
        date: rawWeatherData[0]?.timeSeries[0]?.timeDefines[index],
        weatherCode: code,
        weather: rawWeatherData[0]?.timeSeries[0]?.areas[0]?.weathers[index],
        temperature: {
          min: rawWeatherData[1]?.timeSeries[1]?.areas[0]?.temps[index * 2],
          max: rawWeatherData[1]?.timeSeries[1]?.areas[0]?.temps[index * 2 + 1],
        },
      })),
      precipitation: rawWeatherData[0]?.timeSeries[1]?.areas[0]?.pops?.map((pop, index) => ({
        time: rawWeatherData[0]?.timeSeries[1]?.timeDefines[index],
        probability: pop,
      })),
    };

    // データの妥当性チェック
    if (!weatherData.areaName || !weatherData.forecasts?.length) {
      logger.error("無効な天気予報データを受信しました", weatherData);
      throw new Error("天気予報データの形式が不正です");
    }

    logger.info("天気予報データの取得が完了しました");
    return weatherData;
  } catch (error) {
    logger.error("天気予報データの取得に失敗しました", error);
    throw error;
  }
}

module.exports = { fetchWeatherData };
