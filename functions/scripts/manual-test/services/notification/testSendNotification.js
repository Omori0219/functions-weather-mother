/**
 * 通知送信サービスのテスト
 * @file testSendNotification.js
 */

const { sendNotification } = require("../../../../src/services/notification");
const { initializeFirebase } = require("../../utils/testHelper");
const logger = require("../../utils/testLogger");

/**
 * 通知送信のテスト実行
 */
const testSendNotification = async () => {
  logger.startTest("通知送信サービスのテスト");
  let success = true;

  try {
    // Firebase初期化
    logger.step("Firebase初期化");
    initializeFirebase();

    // テストケース1: テスト用FCMトークンへの送信
    logger.testCase("テスト用FCMトークンへの送信");

    // テストデータの準備
    logger.step("テストデータの準備");
    const testToken = process.env.TEST_FCM_TOKEN; // テスト用のFCMトークン
    if (!testToken) {
      throw new Error("TEST_FCM_TOKENが設定されていません");
    }
    const testMessage = "これはテスト通知です。";

    // 通知送信
    logger.step("通知送信実行");
    const result = await sendNotification({
      token: testToken,
      message: testMessage,
    });

    // 送信結果の検証
    logger.step("送信結果の検証");
    logger.logData("送信結果", result);
    logger.success("テスト通知の送信成功");

    // テストケース2: エラーケース（無効なトークン）
    logger.testCase("無効なトークンでの送信");
    try {
      logger.step("無効なトークンでの送信実行");
      await sendNotification({
        token: "invalid-token",
        message: testMessage,
      });
      throw new Error("エラーが発生すべき処理が成功しました");
    } catch (error) {
      logger.success("期待通りエラーが発生しました");
      logger.logData("エラーメッセージ", error.message);
    }
  } catch (error) {
    success = false;
    logger.error("テスト実行中にエラーが発生", error);
  }

  logger.endTest(success);
  if (!success) {
    process.exit(1);
  }
};

// テストの実行
if (require.main === module) {
  testSendNotification();
}

module.exports = {
  testSendNotification,
};
