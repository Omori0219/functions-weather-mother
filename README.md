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
\`functions/.env\`ファイルを作成し、以下の環境変数を設定：
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### ローカル開発環境の構築
```bash
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
```

### スケジュール実行の仕様
- 実行時刻: 毎朝6時（JST）
- リトライ設定: 3回
- タイムアウト: 9分
- メモリ: 256MiB

## API仕様

### エンドポイント
1. generateWeatherMessages (Scheduled)
   - 毎朝6時に自動実行
   - 全都道府県の処理を実行

2. generateWeatherMessagesTest (HTTP)
   - テスト用エンドポイント
   - 4都道府県のサンプルデータを処理

### レスポンス形式
```json
{
  "status": "completed",
  "timestamp": "2024-01-30T06:00:00.000Z",
  "summary": {
    "total": 47,
    "success": 47,
    "failed": 0
  },
  "results": {
    "success": [
      {
        "prefecture": "東京都",
        "code": "130000",
        "message": "..."
      }
    ],
    "failed": []
  }
}
```

### エラーレスポンス
```json
{
  "status": "error",
  "timestamp": "2024-01-30T06:00:00.000Z",
  "error": "Error message"
}
```

## 開発ガイド

### プロジェクト構造
```
functions/
├── src/
│   ├── clients/      # 外部APIクライアント
│   ├── config/       # 設定ファイル
│   ├── core/         # コアロジック
│   └── utils/        # ユーティリティ
├── index.js          # エントリーポイント
└── package.json
```

### テスト方法
```bash
# エミュレータでのテスト
firebase emulators:start --only functions,firestore

# テスト関数の実行
curl https://asia-northeast1-[PROJECT_ID].cloudfunctions.net/generateWeatherMessagesTest
```

### デプロイ手順
```bash
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
- Gemini API: 10秒間隔での呼び出し制限

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

### v1.0.0 (2024-01-30)
- 初期リリース
- 基本機能の実装
- 東京リージョンでの運用開始

### 今後の予定
- パフォーマンス最適化
- 方言生成の精度向上
- 監視機能の強化 
