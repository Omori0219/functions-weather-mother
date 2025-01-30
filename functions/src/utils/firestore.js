const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Firestoreインスタンスの取得
const db = getFirestore();

module.exports = db;
