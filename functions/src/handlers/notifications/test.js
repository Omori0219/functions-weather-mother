const { onRequest } = require("firebase-functions/v2/https");
const {
  testBasicNotification,
  testMissingWeatherData,
  testMultipleUsers,
  testRealWeatherNotification,
} = require("../../core/testNotifications");
const logger = require("../../utils/logger");

// プッシュ通知のテスト用エンドポイント
exports.testNotifications = onRequest(
  {
    timeoutSeconds: 540, // タイムアウト: 9分
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async (req, res) => {
    // Basic認証チェック
    const authHeader = req.headers.authorization || "";
    const expectedAuth = `Basic ${Buffer.from(`admin:${process.env.TEST_SECRET}`).toString(
      "base64"
    )}`;

    if (authHeader !== expectedAuth) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      logger.info("プッシュ通知テストを開始します...");
      const { testType, expoPushToken, expoPushTokens } = req.body;

      let result;
      switch (testType) {
        case "basic":
          if (!expoPushToken) {
            throw new Error("expoPushTokenが必要です");
          }
          result = await testBasicNotification(expoPushToken);
          break;

        case "missingWeather":
          if (!expoPushToken) {
            throw new Error("expoPushTokenが必要です");
          }
          result = await testMissingWeatherData(expoPushToken);
          break;

        case "multipleUsers":
          if (!expoPushTokens || !Array.isArray(expoPushTokens)) {
            throw new Error("expoPushTokensの配列が必要です");
          }
          result = await testMultipleUsers(expoPushTokens);
          break;

        case "realWeather":
          result = await testRealWeatherNotification();
          break;

        default:
          throw new Error("無効なテストタイプです");
      }

      logger.info("テスト結果:", result);
      res.json(result);
    } catch (error) {
      logger.error("テスト実行中にエラーが発生しました:", error);
      res.status(500).json({
        status: "error",
        error: error.message,
      });
    }
  }
);
