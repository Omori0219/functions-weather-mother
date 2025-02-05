/**
 * アプリケーションのエントリーポイント
 * Cloud Functionsのエンドポイントをまとめて管理します
 */

const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Firebase Adminの初期化
if (!admin.apps.length) {
  initializeApp();
}

// Firestoreの初期化
const db = getFirestore();

// APIエンドポイントのエクスポート
exports.api = require("./api");

// スケジューラのエクスポート
exports.schedulers = require("./schedulers");
