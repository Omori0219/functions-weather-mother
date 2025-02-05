/**
 * ID生成ユーティリティ
 * データストアで使用する各種IDを生成します
 */

const { formatDateToString } = require("./date");
const logger = require("./logger");

/**
 * 天気予報データのドキュメントIDを生成
 * @param {string} areaCode - 地域コード
 * @param {Date} [date=new Date()] - 対象日付（省略時は当日）
 * @returns {string} ドキュメントID（形式: YYYYMMDD-areaCode）
 */
function generateWeatherDocumentId(areaCode, date = new Date()) {
  try {
    if (!areaCode) {
      throw new Error("地域コードが指定されていません");
    }

    const formattedDate = formatDateToString(date);
    return `${formattedDate}-${areaCode}`;
  } catch (error) {
    logger.error("天気予報ドキュメントIDの生成に失敗しました", error);
    throw error;
  }
}

/**
 * 通知履歴のドキュメントIDを生成
 * @param {string} userId - ユーザーID
 * @param {Date} [date=new Date()] - 送信日時（省略時は現在時刻）
 * @returns {string} ドキュメントID（形式: userId-YYYYMMDD-HHmmss）
 */
function generateNotificationHistoryId(userId, date = new Date()) {
  try {
    if (!userId) {
      throw new Error("ユーザーIDが指定されていません");
    }

    const timestamp = date
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);
    return `${userId}-${timestamp}`;
  } catch (error) {
    logger.error("通知履歴IDの生成に失敗しました", error);
    throw error;
  }
}

module.exports = {
  generateWeatherDocumentId,
  generateNotificationHistoryId,
};
