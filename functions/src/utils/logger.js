const { logger } = require("firebase-functions/logger");

// ログ出力の統一
function info(message) {
  logger.info(message);
}

function error(message, error) {
  logger.error(message, error);
}

module.exports = { info, error };
