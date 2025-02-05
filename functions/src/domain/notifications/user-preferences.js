/**
 * ユーザー設定管理機能
 * 通知に関するユーザー設定を管理します
 */

const { getUser, updateUser, getNotificationUsers } = require("../../clients/firestore");
const logger = require("../../utils/logger");

/**
 * ユーザーの通知設定を取得
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object|null>} ユーザーの通知設定
 */
async function getUserNotificationSettings(userId) {
  try {
    logger.info(`ユーザーの通知設定を取得中... (ユーザーID: ${userId})`);
    const user = await getUser(userId);

    if (!user) {
      logger.info("ユーザーが見つかりませんでした");
      return null;
    }

    const settings = {
      isPushNotificationEnabled: user.isPushNotificationEnabled || false,
      expoPushToken: user.expoPushToken || null,
      areaCode: user.areaCode || null,
      updatedAt: user.updatedAt || null,
    };

    logger.info("通知設定の取得が完了しました");
    return settings;
  } catch (error) {
    logger.error("通知設定の取得に失敗しました", error);
    throw error;
  }
}

/**
 * ユーザーの通知設定を更新
 * @param {string} userId - ユーザーID
 * @param {Object} settings - 更新する設定
 * @param {boolean} [settings.isPushNotificationEnabled] - 通知の有効/無効
 * @param {string} [settings.expoPushToken] - プッシュ通知トークン
 * @param {string} [settings.areaCode] - 地域コード
 * @returns {Promise<void>}
 */
async function updateNotificationSettings(userId, settings) {
  try {
    logger.info(`ユーザーの通知設定を更新中... (ユーザーID: ${userId})`);

    // 設定の妥当性チェック
    if (settings.expoPushToken && typeof settings.expoPushToken !== "string") {
      throw new Error("プッシュ通知トークンが不正です");
    }
    if (settings.areaCode && typeof settings.areaCode !== "string") {
      throw new Error("地域コードが不正です");
    }
    if (
      settings.isPushNotificationEnabled !== undefined &&
      typeof settings.isPushNotificationEnabled !== "boolean"
    ) {
      throw new Error("通知設定が不正です");
    }

    // 設定を更新
    await updateUser(userId, settings);
    logger.info("通知設定の更新が完了しました");
  } catch (error) {
    logger.error("通知設定の更新に失敗しました", error);
    throw error;
  }
}

/**
 * 通知を受け取るユーザーのリストを取得
 * @returns {Promise<Array<Object>>} 通知対象ユーザーのリスト
 */
async function getActiveNotificationUsers() {
  try {
    logger.info("通知対象ユーザーを取得中...");
    const users = await getNotificationUsers();

    // 必要な情報のみを抽出
    const activeUsers = users
      .filter((user) => user.expoPushToken && user.areaCode)
      .map((user) => ({
        id: user.id,
        expoPushToken: user.expoPushToken,
        areaCode: user.areaCode,
      }));

    logger.info(`${activeUsers.length}人の通知対象ユーザーを取得しました`);
    return activeUsers;
  } catch (error) {
    logger.error("通知対象ユーザーの取得に失敗しました", error);
    throw error;
  }
}

module.exports = {
  getUserNotificationSettings,
  updateNotificationSettings,
  getActiveNotificationUsers,
};
