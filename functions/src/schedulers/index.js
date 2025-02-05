/**
 * スケジューラのエントリーポイント
 * 定期実行する処理をまとめて管理します
 */

const { fetchDailyWeatherForecast } = require("./weather-scheduler");
const { sendDailyWeatherNotifications } = require("./notification-scheduler");

module.exports = {
  fetchDailyWeatherForecast,
  sendDailyWeatherNotifications,
};
