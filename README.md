# 筋トレサポート

トレーニングの**予定と実績**を、カレンダーを起点にさっと記録するモバイルファーストの Next.js アプリケーションです。種目は事前登録なしで、その場で自由に入力できます。

## 主な機能

- **カレンダー**
  - 日付をタップすると、予定または実績の追加シートを開く
  - 日ごとの予定・実績を一画面で表示
  - 予定を実績として保存、予定・実績の削除
- **簡易入力**
  - 種目・予定名を自由入力。種目の事前登録は不要
  - 最初に表示する入力項目は名前のみ
  - セット数・回数・重量、実績のメモ、予定の時刻は必要な場合だけ入力
- **PWA**
  - Web App Manifest、アプリアイコン、Service Worker の登録を含み、対応ブラウザではインストール可能

## 画面構成

| パス | 内容 |
| --- | --- |
| `/` | カレンダーと、選択日の予定・実績の追加・確認 |

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
  actions.ts               # 予定・実績のデータ取得・更新 Server Actions
components/
  calendar-view.tsx        # カレンダーと日付タップによる追加導線
  day-detail.tsx           # 日別の予定・実績表示
  quick-add-workout-drawer.tsx # 最小入力の追加シート
  simple-workout-item.tsx  # 予定・実績の簡易表示
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
- 自由入力した名称は、既存スキーマとの互換性のため `workout_items` に内部的に自動登録されます。利用者が事前に種目を管理する必要はありません。
- セット数・回数は既存スキーマの必須列のため、未入力時は `0` として保存し、画面上は表示しません。
- 予定は時刻を任意で保存できます。繰り返し予定の入力と将来日付への自動展開は、簡易化に伴い現在の主導線から外しています。
- `public/sw.js` には `/api/*` を事前キャッシュする指定がありますが、対応する API Route はこのリポジトリ内にはありません。データ操作は Server Actions で行います。
- `next.config.mjs` ではビルド時の ESLint・TypeScript エラーを無視する設定です。本番投入前には別途型検査とリントを通す運用を推奨します。

## 今後の改善候補

- 認証導入とユーザーごとのデータ分離
- データベースのマイグレーション・初期データをリポジトリで管理
- 予定の繰り返し登録・自動展開
- PWA のキャッシュ対象を App Router と Server Actions の構成に合わせて見直し
