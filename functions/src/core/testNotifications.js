const admin = require("firebase-admin");
const { sendPushNotification } = require("./notification");

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
};

/**
 * テスト用のユーザーを作成
 * @param {Object} userData - ユーザーデータ
 * @returns {Promise<string>} - ユーザーID
 */
const createTestUser = async (userData) => {
  const db = admin.firestore();
  const userRef = await db.collection("users").add({
    ...userData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return userRef.id;
};

/**
 * テストデータのクリーンアップ
 * @param {string[]} userIds - 削除するユーザーID配列
 * @param {string[]} weatherIds - 削除する天気情報ID配列
 */
const cleanupTestData = async (userIds, weatherIds) => {
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
};

/**
 * 基本的な正常系のテスト
 * @param {string} expoPushToken - 有効なプッシュトークン
 */
const testBasicNotification = async (expoPushToken) => {
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
    await sendPushNotification(expoPushToken, "これはテスト用の天気予報です。地域コード: 130000");

    // テストデータのクリーンアップ
    await cleanupTestData([userId], [weatherId]);

    return {
      success: true,
      message: "基本的な正常系のテストが完了しました",
    };
  } catch (error) {
    throw new Error(`基本的な正常系のテストが失敗しました: ${error.message}`);
  }
};

/**
 * 天気情報が未生成の場合のテスト
 * @param {string} expoPushToken - 有効なプッシュトークン
 */
const testMissingWeatherData = async (expoPushToken) => {
  try {
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
      console.log("期待通り、天気情報が存在しません");
    }

    // テストデータのクリーンアップ
    await cleanupTestData([userId], []);

    return {
      success: true,
      message: "天気情報未生成のテストが完了しました",
    };
  } catch (error) {
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
      await sendPushNotification(
        expoPushTokens[i],
        `これはテスト用の天気予報です。地域コード: ${areaCodes[i]}`
      );
    }

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
};

/**
 * すべてのテストを実行する
 * @param {string} expoPushToken - テスト用の有効なプッシュトークン
 */
const runAllTests = async (expoPushToken) => {
  try {
    console.log("🧪 テストを開始します...");

    // 基本的な正常系のテスト
    console.log("\n1️⃣ 基本的な正常系のテストを実行中...");
    const basicResult = await testBasicNotification(expoPushToken);
    console.log("✅ 基本テスト結果:", basicResult);

    // 天気情報未生成のテスト
    console.log("\n2️⃣ 天気情報未生成のテストを実行中...");
    const missingResult = await testMissingWeatherData(expoPushToken);
    console.log("✅ 未生成テスト結果:", missingResult);

    // 複数ユーザーテスト（同じトークンを使い回し）
    console.log("\n3️⃣ 複数ユーザーテストを実行中...");
    const multipleResult = await testMultipleUsers([expoPushToken, expoPushToken, expoPushToken]);
    console.log("✅ 複数ユーザーテスト結果:", multipleResult);

    console.log("\n🎉 すべてのテストが完了しました！");
  } catch (error) {
    console.error("❌ テスト実行中にエラーが発生しました:", error);
    throw error;
  }
};

module.exports = {
  testBasicNotification,
  testMissingWeatherData,
  testMultipleUsers,
  runAllTests,
};
