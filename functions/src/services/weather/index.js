/**
 * 天気サービスモジュールのエクスポート
 * @file index.js
 */

const { fetchWeatherData } = require("./fetchWeatherData");
const { analyzeWeather } = require("./analyzeWeather");
const { saveWeatherMessage } = require("./saveWeatherMessage");

module.exports = {
  fetchWeatherData,
  analyzeWeather,
  saveWeatherMessage,
};
