#!/bin/bash

# 環境変数の設定
export NODE_ENV=test

# 現在のディレクトリを保存
CURRENT_DIR=$(pwd)

# scriptsディレクトリに移動
cd "$(dirname "$0")"

echo "==== 通知機能テスト開始 ===="

# 基本的な通知テスト
echo "\n🚀 基本的な通知テストを実行..."
node notification/testBasic.js

# 終了コードを保存
EXIT_CODE=$?

# 元のディレクトリに戻る
cd "$CURRENT_DIR"

# テスト結果に基づいて終了
exit $EXIT_CODE
