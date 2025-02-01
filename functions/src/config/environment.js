/**
 * 環境設定の定義
 * @file environment.js
 */

const ENV = {
  LOCAL: "local",
  TEST: "test",
  PROD: "prod",
};

const currentEnv = process.env.NODE_ENV || ENV.LOCAL;

const isTestEnvironment = currentEnv === ENV.TEST;
const isLocalEnvironment = currentEnv === ENV.LOCAL;
const isProductionEnvironment = currentEnv === ENV.PROD;

module.exports = {
  ENV,
  currentEnv,
  isTestEnvironment,
  isLocalEnvironment,
  isProductionEnvironment,
};
