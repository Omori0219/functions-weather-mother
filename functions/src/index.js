// テスト用の関数を追加
exports.generateWeatherMessagesTest = functions.https.onRequest(async (req, res) => {
  logger.info("テスト用天気予報メッセージ生成処理を開始します...");
  logger.info("==== テストバッチ処理開始 ====");

  // テスト用の都道府県コードリスト
  const testAreaCodes = [
    { code: "016000", name: "北海道" }, // 北日本
    { code: "130000", name: "東京都" }, // 関東
    { code: "270000", name: "大阪府" }, // 関西
    { code: "470000", name: "沖縄県" }, // 南日本
  ];

  try {
    // テスト用の都道府県のみ処理
    for (const area of testAreaCodes) {
      logger.info(`${area.name}の処理を開始...`);
      await processArea(area.code);
      logger.info(`${area.name}の処理が完了しました！`);
    }
    logger.info("==== テストバッチ処理完了 ====");
    res.send("Test completed successfully");
  } catch (error) {
    logger.error("テスト実行中にエラーが発生しました", error);
    res.status(500).send(error);
  }
});
