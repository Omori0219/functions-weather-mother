/**
 * アプリケーション全体で使用する定数の定義
 * @file constants.js
 */

const API_ENDPOINTS = {
  JMA: "https://www.jma.go.jp/bosai/forecast/data/forecast", // 気象庁API エンドポイント
};

const SCHEDULE = {
  WEATHER_UPDATE: "0 6 * * *", // 毎日午前6時
  NOTIFICATION: "0 7 * * *", // 毎日午前7時
};

const DEFAULTS = {
  AREA_CODE: "130000", // デフォルトエリアコード（東京）
  TIMEZONE: "Asia/Tokyo", // タイムゾーン
};

module.exports = {
  API_ENDPOINTS,
  SCHEDULE,
  DEFAULTS,
};
