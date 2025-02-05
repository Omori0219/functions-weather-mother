/**
 * テスト用ロガー
 * @file testLogger.js
 */

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

/**
 * テスト用ロガー
 */
const testLogger = {
  /**
   * テスト開始を記録
   * @param {string} name - テスト名
   */
  startTest: (name) => {
    console.log(
      "\n" + colors.bright + "=".repeat(20) + " テスト開始 " + "=".repeat(20) + colors.reset
    );
    console.log(colors.bright + name + colors.reset);
    console.log(colors.bright + "=".repeat(50) + colors.reset + "\n");
  },

  /**
   * テストケースを記録
   * @param {string} name - テストケース名
   */
  testCase: (name) => {
    console.log("\n" + colors.yellow + "▶ テストケース: " + name + colors.reset);
  },

  /**
   * テストステップを記録
   * @param {string} name - ステップ名
   */
  step: (name) => {
    console.log(colors.blue + "→ " + name + colors.reset);
  },

  /**
   * データを記録
   * @param {string} label - ラベル
   * @param {any} data - データ
   */
  logData: (label, data) => {
    console.log(colors.dim + "# " + label + colors.reset);
    if (typeof data === "object") {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(data);
    }
  },

  /**
   * 成功を記録
   * @param {string} message - メッセージ
   */
  success: (message) => {
    console.log(colors.green + "✓ " + message + colors.reset);
  },

  /**
   * エラーを記録
   * @param {string} message - メッセージ
   * @param {Error} [error] - エラーオブジェクト
   */
  error: (message, error) => {
    console.error(colors.red + "✗ " + message + colors.reset);
    if (error) {
      console.error(colors.red + error.stack + colors.reset);
    }
  },

  /**
   * テスト終了を記録
   * @param {boolean} success - テストが成功したかどうか
   */
  endTest: (success = true) => {
    console.log(
      "\n" + colors.bright + "=".repeat(20) + " テスト終了 " + "=".repeat(20) + colors.reset
    );
    if (success) {
      console.log(colors.green + "テスト成功" + colors.reset);
    } else {
      console.log(colors.red + "テスト失敗" + colors.reset);
    }
    console.log(colors.bright + "=".repeat(50) + colors.reset + "\n");
  },
};

module.exports = testLogger;
