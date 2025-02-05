/**
 * 通知ドメイン
 * 通知に関する機能を統合し、アプリケーション層に提供します
 */

const { sendNotification } = require("./notification-sender");
const { getNotificationUsers, updateNotificationSettings } = require("./user-preferences");
const { getStoredWeatherData } = require("../weather");
const logger = require("../../utils/logger");

/**
 * 全ユーザーに通知を送信する
 * @returns {Promise<Object>} 処理結果
 */
async function sendNotificationsToAllUsers() {
  try {
    logger.info("全ユーザーへの通知送信を開始します");

    // 通知対象ユーザーを取得
    const users = await getNotificationUsers();
    logger.info(`${users.length}人のユーザーに通知を送信します`);

    const results = {
      success: [],
      failed: [],
    };

    // 各ユーザーに通知を送信
    for (const user of users) {
      try {
        // ユーザーの地域の天気予報を取得
        const weatherData = await getStoredWeatherData(user.areaCode);
        if (!weatherData) {
          logger.warn(
            `天気予報データが見つかりません (ユーザーID: ${user.id}, 地域コード: ${user.areaCode})`
          );
          results.failed.push({
            userId: user.id,
            error: "天気予報データが見つかりません",
          });
          continue;
        }

        // 通知を送信
        await sendNotification({
          token: user.expoPushToken,
          message: weatherData.generatedMessage,
        });

        results.success.push({
          userId: user.id,
          areaCode: user.areaCode,
        });
      } catch (error) {
        logger.error(`ユーザーへの通知送信に失敗しました (ユーザーID: ${user.id}):`, error);
        results.failed.push({
          userId: user.id,
          error: error.message,
        });
      }
    }

    logger.info("全ユーザーへの通知送信が完了しました", {
      total: users.length,
      success: results.success.length,
      failed: results.failed.length,
    });

    return results;
  } catch (error) {
    logger.error("通知送信処理でエラーが発生しました:", error);
    throw error;
  }
}

/**
 * ユーザーの通知設定を更新する
 * @param {string} userId - ユーザーID
 * @param {Object} settings - 更新する設定
 * @returns {Promise<void>}
 */
async function updateUserNotificationSettings(userId, settings) {
  try {
    await updateNotificationSettings(userId, settings);
  } catch (error) {
    logger.error(`通知設定の更新でエラーが発生しました (ユーザーID: ${userId}):`, error);
    throw error;
  }
}

module.exports = {
  sendNotificationsToAllUsers,
  updateUserNotificationSettings,
};
