/**
 * 環境変数の設定
 * アプリケーション全体で使用する環境変数を管理します
 */

const { defineString, defineInt } = require("firebase-functions/params");

// APIキー
const GEMINI_API_KEY = defineString("GEMINI_API_KEY", {
  description: "Google Gemini APIのキー",
});

const TEST_SECRET = defineString("TEST_SECRET", {
  description: "テスト用の認証シークレット",
});

// タイムアウト設定
const API_TIMEOUT_SECONDS = defineInt("API_TIMEOUT_SECONDS", {
  description: "APIのタイムアウト時間（秒）",
  default: 30,
});

const SCHEDULER_TIMEOUT_SECONDS = defineInt("SCHEDULER_TIMEOUT_SECONDS", {
  description: "スケジューラのタイムアウト時間（秒）",
  default: 540,
});

// メモリ設定
const API_MEMORY = defineString("API_MEMORY", {
  description: "APIのメモリ割り当て",
  default: "256MiB",
});

const SCHEDULER_MEMORY = defineString("SCHEDULER_MEMORY", {
  description: "スケジューラのメモリ割り当て",
  default: "256MiB",
});

// リージョン設定
const REGION = defineString("REGION", {
  description: "デプロイ先のリージョン",
  default: "asia-northeast1",
});

// リトライ設定
const RETRY_COUNT = defineInt("RETRY_COUNT", {
  description: "リトライ回数",
  default: 3,
});

const MAX_RETRY_SECONDS = defineInt("MAX_RETRY_SECONDS", {
  description: "最大リトライ時間（秒）",
  default: 60,
});

module.exports = {
  GEMINI_API_KEY,
  TEST_SECRET,
  API_TIMEOUT_SECONDS,
  SCHEDULER_TIMEOUT_SECONDS,
  API_MEMORY,
  SCHEDULER_MEMORY,
  REGION,
  RETRY_COUNT,
  MAX_RETRY_SECONDS,
};
