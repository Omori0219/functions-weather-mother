/**
 * ユーザー設定管理機能
 * 通知に関するユーザー設定を管理します
 */

const admin = require("firebase-admin");
const logger = require("../../utils/logger");

const db = admin.firestore();

/**
 * 通知を受け取るユーザーを取得する
 * @returns {Promise<Array<Object>>} ユーザーリスト
 */
async function getNotificationUsers() {
  try {
    logger.info("通知対象ユーザーを取得中...");
    const snapshot = await db
      .collection("users")
      .where("isPushNotificationEnabled", "==", true)
      .get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    logger.info(`${users.length}人の通知対象ユーザーを取得しました`);
    return users;
  } catch (error) {
    logger.error("通知対象ユーザーの取得に失敗しました", error);
    throw error;
  }
}

/**
 * ユーザーの通知設定を更新する
 * @param {string} userId - ユーザーID
 * @param {Object} settings - 更新する設定
 * @param {boolean} settings.isPushNotificationEnabled - 通知の有効/無効
 * @param {string} settings.expoPushToken - プッシュ通知トークン
 * @returns {Promise<void>}
 */
async function updateNotificationSettings(userId, { isPushNotificationEnabled, expoPushToken }) {
  try {
    logger.info(`ユーザーの通知設定を更新中... (ユーザーID: ${userId})`);
    await db.collection("users").doc(userId).update({
      isPushNotificationEnabled,
      expoPushToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    logger.info("通知設定の更新が完了しました");
  } catch (error) {
    logger.error("通知設定の更新に失敗しました", error);
    throw error;
  }
}

module.exports = {
  getNotificationUsers,
  updateNotificationSettings,
};
