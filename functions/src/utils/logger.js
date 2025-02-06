/**
 * アプリケーション全体で使用するロガーモジュール
 * 標準ではINFOレベル以上のログを出力し、開発環境（NODE_ENV=development）の場合のみDEBUGログも出力します
 */
const logger = {
  /**
   * デバッグ情報を出力します（開発環境のみ）
   * @param {string} message - ログメッセージ
   * @param {Object} meta - 追加のメタデータ
   */
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        JSON.stringify({
          level: "DEBUG",
          message,
          ...meta,
          env: process.env.NODE_ENV || "production",
          timestamp: new Date().toISOString(),
        })
      );
    }
  },

  /**
   * 情報レベルのログを出力します
   * @param {string} message - ログメッセージ
   * @param {Object} meta - 追加のメタデータ
   */
  info: (message, meta = {}) => {
    console.log(
      JSON.stringify({
        level: "INFO",
        message,
        ...meta,
        env: process.env.NODE_ENV || "production",
        timestamp: new Date().toISOString(),
      })
    );
  },

  /**
   * エラー情報を出力します
   * @param {string} message - エラーメッセージ
   * @param {Error|null} error - エラーオブジェクト
   * @param {Object} meta - 追加のメタデータ
   */
  error: (message, error = null, meta = {}) => {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message,
        errorStack: error?.stack || error?.message,
        ...meta,
        env: process.env.NODE_ENV || "production",
        timestamp: new Date().toISOString(),
      })
    );
  },
};

module.exports = logger;
