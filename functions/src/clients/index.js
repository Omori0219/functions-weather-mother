/**
 * クライアントモジュールのエクスポート
 * @file index.js
 */

const jmaApi = require("./jma-api");
const gemini = require("./gemini");
const firebase = require("./firebase");

module.exports = {
  jmaApi,
  gemini,
  firebase,
};
