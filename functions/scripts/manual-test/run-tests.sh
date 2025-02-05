#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 結果の初期化
FAILED_TESTS=()

# テスト実行関数
run_test() {
  local test_name=$1
  local test_file=$2

  echo -e "\n${YELLOW}=== $test_name ===${NC}"
  if node $test_file; then
    echo -e "${GREEN}✓ $test_name: 成功${NC}"
    return 0
  else
    echo -e "${RED}✗ $test_name: 失敗${NC}"
    FAILED_TESTS+=("$test_name")
    return 1
  fi
}

# メイン処理
echo -e "${YELLOW}=== テスト実行開始 ===${NC}"

# 個別サービステスト
echo -e "\n${GREEN}>>> 天気データ取得テスト${NC}"
run_test "天気データ取得" "src/test/services/weather/testFetchWeather.js"

echo -e "\n${GREEN}>>> 天気解析テスト${NC}"
run_test "天気解析" "src/test/services/weather/testAnalyzeWeather.js"

echo -e "\n${GREEN}>>> メッセージ保存テスト${NC}"
run_test "メッセージ保存" "src/test/services/weather/testSaveWeather.js"

echo -e "\n${GREEN}>>> 通知送信テスト${NC}"
run_test "通知送信" "src/test/services/notification/testSendNotification.js"

# 統合フローテスト
echo -e "\n${GREEN}>>> 天気予報フロー統合テスト${NC}"
run_test "天気予報フロー" "src/test/flows/testWeatherFlow.js"

# 結果の表示
echo -e "\n${YELLOW}=== テスト実行結果 ===${NC}"
if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
  echo -e "${GREEN}全てのテストが成功しました！${NC}"
  exit 0
else
  echo -e "${RED}失敗したテスト:${NC}"
  for test in "${FAILED_TESTS[@]}"; do
    echo -e "${RED}- $test${NC}"
  done
  exit 1
fi
