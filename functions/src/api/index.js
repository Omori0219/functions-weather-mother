/**
 * APIのエントリーポイント
 * HTTPエンドポイントをまとめて管理します
 */

const { testNotifications } = require("./notifications");
const { getWeatherForecast } = require("./weather");

module.exports = {
  testNotifications,
  getWeatherForecast,
};
