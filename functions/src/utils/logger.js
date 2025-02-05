/**
 * ロギングユーティリティ
 * @file logger.js
 */

const { isProductionEnvironment } = require("../config/environment");

// ログレベルの定義
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// 現在の環境に応じたログレベルの設定
const currentLogLevel = isProductionEnvironment ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * タイムスタンプ付きのメッセージを生成
 * @param {string} level - ログレベル
 * @param {string} message - ログメッセージ
 * @param {Object} [data] - 追加データ
 * @returns {string} フォーマットされたログメッセージ
 */
const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const dataString = data ? `\n${JSON.stringify(data, null, 2)}` : "";
  return `[${timestamp}] ${level}: ${message}${dataString}`;
};

const logger = {
  error: (message, data) => {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error(formatMessage("ERROR", message, data));
    }
  },

  warn: (message, data) => {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(formatMessage("WARN", message, data));
    }
  },

  info: (message, data) => {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      console.info(formatMessage("INFO", message, data));
    }
  },

  debug: (message, data) => {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      console.debug(formatMessage("DEBUG", message, data));
    }
  },
};

module.exports = logger;
