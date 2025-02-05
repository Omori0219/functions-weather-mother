/**
 * ロガーユーティリティ
 * アプリケーション全体で統一されたログ出力を提供します
 */

const { logger } = require("firebase-functions");

/**
 * ログレベルに応じた色付けを行う
 * @param {string} level - ログレベル
 * @param {string} message - ログメッセージ
 * @returns {string} 色付けされたメッセージ
 */
function colorize(level, message) {
  const colors = {
    info: "\x1b[32m", // 緑
    warn: "\x1b[33m", // 黄
    error: "\x1b[31m", // 赤
    debug: "\x1b[36m", // シアン
  };
  const reset = "\x1b[0m";
  return `${colors[level] || ""}${message}${reset}`;
}

/**
 * オブジェクトを文字列に変換
 * @param {*} data - 変換対象のデータ
 * @returns {string} 文字列化されたデータ
 */
function stringify(data) {
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return `[変換不可: ${error.message}]`;
  }
}

/**
 * カスタムロガー
 */
const customLogger = {
  /**
   * 情報ログ
   * @param {string} message - ログメッセージ
   * @param {*} [data] - 追加データ
   */
  info(message, data) {
    const logMessage = data ? `${message} ${stringify(data)}` : message;
    logger.info(colorize("info", `[INFO] ${logMessage}`));
  },

  /**
   * 警告ログ
   * @param {string} message - ログメッセージ
   * @param {*} [data] - 追加データ
   */
  warn(message, data) {
    const logMessage = data ? `${message} ${stringify(data)}` : message;
    logger.warn(colorize("warn", `[WARN] ${logMessage}`));
  },

  /**
   * エラーログ
   * @param {string} message - ログメッセージ
   * @param {Error|*} [error] - エラーオブジェクトまたは追加データ
   */
  error(message, error) {
    let errorMessage = message;
    if (error) {
      if (error instanceof Error) {
        errorMessage += `\nエラー: ${error.message}\nスタックトレース:\n${error.stack}`;
      } else {
        errorMessage += ` ${stringify(error)}`;
      }
    }
    logger.error(colorize("error", `[ERROR] ${errorMessage}`));
  },

  /**
   * デバッグログ
   * @param {string} message - ログメッセージ
   * @param {*} [data] - 追加データ
   */
  debug(message, data) {
    if (process.env.NODE_ENV === "development") {
      const logMessage = data ? `${message} ${stringify(data)}` : message;
      logger.debug(colorize("debug", `[DEBUG] ${logMessage}`));
    }
  },
};

module.exports = customLogger;
