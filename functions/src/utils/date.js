// 日付操作ユーティリティ
function generateDocumentId(areaCode) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  return `${dateStr}-${areaCode}`;
}

module.exports = { generateDocumentId };
