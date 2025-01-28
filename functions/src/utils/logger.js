/**
 * Cloud Logging用のロガー
 * 構造化ログを出力し、Cloud Loggingでの分析を容易にします
 */
const logger = {
  /**
   * INFO レベルのログを出力
   * @param {string} message - ログメッセージ
   * @param {Object} [data] - 追加のログデータ
   */
  info: (message, data = {}) => {
    console.log(
      JSON.stringify({
        severity: "INFO",
        message,
        ...data,
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * ERROR レベルのログを出力
   * @param {string} message - エラーメッセージ
   * @param {Error|Object} [error] - エラーオブジェクトまたは追加データ
   */
  error: (message, error = {}) => {
    console.error(
      JSON.stringify({
        severity: "ERROR",
        message,
        ...(error instanceof Error
          ? {
              errorMessage: error.message,
              stack: error.stack,
              code: error.code,
            }
          : error),
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * WARNING レベルのログを出力
   * @param {string} message - 警告メッセージ
   * @param {Object} [data] - 追加のログデータ
   */
  warn: (message, data = {}) => {
    console.warn(
      JSON.stringify({
        severity: "WARNING",
        message,
        ...data,
        timestamp: new Date().toISOString(),
      })
    );
  },
};

module.exports = logger;
