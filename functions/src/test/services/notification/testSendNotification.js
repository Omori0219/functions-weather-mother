/**
 * 通知送信のテスト
 */

const { sendNotification } = require("../../../services/notification");
const { initializeFirebase } = require("../../utils/testHelper");
const logger = require("../../utils/testLogger");

const testSendNotification = async () => {
  let success = true;
  logger.startTest("通知送信テスト");

  try {
    // Firebaseの初期化
    initializeFirebase();

    // テストケース1: 有効なトークンに通知を送信
    logger.testCase("有効なトークンに通知を送信");
    const validToken = process.env.TEST_FCM_TOKEN;
    if (!validToken) {
      throw new Error("テスト用のFCMトークンが設定されていません");
    }

    const validData = {
      token: validToken,
      message: "これはテスト通知です",
    };

    const result = await sendNotification(validData);
    if (!result || !result.messageId) {
      throw new Error("通知の送信に失敗しました");
    }
    logger.success("通知を正常に送信しました");
    logger.logData("送信結果", result);

    // テストケース2: 無効なトークンで通知を送信
    logger.testCase("無効なトークンで通知を送信");
    try {
      const invalidData = {
        token: "invalid_token",
        message: "これはテスト通知です",
      };
      await sendNotification(invalidData);
      throw new Error("無効なトークンでの送信が成功してしまいました");
    } catch (error) {
      if (error.message === "無効なトークンでの送信が成功してしまいました") {
        throw error;
      }
      logger.success("無効なトークンは適切に拒否されました");
    }
  } catch (error) {
    success = false;
    logger.error("通知の送信に失敗しました", error);
  }

  logger.endTest(success);
  return success;
};

// スクリプトが直接実行された場合のみテストを実行
if (require.main === module) {
  testSendNotification();
}

module.exports = testSendNotification;
