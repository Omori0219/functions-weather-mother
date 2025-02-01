# Weather Mother 🌤️

## プロジェクト概要

Weather Motherは、毎朝の天気予報を基に、お母さんが子供に話しかけるような温かみのあるメッセージを自動生成するサービスです。
このリポジトリは、Weather Motherのバックエンド機能を提供するCloud Functions部分です。

### 主な機能
- 全国47都道府県の天気予報データの取得
- AI（Gemini）を使用した自然な会話調のメッセージ生成
- 毎朝6時の自動実行
- 地域の方言を考慮したメッセージ生成

### 使用技術スタック
- Node.js v22
- Firebase Cloud Functions
- Cloud Firestore
- Google Cloud Vertex AI (Gemini)
- 気象庁API

### アーキテクチャ図
```
[気象庁API] → [Cloud Functions] → [Vertex AI] → [Cloud Firestore]
     ↑              ↑                   ↑              ↓
     └──────[定期実行(毎朝6時)]────────────────[データ保存]
```

## セットアップ手順

### 前提条件
- Node.js v22
- Firebase CLI
- Google Cloud プロジェクト
- Firebase プロジェクト

### インストール手順
```bash
# プロジェクトのクローン
git clone [repository-url]
cd functions-weathermother

# 依存関係のインストール
cd functions
npm install
```

### 環境変数の設定
環境別の設定ファイルを作成：
- `functions/.env.local` - ローカル開発環境用
- `functions/.env.test` - テスト環境用
- `functions/.env.prod` - 本番環境用

各ファイルに必要な環境変数を設定：
```env
# 必須の環境変数
GOOGLE_CLOUD_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=asia-northeast1
VERTEX_AI_MODEL=gemini-1.5-flash

# テスト用の環境変数（.env.testのみ）
EXPO_TEST_PUSH_TOKEN=your-expo-token
```

### ローカル開発環境の構築
```bash
# 環境変数の設定
export NODE_ENV=local  # local, test, prod

# Firebaseエミュレータの起動
firebase emulators:start --only functions,firestore

# 別ターミナルでFunctions Shellを起動
firebase functions:shell
```

## 機能詳細

### 天気予報データの取得
- 気象庁APIから各都道府県の天気予報を取得
- エリアコードを使用して地域を特定
- レート制限に配慮した実装

### メッセージ生成の仕組み
- Gemini APIを使用
- 地域性を考慮したプロンプト設計
- 方言対応による自然な会話調の実現

### Firestoreのデータ構造
```
weather_data/
  └── YYYYMMDD-areaCode/
       ├── areaCode: string
       ├── weatherForecasts: string (JSON)
       ├── generatedMessage: string
       └── createdAt: timestamp

users/
  └── userId/
       ├── areaCode: string
       ├── expoPushToken: string
       ├── isPushNotificationEnabled: boolean
       ├── createdAt: timestamp
       └── updatedAt: timestamp
```

### スケジュール実行の仕様
- 実行時刻: 毎朝6時（JST）
- リトライ設定: 3回
- タイムアウト: 9分
- メモリ: 256MiB

## 開発ガイド

### プロジェクト構造
```
functions/
├── src/
│   ├── clients/           # 外部APIクライアント
│   │   ├── firebase.js   # Firebaseクライアント
│   │   ├── gemini.js     # Gemini APIクライアント
│   │   └── weather.js    # 気象庁APIクライアント
│   ├── config/           # 設定ファイル
│   │   ├── environment.js # 環境設定
│   │   ├── firestore.js  # Firestore設定
│   │   └── constants.js  # 定数定義
│   ├── core/             # コアロジック
│   │   ├── weather/      # 天気予報関連
│   │   ├── notification/ # 通知関連
│   │   └── batch/       # バッチ処理
│   └── utils/           # ユーティリティ
│       ├── date.js      # 日付操作
│       └── logger.js    # ログ出力
├── scripts/
│   └── manual-test/     # 手動テストスクリプト
├── index.js            # エントリーポイント
└── package.json
```

### テスト方法

#### 手動テストの実行
```bash
# テスト環境の設定
cd functions
export NODE_ENV=test
export EXPO_TEST_PUSH_TOKEN=your-expo-token

# 通知テストの実行
./scripts/manual-test/run-notification-test.sh
```

#### エミュレータでのテスト
```bash
# エミュレータの起動
firebase emulators:start --only functions,firestore

# テスト関数の実行
curl http://localhost:5001/[PROJECT_ID]/asia-northeast1/generateWeatherMessagesTest
```

### デプロイ手順
```bash
# 環境変数の設定
export NODE_ENV=prod

# デプロイ内容の確認
firebase deploy --only functions --dry-run

# 本番デプロイ
firebase deploy --only functions
```

## 運用・監視

### ログの確認方法
1. Firebase Console > Functions > Logs
2. Cloud Logging > Logs Explorer
3. ローカルでのログ確認: `firebase functions:log`

### アラート設定
Cloud Monitoringで以下のアラートを設定：
- 関数の実行エラー
- 実行時間の閾値超過
- メモリ使用量の閾値超過

### 定期メンテナンス手順
1. ログの確認と分析（週1回）
2. 不要なログの削除（月1回）
3. 依存パッケージの更新（月1回）

## 制限事項

### API制限
- 気象庁API: レート制限あり
- Gemini API: 20秒間隔での呼び出し制限

### リソース制限
- 関数実行時間: 最大9分
- メモリ: 256MiB
- 同時実行数: 1インスタンス

### 既知の問題
- 気象庁APIの不定期なメンテナンス
- 方言生成の精度
- 処理時間の変動

## ライセンス
MIT License (c) 2024

## 変更履歴

### v1.1.0 (2024-02-01)
- コードベースの大規模リファクタリング
  - 機能別ディレクトリ構造の導入
  - 環境設定の改善
  - テストコードの整理
  - エラーハンドリングの強化
  - ログ出力の統一

### v1.0.0 (2024-01-30)
- 初期リリース
- 基本機能の実装
- 東京リージョンでの運用開始

### 今後の予定
- パフォーマンス最適化
- 方言生成の精度向上
- 監視機能の強化 
