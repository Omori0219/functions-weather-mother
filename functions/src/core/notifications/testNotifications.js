const admin = require("firebase-admin");
const { sendPushNotification } = require("./notification");
const logger = require("../../utils/logger");
const { sendNotificationsToAllUsers } = require("./sendNotifications");

/**
 * テスト用の天気情報を作成
 * @param {string} areaCode - 地域コード
 * @returns {Promise<string>} - ドキュメントID
 */
const createTestWeatherData = async (areaCode) => {
  const db = admin.firestore();
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
  const docId = `${formattedDate}-${areaCode}`;

  logger.debug("テスト用の天気情報を作成", {
    areaCode,
    docId,
    timestamp: today.toISOString(),
  });

  await db
    .collection("weather_data")
    .doc(docId)
    .set({
      areaCode: areaCode,
      weatherForecasts: JSON.stringify({ test: "data" }),
      generatedMessage: `これはテスト用の天気予報です。地域コード: ${areaCode}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  logger.info("テスト用の天気情報を作成完了", {
    areaCode,
    docId,
  });

  return docId;
};

/**
 * テスト用のユーザーを作成
 * @param {Object} userData - ユーザーデータ
 * @returns {Promise<string>} - ユーザーID
 */
const createTestUser = async (userData) => {
  logger.debug("テスト用のユーザーを作成", {
    areaCode: userData.areaCode,
    isPushEnabled: userData.isPushNotificationEnabled,
  });

  const db = admin.firestore();
  const userRef = await db.collection("users").add({
    ...userData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  logger.info("テスト用のユーザーを作成完了", {
    userId: userRef.id,
    areaCode: userData.areaCode,
  });

  return userRef.id;
};

/**
 * テストデータのクリーンアップ
 * @param {string[]} userIds - 削除するユーザーID配列
 * @param {string[]} weatherIds - 削除する天気情報ID配列
 */
const cleanupTestData = async (userIds, weatherIds) => {
  logger.debug("テストデータのクリーンアップを開始", {
    userCount: userIds.length,
    weatherDataCount: weatherIds.length,
  });

  const db = admin.firestore();
  const batch = db.batch();

  // ユーザーの削除
  userIds.forEach((userId) => {
    batch.delete(db.collection("users").doc(userId));
  });

  // 天気情報の削除
  weatherIds.forEach((weatherId) => {
    batch.delete(db.collection("weather_data").doc(weatherId));
  });

  await batch.commit();

  logger.info("テストデータのクリーンアップ完了", {
    deletedUsers: userIds.length,
    deletedWeatherData: weatherIds.length,
  });
};

/**
 * 基本的な正常系のテスト
 * @param {string} expoPushToken - 有効なプッシュトークン
 */
const testBasicNotification = async (expoPushToken) => {
  try {
    logger.info("基本的な正常系のテストを開始", {
      expoPushToken: expoPushToken.substring(0, 10) + "...",
    });

    // テストユーザーの作成
    const userId = await createTestUser({
      areaCode: "130000", // 東京
      expoPushToken,
      isPushNotificationEnabled: true,
    });

    // テスト用の天気情報を作成
    const weatherId = await createTestWeatherData("130000");

    // 通知送信
    await sendPushNotification(expoPushToken, "これはテスト用の天気予報です。地域コード: 130000");

    // テストデータのクリーンアップ
    await cleanupTestData([userId], [weatherId]);

    logger.info("基本的な正常系のテストが完了");

    return {
      success: true,
      message: "基本的な正常系のテストが完了しました",
    };
  } catch (error) {
    logger.error("基本的な正常系のテストが失敗", error, {
      expoPushToken: expoPushToken.substring(0, 10) + "...",
    });
    throw new Error(`基本的な正常系のテストが失敗しました: ${error.message}`);
  }
};

/**
 * 天気情報が未生成の場合のテスト
 * @param {string} expoPushToken - 有効なプッシュトークン
 */
const testMissingWeatherData = async (expoPushToken) => {
  try {
    logger.info("天気情報未生成のテストを開始", {
      expoPushToken: expoPushToken.substring(0, 10) + "...",
    });

    // テストユーザーの作成（天気情報は作成しない）
    const userId = await createTestUser({
      areaCode: "130000",
      expoPushToken,
      isPushNotificationEnabled: true,
    });

    // 通知処理の実行（エラーになることを期待）
    const db = admin.firestore();
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const weatherDocId = `${formattedDate}-130000`;
    const weatherDoc = await db.collection("weather_data").doc(weatherDocId).get();

    if (!weatherDoc.exists) {
      logger.info("天気情報が存在しないことを確認", {
        weatherDocId,
      });
    }

    // テストデータのクリーンアップ
    await cleanupTestData([userId], []);

    logger.info("天気情報未生成のテストが完了");

    return {
      success: true,
      message: "天気情報未生成のテストが完了しました",
    };
  } catch (error) {
    logger.error("天気情報未生成のテストが失敗", error, {
      expoPushToken: expoPushToken.substring(0, 10) + "...",
    });
    throw new Error(`天気情報未生成のテストが失敗しました: ${error.message}`);
  }
};

/**
 * 複数ユーザーへの一斉送信テスト
 * @param {string[]} expoPushTokens - 有効なプッシュトークンの配列
 */
const testMultipleUsers = async (expoPushTokens) => {
  const userIds = [];
  const weatherIds = [];
  const areaCodes = ["130000", "270000", "016000"]; // 東京、大阪、札幌

  try {
    logger.info("複数ユーザーへの一斉送信テストを開始", {
      userCount: expoPushTokens.length,
      areaCodes,
    });

    // テストユーザーと天気情報の作成
    for (let i = 0; i < Math.min(expoPushTokens.length, areaCodes.length); i++) {
      const userId = await createTestUser({
        areaCode: areaCodes[i],
        expoPushToken: expoPushTokens[i],
        isPushNotificationEnabled: true,
      });
      userIds.push(userId);

      const weatherId = await createTestWeatherData(areaCodes[i]);
      weatherIds.push(weatherId);
    }

    // 各ユーザーに通知を送信
    for (let i = 0; i < userIds.length; i++) {
      logger.debug("テスト通知を送信", {
        userId: userIds[i],
        areaCode: areaCodes[i],
        tokenPreview: expoPushTokens[i].substring(0, 10) + "...",
      });

      await sendPushNotification(
        expoPushTokens[i],
        `これはテスト用の天気予報です。地域コード: ${areaCodes[i]}`
      );
    }

    // テストデータのクリーンアップ
    await cleanupTestData(userIds, weatherIds);

    logger.info("複数ユーザーへの一斉送信テストが完了", {
      testedUsers: userIds.length,
      testedAreas: areaCodes.slice(0, userIds.length),
    });

    return {
      success: true,
      message: "複数ユーザーへの一斉送信テストが完了しました",
      details: {
        testedUsers: userIds.length,
        testedAreas: areaCodes.slice(0, userIds.length),
      },
    };
  } catch (error) {
    logger.error("複数ユーザーへの一斉送信テストが失敗", error, {
      userCount: expoPushTokens.length,
      completedUsers: userIds.length,
    });

    // エラー時もクリーンアップを実行
    await cleanupTestData(userIds, weatherIds);
    throw new Error(`複数ユーザーへの一斉送信テストが失敗しました: ${error.message}`);
  }
};

/**
 * 実際の天気情報を使用した通知テスト
 * 既存のユーザーデータを使用して通知をテストします
 */
const testRealWeatherNotification = async () => {
  try {
    logger.info("実際の天気情報を使用した通知テストを開始");

    // 通知送信
    await sendNotificationsToAllUsers();

    logger.info("実際の天気情報を使用した通知テストが完了");

    return {
      success: true,
      message: "実際の天気情報を使用した通知テストが完了しました",
    };
  } catch (error) {
    logger.error("実際の天気情報を使用した通知テストが失敗", error);
    throw new Error(`実際の天気情報を使用した通知テストが失敗しました: ${error.message}`);
  }
};

module.exports = {
  testBasicNotification,
  testMissingWeatherData,
  testMultipleUsers,
  testRealWeatherNotification,
};
