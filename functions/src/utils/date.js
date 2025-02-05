/**
 * 日付ユーティリティ
 * アプリケーション全体で使用する日付関連の機能を提供します
 */

/**
 * 日付をYYYYMMDD形式の文字列に変換
 * @param {Date} date - 変換する日付
 * @returns {string} YYYYMMDD形式の文字列
 */
function formatDateToString(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "");
}

/**
 * YYYYMMDD形式の文字列をDateオブジェクトに変換
 * @param {string} dateString - YYYYMMDD形式の文字列
 * @returns {Date} 変換された日付オブジェクト
 */
function parseStringToDate(dateString) {
  if (!/^\d{8}$/.test(dateString)) {
    throw new Error("無効な日付形式です。YYYYMMDDの形式である必要があります。");
  }

  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1; // 月は0から始まる
  const day = parseInt(dateString.substring(6, 8), 10);

  const date = new Date(year, month, day);

  // 日付の妥当性チェック
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    throw new Error("無効な日付です");
  }

  return date;
}

/**
 * 日付が有効かどうかをチェック
 * @param {string|Date} date - チェックする日付
 * @returns {boolean} 日付が有効な場合はtrue
 */
function isValidDate(date) {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }

  if (typeof date === "string") {
    try {
      parseStringToDate(date);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

module.exports = {
  formatDateToString,
  parseStringToDate,
  isValidDate,
};
