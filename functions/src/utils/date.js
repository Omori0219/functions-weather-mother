/**
 * 日付操作ユーティリティ
 * @file date.js
 */

const { DEFAULTS } = require("../config/constants");

/**
 * 現在の日本時間を取得
 * @returns {Date} 日本時間のDateオブジェクト
 */
const getCurrentJSTDate = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: DEFAULTS.TIMEZONE }));
};

/**
 * 日付をYYYYMMDD形式の文字列に変換
 * @param {Date} date - 対象の日付
 * @returns {string} YYYYMMDD形式の文字列
 */
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

/**
 * ドキュメントIDを生成（エリアコード_YYYYMMDD形式）
 * @param {string} areaCode - 地域コード
 * @returns {string} 生成されたドキュメントID
 */
const generateDocumentId = (areaCode) => {
  const date = getCurrentJSTDate();
  return `${areaCode}_${formatDateToYYYYMMDD(date)}`;
};

/**
 * 指定された日付が今日かどうかを判定
 * @param {Date} date - 判定する日付
 * @returns {boolean} 今日の日付の場合はtrue
 */
function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

module.exports = {
  getCurrentJSTDate,
  formatDateToYYYYMMDD,
  generateDocumentId,
  isToday,
};
