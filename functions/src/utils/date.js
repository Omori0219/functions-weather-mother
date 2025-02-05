/**
 * 日付操作ユーティリティ
 * @file date.js
 */

/**
 * 天気データのドキュメントIDを生成
 * @param {string} areaCode - 地域コード
 * @returns {string} ドキュメントID（YYYYMMDD-areaCode形式）
 */
function generateDocumentId(areaCode) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  return `${dateStr}-${areaCode}`;
}

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
  generateDocumentId,
  isToday,
};
