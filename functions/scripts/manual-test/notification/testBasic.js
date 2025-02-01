/**
 * 基本的な通知テスト
 * @file testBasic.js
 */

const { TestDataManager } = require("../test-helper");
const { sendPushNotification } = require("../../../src/core/notification/notification");
const { isTestEnvironment } = require("../../../src/config/environment");

/**
 * 基本的な正常系のテスト
 * @param {string} expoPushToken - 有効なプッシュトークン
 */
const testBasicNotification = async (expoPushToken) => {
  if (!isTestEnvironment) {
    throw new Error("テスト環境でのみ実行可能です");
  }

  const testData = new TestDataManager();

  try {
    console.log("🚀 基本的な通知テストを開始します...");

    // テストユーザーの作成
    const userId = await testData.createTestUser({
      areaCode: "130000", // 東京
      expoPushToken,
      isPushNotificationEnabled: true,
    });

    // テスト用の天気情報を作成
    const weatherId = await testData.createTestWeather("130000");

    // 通知送信
    await sendPushNotification(expoPushToken, "これはテスト用の天気予報です。地域コード: 130000");

    console.log("✅ テスト成功");
    return true;
  } catch (error) {
    console.error("❌ テスト失敗:", error);
    return false;
  } finally {
    await testData.cleanup();
  }
};

// コマンドラインから直接実行された場合
if (require.main === module) {
  const token = process.env.EXPO_TEST_PUSH_TOKEN;
  if (!token) {
    console.error("❌ EXPO_TEST_PUSH_TOKENが設定されていません");
    process.exit(1);
  }

  testBasicNotification(token)
    .then((success) => process.exit(success ? 0 : 1))
    .catch((error) => {
      console.error("❌ 予期せぬエラー:", error);
      process.exit(1);
    });
}

module.exports = { testBasicNotification };
