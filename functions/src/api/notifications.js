/**
 * 通知API
 * テスト用のエンドポイントを提供します
 */

const { onRequest } = require("firebase-functions/v2/https");
const {
  sendNotificationsToAllUsers,
  updateUserNotificationSettings,
} = require("../domain/notifications");
const logger = require("../utils/logger");

/**
 * 通知送信のテスト用エンドポイント
 */
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

/**
 * 基本的な正常系のテスト
 * @param {string} expoPushToken - 有効なプッシュトークン
 */
async function testBasicNotification(expoPushToken) {
  try {
    // テストユーザーの作成
    const userId = await createTestUser({
      areaCode: "130000", // 東京
      expoPushToken,
      isPushNotificationEnabled: true,
    });

    // テスト用の天気情報を作成
    const weatherId = await createTestWeatherData("130000");

    // 通知送信
    await sendNotificationsToAllUsers();

    // テストデータのクリーンアップ
    await cleanupTestData([userId], [weatherId]);

    return {
      success: true,
      message: "基本的な正常系のテストが完了しました",
    };
  } catch (error) {
    throw new Error(`基本的な正常系のテストが失敗しました: ${error.message}`);
  }
}

/**
 * 天気情報が未生成の場合のテスト
 * @param {string} expoPushToken - 有効なプッシュトークン
 */
async function testMissingWeatherData(expoPushToken) {
  try {
    // テストユーザーの作成（天気情報は作成しない）
    const userId = await createTestUser({
      areaCode: "130000",
      expoPushToken,
      isPushNotificationEnabled: true,
    });

    // 通知処理の実行（エラーになることを期待）
    await sendNotificationsToAllUsers();

    // テストデータのクリーンアップ
    await cleanupTestData([userId], []);

    return {
      success: true,
      message: "天気情報未生成のテストが完了しました",
    };
  } catch (error) {
    throw new Error(`天気情報未生成のテストが失敗しました: ${error.message}`);
  }
}

/**
 * 複数ユーザーへの一斉送信テスト
 * @param {string[]} expoPushTokens - 有効なプッシュトークンの配列
 */
async function testMultipleUsers(expoPushTokens) {
  const userIds = [];
  const weatherIds = [];
  const areaCodes = ["130000", "270000", "016000"]; // 東京、大阪、札幌

  try {
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

    // 通知送信
    await sendNotificationsToAllUsers();

    // テストデータのクリーンアップ
    await cleanupTestData(userIds, weatherIds);

    return {
      success: true,
      message: "複数ユーザーへの一斉送信テストが完了しました",
      details: {
        testedUsers: userIds.length,
        testedAreas: areaCodes.slice(0, userIds.length),
      },
    };
  } catch (error) {
    // エラー時もクリーンアップを実行
    await cleanupTestData(userIds, weatherIds);
    throw new Error(`複数ユーザーへの一斉送信テストが失敗しました: ${error.message}`);
  }
}

/**
 * 実際の天気情報を使用した通知テスト
 */
async function testRealWeatherNotification() {
  try {
    // 通知送信
    await sendNotificationsToAllUsers();

    return {
      success: true,
      message: "実際の天気情報を使用した通知テストが完了しました",
    };
  } catch (error) {
    throw new Error(`実際の天気情報を使用した通知テストが失敗しました: ${error.message}`);
  }
}

// テストデータ作成・クリーンアップ用のヘルパー関数
async function createTestUser(userData) {
  const db = admin.firestore();
  const userRef = await db.collection("users").add({
    ...userData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return userRef.id;
}

async function createTestWeatherData(areaCode) {
  const db = admin.firestore();
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
  const docId = `${formattedDate}-${areaCode}`;

  await db
    .collection("weather_data")
    .doc(docId)
    .set({
      areaCode: areaCode,
      weatherForecasts: JSON.stringify({ test: "data" }),
      generatedMessage: `これはテスト用の天気予報です。地域コード: ${areaCode}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  return docId;
}

async function cleanupTestData(userIds, weatherIds) {
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
}
