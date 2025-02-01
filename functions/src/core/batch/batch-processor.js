/**
 * バッチ処理の制御機能
 * @file batch-processor.js
 */

const admin = require("firebase-admin");
const { generateWeatherForecast } = require("../weather/weather-mother");
const { sendNotificationsToAllUsers } = require("../notification/sendNotifications");
const { COLLECTIONS, LIMITS } = require("../../config/firestore");
const { info, error } = require("../../utils/logger");

/**
 * バッチ処理のメイン関数
 * @returns {Promise<void>}
 */
async function processBatch() {
  const startTime = Date.now();
  const batchId = `batch_${startTime}`;

  info("バッチ処理を開始", {
    operation: "processBatch",
    batchId,
    maxBatchSize: LIMITS.MAX_BATCH_SIZE,
  });

  try {
    // 処理対象の地域を取得
    const db = admin.firestore();
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).limit(LIMITS.MAX_BATCH_SIZE).get();

    if (usersSnapshot.empty) {
      info("処理対象のユーザーが存在しません", {
        operation: "processBatch",
        batchId,
        collection: COLLECTIONS.USERS,
      });
      return;
    }

    // 地域コードの重複を除去
    const areaCodes = new Set();
    usersSnapshot.forEach((doc) => {
      const { areaCode } = doc.data();
      if (areaCode) {
        areaCodes.add(areaCode);
      }
    });

    info("処理対象の地域を特定", {
      operation: "processBatch",
      batchId,
      totalAreas: areaCodes.size,
      areas: Array.from(areaCodes),
    });

    // 処理結果の集計用
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // 各地域の天気予報を生成
    for (const areaCode of areaCodes) {
      const areaStartTime = Date.now();
      try {
        info("地域の天気予報生成を開始", {
          operation: "generateWeatherForecast",
          batchId,
          areaCode,
          progress: `${successCount + errorCount + 1}/${areaCodes.size}`,
        });

        // 天気予報データの生成（実際のAPIコール等は省略）
        const weatherData = {
          temperature: 25,
          condition: "sunny",
          // ... その他の天気データ
        };

        await generateWeatherForecast(areaCode, weatherData);
        successCount++;

        const areaEndTime = Date.now();
        info("地域の天気予報生成が完了", {
          operation: "generateWeatherForecast",
          batchId,
          areaCode,
          status: "success",
          processingTimeMs: areaEndTime - areaStartTime,
        });
      } catch (err) {
        errorCount++;
        errors.push({
          areaCode,
          error: err.message,
        });

        error("地域の天気予報生成に失敗", {
          operation: "generateWeatherForecast",
          batchId,
          areaCode,
          error: err,
          processingTimeMs: Date.now() - areaStartTime,
        });
      }
    }

    // 通知送信
    info("通知送信を開始", {
      operation: "sendNotifications",
      batchId,
    });

    await sendNotificationsToAllUsers();

    const endTime = Date.now();
    info("バッチ処理が完了", {
      operation: "processBatch",
      batchId,
      status: "completed",
      summary: {
        totalAreas: areaCodes.size,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors : undefined,
      },
      processingTimeMs: endTime - startTime,
    });
  } catch (err) {
    const endTime = Date.now();
    error("バッチ処理全体が失敗", {
      operation: "processBatch",
      batchId,
      error: err,
      processingTimeMs: endTime - startTime,
    });
    throw err;
  }
}

module.exports = {
  processBatch,
};
