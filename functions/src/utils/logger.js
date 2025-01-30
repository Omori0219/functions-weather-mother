// ロガーの初期化
let logger;

try {
  // Firebase Functionsの環境の場合
  const functions = require("firebase-functions");
  logger = functions.logger;
} catch (error) {
  // ローカル環境の場合
  logger = {
    info: (...args) => console.log("[INFO]", ...args),
    error: (...args) => console.error("[ERROR]", ...args),
    warn: (...args) => console.warn("[WARN]", ...args),
    debug: (...args) => console.debug("[DEBUG]", ...args),
  };
}

// ログ出力の統一
function info(message) {
  logger.info(message);
}

function error(message, error) {
  logger.error(message, error);
}

module.exports = { info, error };
