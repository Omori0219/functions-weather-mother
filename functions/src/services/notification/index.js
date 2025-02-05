/**
 * 通知サービスモジュールのエクスポート
 * @file index.js
 */

const { sendNotification } = require("./sendNotification");

module.exports = {
  sendNotification,
};
