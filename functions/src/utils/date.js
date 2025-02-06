// 日付操作ユーティリティ

// 日本時間用のフォーマッタをキャッシュ
const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * 日本時間でドキュメントIDを生成する
 * @param {string} areaCode - 地域コード
 * @returns {string} YYYYMMDD-areaCode 形式の文字列
 */
function generateDocumentId(areaCode) {
  const now = new Date();
  const [{ value: year }, , { value: month }, , { value: day }] = dateFormatter.formatToParts(now);
  const dateStr = `${year}${month}${day}`;
  return `${dateStr}-${areaCode}`;
}

module.exports = { generateDocumentId };
