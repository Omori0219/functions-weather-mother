/**
 * テストのログ出力を管理するユーティリティ
 */

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const testLogger = {
  startTest: (testName) => {
    console.log(`\n${colors.bright}${colors.yellow}=== ${testName} ===${colors.reset}`);
  },

  testCase: (description) => {
    console.log(`\n${colors.bright}${colors.blue}テストケース: ${description}${colors.reset}`);
  },

  step: (description) => {
    console.log(`${colors.cyan}> ${description}${colors.reset}`);
  },

  logData: (label, data) => {
    console.log(`${colors.bright}${label}:${colors.reset}`, data);
  },

  success: (message) => {
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
  },

  error: (message, error = null) => {
    console.error(`${colors.red}✗ ${message}${colors.reset}`);
    if (error) {
      console.error(`${colors.red}エラー詳細:${colors.reset}`, error);
    }
  },

  endTest: (success = true) => {
    if (success) {
      console.log(`\n${colors.green}✓ テスト成功${colors.reset}`);
    } else {
      console.log(`\n${colors.red}✗ テスト失敗${colors.reset}`);
    }
  },
};

module.exports = testLogger;
