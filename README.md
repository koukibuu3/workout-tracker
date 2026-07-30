# 筋トレサポート

トレーニングの**予定・実績・種目・テンプレート**をまとめて管理する、スマートフォン利用も意識した Next.js アプリケーションです。カレンダーを起点に日ごとのトレーニングを確認し、統計で継続状況と重量の推移を振り返れます。

## 主な機能

- **カレンダー**
  - 日付ごとにトレーニング予定と実績をタブで表示
  - 予定／実績を複数種目まとめて登録
  - 種目、セット数、回数、重量を記録。実績にはメモも追加可能
  - 予定には時刻と「毎日・毎週・毎月」の繰り返し設定を保存
  - 予定を実績として保存、予定・実績の編集／削除
- **テンプレート**
  - 種目・セット数・回数・重量の組み合わせをテンプレートとして保存
  - テンプレートを使って、当日の実績または予定を登録
  - 実績からテンプレートを作成
- **種目管理**
  - 種目名とカテゴリーを追加・編集・削除
  - フォーム動画の URL を登録し、YouTube／Vimeo などをダイアログで再生
  - 既存の記録・予定・テンプレートで使用中の種目は削除不可
- **統計**
  - 過去 7 日間の曜日別トレーニング数（棒グラフ）
  - 月別のトレーニング種目数ヒートマップ
  - 種目別の重量推移、開始重量・現在重量・増加量・記録回数
- **設定**
  - 表示名、週間目標回数、通知時刻を保存
- **PWA**
  - Web App Manifest、アプリアイコン、Service Worker の登録を含み、対応ブラウザではインストール可能

## 画面構成

| パス | 内容 |
| --- | --- |
| `/` | カレンダーと、選択日の予定・実績 |
| `/templates` | テンプレートの一覧・作成・削除・適用 |
| `/exercises` | 種目の一覧・作成・編集・削除 |
| `/stats` | 週間・月間・種目別進捗の統計 |
| `/settings` | ユーザー設定 |

## 技術構成

- **フレームワーク:** Next.js 15（App Router） / React 19 / TypeScript
- **UI:** Tailwind CSS、shadcn/ui（Radix UI）、Lucide Icons
- **データベース:** Neon Serverless Postgres（`@neondatabase/serverless`）
- **グラフ・日付:** Recharts、date-fns（日本語ロケール）
- **PWA:** Web App Manifest と独自 Service Worker

画面は主にクライアントコンポーネントで構成され、`app/actions.ts` の Server Actions を介して Postgres を読み書きします。現時点では認証は未接続で、すべての操作を `DEFAULT_USER_ID = 1` として扱います。

## ディレクトリ構成

```text
app/
  page.tsx                 # カレンダー画面
  exercises/page.tsx       # 種目管理画面
  templates/page.tsx       # テンプレート画面
  stats/page.tsx           # 統計画面
  settings/page.tsx        # 設定画面
  actions.ts               # データ取得・更新の Server Actions
components/
  calendar-view.tsx        # カレンダーと追加導線
  day-detail.tsx           # 日別の予定・実績表示
  *-dialog.tsx             # 追加・編集ダイアログ
  stats-view.tsx           # 統計のタブ表示
  ui/                      # shadcn/ui コンポーネント
lib/
  db.ts                    # Neon 接続とデータ型
public/
  manifest.json            # PWA マニフェスト
  sw.js                    # Service Worker
```

## セットアップ

### 必要なもの

- Node.js 20 以上（依存関係の型定義は Node.js 22 を使用）
- pnpm
- Neon Postgres の接続文字列

### インストールと起動

```bash
pnpm install
# .env.local を作成し、次の DATABASE_URL を設定
pnpm dev
```

`.env.local` に Neon の接続文字列を設定します。

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

開発サーバーは通常 `http://localhost:3000` で起動します。

## 必要なデータベース

アプリはマイグレーションやスキーマ定義をリポジトリ内に持っていません。接続先には、少なくとも次のテーブルとカラムが必要です。

| テーブル | 用途 | 主なカラム |
| --- | --- | --- |
| `users` | ユーザー設定 | `id`, `name`, `goal_per_week`, `notify_time`, `created_at` |
| `workout_items` | 種目マスター | `id`, `name`, `category`, `video_url` |
| `workout_details` | 種目ごとのセット・回数・重量 | `id`, `item_id`, `sets`, `reps`, `weight`, `is_template`, `created_by`, `created_at` |
| `workout_logs` | 実績 | `id`, `user_id`, `date`, `detail_id`, `memo`, `created_at` |
| `workout_plans` | 予定 | `id`, `user_id`, `date`, `time`, `detail_id`, `repeat_pattern`, `created_at` |

`workout_details.item_id` は `workout_items.id`、`workout_logs.detail_id` と `workout_plans.detail_id` は `workout_details.id` を参照する設計です。初期表示には `users.id = 1` のレコードが必要です。

## 利用可能なコマンド

```bash
pnpm dev    # 開発サーバーを起動
pnpm build  # 本番ビルド
pnpm start  # 本番ビルドを起動
pnpm lint   # リントを実行
```

## 現在の実装上の前提・留意点

- 認証・ユーザー切り替えは未実装で、固定ユーザー ID で動作します。
- 通知のオン／オフ切り替えは画面内の状態のみで、データベース保存や実際のプッシュ通知送信は未実装です。通知時刻のみ保存します。
- 繰り返しパターンは予定レコードに保存しますが、将来の日付へ予定を自動生成する処理はありません。
- テンプレートはカテゴリー単位で一覧にグループ化されます。テンプレート作成画面の「テンプレート名」は、現状は保存時に使用されません。
- `public/sw.js` には `/api/*` を事前キャッシュする指定がありますが、対応する API Route はこのリポジトリ内にはありません。データ操作は Server Actions で行います。
- `next.config.mjs` ではビルド時の ESLint・TypeScript エラーを無視する設定です。本番投入前には別途型検査とリントを通す運用を推奨します。

## 今後の改善候補

- 認証導入とユーザーごとのデータ分離
- データベースのマイグレーション・初期データをリポジトリで管理
- テンプレート名を独立して保存するデータモデル
- 繰り返し予定の自動展開、実際の通知配信
- PWA のキャッシュ対象を App Router と Server Actions の構成に合わせて見直し
