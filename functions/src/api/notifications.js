/**
 * 通知API
 * 通知の送信と設定管理のエンドポイントを提供します
 */

const { onRequest } = require("firebase-functions/v2/https");
const {
  sendWeatherNotificationToUser,
  getUserNotificationSettings,
  updateNotificationSettings,
} = require("../domain/notifications");
const { API_TIMEOUT_SECONDS, API_MEMORY, REGION, TEST_SECRET } = require("../config/env");
const logger = require("../utils/logger");

/**
 * Basic認証のチェック
 * @param {Object} req - リクエストオブジェクト
 * @returns {boolean} 認証が成功したかどうか
 */
function checkBasicAuth(req) {
  const authHeader = req.headers.authorization || "";
  const expectedAuth = `Basic ${Buffer.from(`admin:${TEST_SECRET.value()}`).toString("base64")}`;
  return authHeader === expectedAuth;
}

/**
 * 通知設定を取得
 */
exports.getNotificationSettings = onRequest(
  {
    timeoutSeconds: API_TIMEOUT_SECONDS.value(),
    memory: API_MEMORY.value(),
    region: REGION.value(),
  },
  async (req, res) => {
    try {
      const { userId } = req.query;

      // パラメータのバリデーション
      if (!userId) {
        logger.error("ユーザーIDが指定されていません");
        res.status(400).json({
          status: "error",
          error: "ユーザーIDが必要です",
        });
        return;
      }

      logger.info(`通知設定を取得します: ${userId}`);

      // 通知設定を取得
      const settings = await getUserNotificationSettings(userId);

      if (!settings) {
        res.status(404).json({
          status: "error",
          error: "ユーザーが見つかりません",
        });
        return;
      }

      res.json({
        status: "success",
        data: settings,
      });
    } catch (error) {
      logger.error("通知設定の取得でエラーが発生しました:", error);
      res.status(500).json({
        status: "error",
        error: "通知設定の取得に失敗しました",
      });
    }
  }
);

/**
 * 通知設定を更新
 */
exports.updateNotificationSettings = onRequest(
  {
    timeoutSeconds: API_TIMEOUT_SECONDS.value(),
    memory: API_MEMORY.value(),
    region: REGION.value(),
  },
  async (req, res) => {
    try {
      const { userId } = req.query;
      const settings = req.body;

      // パラメータのバリデーション
      if (!userId) {
        logger.error("ユーザーIDが指定されていません");
        res.status(400).json({
          status: "error",
          error: "ユーザーIDが必要です",
        });
        return;
      }

      if (!settings || typeof settings !== "object") {
        logger.error("通知設定が不正です", { settings });
        res.status(400).json({
          status: "error",
          error: "通知設定が必要です",
        });
        return;
      }

      logger.info(`通知設定を更新します: ${userId}`);

      // 通知設定を更新
      await updateNotificationSettings(userId, settings);

      res.json({
        status: "success",
      });
    } catch (error) {
      logger.error("通知設定の更新でエラーが発生しました:", error);
      res.status(500).json({
        status: "error",
        error: "通知設定の更新に失敗しました",
      });
    }
  }
);

/**
 * テスト通知を送信
 */
exports.sendTestNotification = onRequest(
  {
    timeoutSeconds: API_TIMEOUT_SECONDS.value(),
    memory: API_MEMORY.value(),
    region: REGION.value(),
  },
  async (req, res) => {
    try {
      // Basic認証のチェック
      if (!checkBasicAuth(req)) {
        res.status(401).json({
          status: "error",
          error: "認証が必要です",
        });
        return;
      }

      const { userId } = req.body;

      // パラメータのバリデーション
      if (!userId) {
        logger.error("ユーザーIDが指定されていません");
        res.status(400).json({
          status: "error",
          error: "ユーザーIDが必要です",
        });
        return;
      }

      logger.info(`テスト通知を送信します: ${userId}`);

      // 通知を送信
      const result = await sendWeatherNotificationToUser(userId);

      res.json({
        status: "success",
        data: {
          sent: result,
        },
      });
    } catch (error) {
      logger.error("テスト通知の送信でエラーが発生しました:", error);
      res.status(500).json({
        status: "error",
        error: "テスト通知の送信に失敗しました",
      });
    }
  }
);
