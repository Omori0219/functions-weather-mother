/**
 * Firestoreクライアント
 * Firestoreとのデータのやり取りを担当します
 */

const admin = require("firebase-admin");
const logger = require("../utils/logger");
const { generateWeatherDocumentId } = require("../utils/id-generator");

const db = admin.firestore();

/**
 * 天気予報データを保存
 * @param {Object} params - 保存するデータのパラメータ
 * @param {string} params.documentId - ドキュメントID
 * @param {string} params.areaCode - 地域コード
 * @param {string} params.weatherForecasts - 天気予報データ（JSON文字列）
 * @param {string} params.generatedMessage - 生成されたメッセージ
 * @param {Date} params.createdAt - 作成日時
 * @returns {Promise<boolean>} 保存が成功したかどうか
 */
async function saveWeatherData({
  documentId,
  areaCode,
  weatherForecasts,
  generatedMessage,
  createdAt,
}) {
  try {
    logger.info(`天気予報データを保存中... (ID: ${documentId})`);
    await db.collection("weather_data").doc(documentId).set({
      areaCode,
      weatherForecasts,
      generatedMessage,
      createdAt,
    });
    logger.info("天気予報データの保存が完了しました");
    return true;
  } catch (error) {
    logger.error("天気予報データの保存に失敗しました", error);
    throw error;
  }
}

/**
 * 天気予報データを取得
 * @param {string} documentId - ドキュメントID
 * @returns {Promise<Object|null>} 天気予報データ
 */
async function getWeatherData(documentId) {
  try {
    logger.info(`天気予報データを取得中... (ID: ${documentId})`);
    const doc = await db.collection("weather_data").doc(documentId).get();

    if (!doc.exists) {
      logger.info("天気予報データが見つかりませんでした");
      return null;
    }

    logger.info("天気予報データの取得が完了しました");
    return doc.data();
  } catch (error) {
    logger.error("天気予報データの取得に失敗しました", error);
    throw error;
  }
}

/**
 * 指定した日付の天気予報データを取得
 * @param {string} areaCode - 地域コード
 * @param {Date|string} date - 対象日付
 * @returns {Promise<Object|null>} 天気予報データ
 */
async function getWeatherDataByDate(areaCode, date) {
  try {
    logger.info(`天気予報データを取得中... (地域コード: ${areaCode}, 日付: ${date})`);
    const documentId = generateWeatherDocumentId(areaCode, date);
    return await getWeatherData(documentId);
  } catch (error) {
    logger.error("天気予報データの取得に失敗しました", error);
    throw error;
  }
}

/**
 * ユーザーデータを取得
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object|null>} ユーザーデータ
 */
async function getUser(userId) {
  try {
    logger.info(`ユーザーデータを取得中... (ID: ${userId})`);
    const doc = await db.collection("users").doc(userId).get();

    if (!doc.exists) {
      logger.info("ユーザーが見つかりませんでした");
      return null;
    }

    logger.info("ユーザーデータの取得が完了しました");
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    logger.error("ユーザーデータの取得に失敗しました", error);
    throw error;
  }
}

/**
 * ユーザーデータを更新
 * @param {string} userId - ユーザーID
 * @param {Object} data - 更新データ
 * @returns {Promise<void>}
 */
async function updateUser(userId, data) {
  try {
    logger.info(`ユーザーデータを更新中... (ID: ${userId})`);
    await db
      .collection("users")
      .doc(userId)
      .update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    logger.info("ユーザーデータの更新が完了しました");
  } catch (error) {
    logger.error("ユーザーデータの更新に失敗しました", error);
    throw error;
  }
}

/**
 * 通知を受け取るユーザーを取得
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

module.exports = {
  saveWeatherData,
  getWeatherData,
  getWeatherDataByDate,
  getUser,
  updateUser,
  getNotificationUsers,
};
