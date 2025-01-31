// ログ出力の統一
function info(message) {
  console.log(`[INFO] ${message}`);
}

function error(message, error) {
  console.error(`[ERROR] ${message}`, error);
}

module.exports = { info, error };
