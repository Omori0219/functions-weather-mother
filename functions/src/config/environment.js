/**
 * 環境設定
 */

const ENV = {
  LOCAL: "local",
  TEST: "test",
  PROD: "prod",
};

const currentEnv = process.env.NODE_ENV || ENV.LOCAL;

module.exports = {
  ENV,
  currentEnv,
  isTest: currentEnv === ENV.TEST,
  isLocal: currentEnv === ENV.LOCAL,
  isProd: currentEnv === ENV.PROD,
};
