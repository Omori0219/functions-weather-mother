/**
 * ロギングユーティリティ
 * @file logger.js
 */

const { isTestEnvironment } = require("../config/environment");

/**
 * ログレベルの定義
 */
const LogLevel = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

/**
 * ログ出力
 * @param {string} level - ログレベル
 * @param {string} message - ログメッセージ
 * @param {Object} [data] - 追加データ
 */
function log(level, message, data = {}) {
  // テスト環境では詳細なログを出力
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
    environment: process.env.NODE_ENV || "development",
  };

  // テスト環境では色付きで出力
  if (isTestEnvironment) {
    const colors = {
      DEBUG: "\x1b[36m", // シアン
      INFO: "\x1b[32m", // 緑
      WARN: "\x1b[33m", // 黄
      ERROR: "\x1b[31m", // 赤
    };
    const reset = "\x1b[0m";
    console.log(`${colors[level]}[${level}]${reset} ${message}`);
    if (Object.keys(data).length > 0) {
      console.log(data);
    }
  } else {
    console.log(JSON.stringify(logData));
  }
}

/**
 * デバッグログ
 * @param {string} message - ログメッセージ
 * @param {Object} [data] - 追加データ
 */
function debug(message, data = {}) {
  log(LogLevel.DEBUG, message, data);
}

/**
 * 情報ログ
 * @param {string} message - ログメッセージ
 * @param {Object} [data] - 追加データ
 */
function info(message, data = {}) {
  log(LogLevel.INFO, message, data);
}

/**
 * 警告ログ
 * @param {string} message - ログメッセージ
 * @param {Object} [data] - 追加データ
 */
function warn(message, data = {}) {
  log(LogLevel.WARN, message, data);
}

/**
 * エラーログ
 * @param {string} message - ログメッセージ
 * @param {Object} [data] - 追加データ
 */
function error(message, data = {}) {
  log(LogLevel.ERROR, message, data);
}

module.exports = {
  LogLevel,
  debug,
  info,
  warn,
  error,
};
