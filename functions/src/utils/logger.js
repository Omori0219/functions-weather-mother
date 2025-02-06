/**
 * アプリケーション全体で使用するロガーモジュール
 * 開発時は全てのログレベルを出力し、本番環境ではINFO以上のログのみを出力します
 */
const logger = {
  /**
   * デバッグ情報を出力します（開発環境のみ）
   * @param {string} message - ログメッセージ
   * @param {Object} meta - 追加のメタデータ
   */
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        JSON.stringify({
          level: "DEBUG",
          message,
          ...meta,
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
        error: error?.stack || error?.message,
        ...meta,
        timestamp: new Date().toISOString(),
      })
    );
  },
};

module.exports = logger;
