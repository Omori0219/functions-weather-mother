# Weather Mother リファクタリングプロジェクト

## プロジェクト概要

### 基本情報
- プロジェクト名: Weather Mother
- 目的: 天気予報を母親のような口調でユーザーに通知するサービス
- 実行環境: Firebase Cloud Functions
- 主要な依存関係:
  - firebase-admin
  - firebase-functions
  - @google-cloud/vertexai
  - expo-server-sdk

### 現在のコード構造
```
src/
├── core/
│   ├── weather-mother.js     # メインロジック
│   ├── batch-processor.js    # バッチ処理
│   ├── sendNotifications.js  # 通知送信
│   └── testNotifications.js  # テスト用
├── utils/
│   ├── date.js              # 日付ユーティリティ
│   ├── firestore.js         # Firestore操作
│   └── logger.js            # ログ機能
└── config/
    ├── constants.js         # 定数定義
    ├── environment.js       # 環境設定
    └── prefectures.js       # 都道府県情報
```

### 主要な機能フロー
1. 天気予報の取得（気象庁API）
2. メッセージの生成（Vertex AI）
3. データの保存（Firestore）
4. 通知の送信（Expo）

## リファクタリングの目的と制約

### 目的
- ドメイン駆動設計の原則に基づいたコード構造への移行
- 責務の明確な分離
- テスタビリティの向上

### 絶対に変更してはいけない項目
- ビジネスロジック（処理の順序や条件）
- 外部APIの呼び出し方法
- データベーススキーマ
- 環境変数名
- 認証方式
- Cloud Functions の設定（タイムアウト、メモリ、リージョン）

### 目標とする新しいコード構造
```
src/
├── api/                    # APIエンドポイント
│   ├── weather.js
│   ├── notifications.js
│   └── index.js           # APIエンドポイントのエクスポート管理
├── schedulers/            # スケジュールされたジョブ
│   ├── weather.js
│   ├── notifications.js
│   └── index.js           # スケジューラのエクスポート管理
├── domain/               # ドメインロジック
│   ├── weather/
│   │   ├── weather-api-client.js
│   │   ├── mother-message-creator.js
│   │   ├── weather-storage.js
│   │   └── index.js       # 天気予報ドメインのエクスポート管理
│   └── notifications/
│       ├── notification-sender.js
│       ├── user-preferences.js
│       └── index.js       # 通知ドメインのエクスポート管理
├── clients/             # 外部APIクライアント
│   ├── jma.js
│   ├── gemini.js
│   ├── expo.js
│   └── firestore.js
└── utils/              # ユーティリティ
    ├── date.js
    ├── logger.js
    └── id-generator.js

index.js                # アプリケーションのエントリーポイント
```

### 各index.jsの役割

1. **src/index.js** (アプリケーションのエントリーポイント)
   ```javascript
   const admin = require("firebase-admin");
   const { initializeApp } = require("firebase-admin/app");

   // Firebase Adminの初期化（アプリケーション全体で1回のみ）
   if (!admin.apps.length) {
     initializeApp();
   }

   // APIエンドポイントのエクスポート
   exports.api = require("./api");

   // スケジューラのエクスポート
   exports.schedulers = require("./schedulers");
   ```

2. **src/api/index.js** (APIエンドポイントの集約)
   ```javascript
   const { getWeatherForecast } = require("./weather");
   const {
     getNotificationSettings,
     updateNotificationSettings,
     sendTestNotification,
   } = require("./notifications");

   module.exports = {
     getWeatherForecast,
     getNotificationSettings,
     updateNotificationSettings,
     sendTestNotification,
   };
   ```

3. **src/schedulers/index.js** (スケジューラの集約)
   ```javascript
   const { fetchDailyWeatherForecast } = require("./weather");
   const { sendDailyWeatherNotifications } = require("./notifications");

   module.exports = {
     fetchDailyWeatherForecast,
     sendDailyWeatherNotifications,
   };
   ```

4. **src/domain/weather/index.js** (天気予報ドメインの集約)
   ```javascript
   const { processWeatherData } = require("./weather-api-client");
   const { generateMotherMessage } = require("./mother-message-creator");
   const { storeWeatherForecast } = require("./weather-storage");

   module.exports = {
     processWeatherData,
     generateMotherMessage,
     storeWeatherForecast,
   };
   ```

5. **src/domain/notifications/index.js** (通知ドメインの集約)
   ```javascript
   const { sendNotification } = require("./notification-sender");
   const { getUserPreferences } = require("./user-preferences");

   module.exports = {
     sendNotification,
     getUserPreferences,
   };
   ```

これらのindex.jsファイルは以下の重要な役割を果たします：
1. モジュールの依存関係を整理し、外部からのアクセスポイントを一元管理
2. 初期化処理の集中管理（特にsrc/index.js）
3. Cloud Functionsへのエンドポイント提供（api, schedulers）
4. 各ドメインの公開インターフェースの定義

## リファクタリング実施手順

### 重要な依存関係
1. 初期化の順序
   - firebase-adminの初期化は1回のみ（index.jsで実施）
   ```javascript
   if (!admin.apps.length) {
     initializeApp();
   }
   ```
   - Firestoreクライアントの初期化は1回のみ
   ```javascript
   const db = getFirestore();
   ```

2. 外部クライアントの依存順序
   1. Firestore: 他のクライアントから参照される可能性があるため最初に初期化
   2. 気象庁API: 天気予報の取得（外部依存なし）
   3. Vertex AI: Geminiでのメッセージ生成（GOOGLE_CLOUD_PROJECT_IDに依存）
   4. Expo: 通知送信（他のクライアントに依存しない）

3. 環境変数の依存関係
   - GOOGLE_CLOUD_PROJECT_ID: 
     - Firestoreの初期化
     - Vertex AIの認証
   - TEST_SECRET: APIテスト用の認証キー

### テスト方法
1. ローカルテスト環境のセットアップ
   ```bash
   # Firebase Emulatorの起動
   npm run serve

   # 環境変数の設定
   export GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   export TEST_SECRET="your-test-secret"
   ```

2. 各フェーズでの動作確認方法
   - Phase 2（クライアント層）:
     ```bash
     # 天気予報取得のテスト
     curl "http://localhost:5001/your-project/asia-northeast1/api-getWeatherForecast?areaCode=130000"

     # 通知送信のテスト
     curl -X POST "http://localhost:5001/your-project/asia-northeast1/api-sendTestNotification" \
       -H "Authorization: Basic $(echo -n "admin:${TEST_SECRET}" | base64)" \
       -H "Content-Type: application/json" \
       -d '{"userId": "test-user-id"}'
     ```

   - Phase 3-4（ドメイン層）:
     ```bash
     # 天気予報処理のテスト
     npm run test:single

     # バッチ処理のテスト
     npm run test
     ```

   - Phase 5（API/スケジューラ層）:
     - Emulator UIで各Function（API/スケジューラ）の動作確認
     - スケジューラは手動トリガーでテスト

3. 各変更後の確認項目
   - 天気予報の取得
     - 正常系: 天気予報データが取得できること
     - 異常系: エラー時に適切なエラーレスポンスが返ること
   
   - メッセージ生成
     - 正常系: 母親らしいメッセージが生成されること
     - 異常系: APIエラー時に適切なエラーハンドリングがされること
   
   - データ保存
     - 正常系: Firestoreにデータが保存されること
     - 異常系: 保存失敗時に適切なエラーハンドリングがされること
   
   - 通知送信
     - 正常系: Expoで通知が送信されること
     - 異常系: 送信失敗時に適切なエラーハンドリングがされること

### Phase 1: ディレクトリ構造の準備
- 新しいディレクトリの作成のみを行う
- ファイルの移動は行わない
- 確認項目:
  - ディレクトリ構造が計画通りに作成されているか
  - 既存のファイルとの競合がないか

### Phase 2: 外部クライアント層の整理
- `clients/`ディレクトリに外部API関連のコードを移動
- 各クライアントの実装順序:
  1. jma.js
  2. gemini.js
  3. expo.js
  4. firestore.js
- 確認項目:
  - 各クライアントが独立して動作するか
  - 既存の機能を損なっていないか

### Phase 3: 天気予報ドメインの実装
- `domain/weather/`の実装
- 実装順序:
  1. weather-api-client.js
  2. mother-message-creator.js
  3. weather-storage.js
  4. index.js
- 確認項目:
  - 各機能が独立して動作するか
  - ドメインロジックが適切に分離されているか

### Phase 4: 通知ドメインの実装
- `domain/notifications/`の実装
- 実装順序:
  1. notification-sender.js
  2. user-preferences.js
  3. index.js
- 確認項目:
  - 各機能が独立して動作するか
  - ドメインロジックが適切に分離されているか

### Phase 5: API層とスケジュール層の実装
- API層とスケジュール層の実装
- 実装順序:
  1. api/weather.js
  2. api/notifications.js
  3. schedulers/weather.js
  4. schedulers/notifications.js
- 確認項目:
  - 各APIエンドポイントが正常に動作するか
  - スケジュール関数が正常に動作するか

## コミットメッセージの規約
形式: `<Type>: <Emoji> #<Issue Number> <Title>`

Types:
- chore: 📦 ディレクトリ構造やファイル移動
- refactor: ♻️ コードのリファクタリング
- fix: 🔧 バグ修正や調整

## 作業時の注意事項
1. 1回のコミットでは1つの種類の変更のみを行う
2. 各変更後は必ずテストを実行する
3. 問題が発生した場合は即座にロールバックする
4. 改善提案は別のIssueとして記録し、このリファクタリング中は実装しない
5. 不明な点がある場合は、必ず人間に確認を取る
6. 依存関係を変更する際は、初期化の順序に特に注意を払う
7. 環境変数の参照箇所を変更する際は、依存関係図を確認する

## 成功基準
1. 全てのテストが通過すること
2. 既存の機能が全て正常に動作すること
3. コードの依存関係が整理されていること
4. ドメインごとの責務が明確に分離されていること

## 最後に
このドキュメントに書かれていない改善や変更は、**たとえそれが良い改善だとしても、このリファクタリング中は実施してはいけません**。
改善点を見つけた場合は、それを記録し、別のタスクとして後日対応することとしてください。
