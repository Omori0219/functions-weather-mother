/**
 * Firestore関連の設定
 * @file firestore.js
 */

/**
 * コレクション名の定義
 */
const COLLECTIONS = {
  WEATHER_DATA: "weather_data",
  USERS: "users",
  NOTIFICATIONS: "notifications",
};

/**
 * ドキュメントの最大取得数
 */
const LIMITS = {
  MAX_BATCH_SIZE: 500,
  DEFAULT_PAGE_SIZE: 50,
};

module.exports = {
  COLLECTIONS,
  LIMITS,
};
