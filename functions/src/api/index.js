/**
 * APIのエントリーポイント
 * HTTPエンドポイントをまとめて管理します
 */

const { testNotifications } = require("./notifications");
const { getWeatherForecast } = require("./weather");
const {
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification,
} = require("./notifications");

module.exports = {
  testNotifications,
  getWeatherForecast,
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification,
};
