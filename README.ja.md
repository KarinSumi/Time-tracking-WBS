# Aion Enterprise Time Logger

🌐 **言語の選択 (Select Language)**: [English](README.md) | [ภาษาไทย (Thai)](README.th.md) | 日本語

**Aion Enterprise Time Logger** へようこそ。本プラットフォームは、高精度な時間記録、戦略的なプロジェクト計画、リソース能力インテリジェンス、および組織管理のために設計された包括的な企業向けポートフォリオ管理システムです。

---

## 📖 開発・設計ドキュメント

コード、データベーススキーマ、マルチテナント分離、およびバックエンドサービスパターンの詳細な説明：
👉 **[開発者向けドキュメント & システム設計 (DEVELOPER.md)](DEVELOPER.md)**

---

## ⚡ 1行で自動セットアップ (Windows, Linux, Mac)

システムに **Node.js** と **Git** がインストールされていることを確認してください。ターミナルで以下のコマンドを実行するだけで、リポジトリのクローンから全体の初期設定まで自動的に完了します。

### Linux / macOS:
```bash
git clone https://github.com/KarinSumi/Time-tracking-WBS.git && cd Time-tracking-WBS && node setup.js
```

### Windows (PowerShell):
```powershell
git clone https://github.com/KarinSumi/Time-tracking-WBS.git; cd Time-tracking-WBS; node setup.js
```

*この自動セットアップスクリプトは、必要な依存パッケージをインストールし、サンプルデータベースを復元して、アプリケーションのビルドまでを行います。*

---

## 💾 サンプルデータベースでの即時体験

プリセットされた組織、ユーザー、ガントチャート計画、および時間ログを含むデモ状態にデータベースをいつでもリセットできます。

1. **サンプルデータベースの復元**:
   ```bash
   npm run db:restore-sample
   ```
2. **アプリケーションの実行**:
   ```bash
   npm run dev
   ```

### デモログインアカウント:
- **システム管理者 (Super Admin)**: `superadmin@example.com` / `password123`
- **Stitch & Co (組織管理者)**: `admin@stitch.com` / `password123`
- **Stitch & Co (一般メンバー)**: `alice@stitch.com` / `password123`

---

## 🎥 実演チャプター & ステップバイステップガイド

以下は、システムの8つの主要機能のチャプターです。各項目には実演動画（MP4形式）および再現するための手順が記載されています。

### 1. アカウント登録 (すべてのユーザー)
会社を登録し、プロフィールを作成して、ワークスペースにログインします。

![Account Registration](frontend/public/tutorial/assets/01_register_account.webp)
🎬 **[実演動画（MP4形式）を視聴](frontend/public/tutorial/assets/01_register_account.mp4)**

#### 再現手順:
1. ログイン画面下部にある **Register** リンクをクリックします。
2. **氏名 (Full Name)**、**メールアドレス (Email Address)**、**会社名 (Organization Name)**、および **パスワード (Password)** を入力します。
3. 利用規約とプライバシーポリシーへの同意チェックボックスにチェックを入れる必要があります。
4. 青い **Create Account** ボタンをクリックします。
5. 登録したメールアドレスとパスワードを入力し、**Sign In** をクリックしてログインします。

---

### 2. ダッシュボード操作 (すべてのユーザー)
ウィジェット、アクティブなアサイン情報、およびタイムログカレンダーの構成を理解します。

![Dashboard Navigation](frontend/public/tutorial/assets/02_login_dashboard.webp)
🎬 **[実演動画（MP4形式）を視聴](frontend/public/tutorial/assets/02_login_dashboard.mp4)**

#### 再現手順:
1. 今週記録した合計時間が表示されている **Weekly Timesheet ウィジェット** を確認します。
2. 自分に割り当てられたタスクを含む **Active Tasks** パネルを確認します。
3. 日々の記録のための **Quick Log** フォームを確認します。
4. **Weekly Visual Calendar** にカーソルを合わせて、日々の記録密度を確認します。
5. 左側のサイドバーナビゲーションメニューを使用して、異なるモジュール間を移動します。

---

### 3. プロジェクトとワークスペースの設定 (管理者)
プロジェクトを作成し、それを複数のフェーズ（工程）に分割します。

![Project Setup](frontend/public/tutorial/assets/03_project_setup.webp)
🎬 **[実演動画（MP4形式）を視聴](frontend/public/tutorial/assets/03_project_setup.mp4)**

#### 再現手順:
1. 左側のサイドバーで **Projects** ページに移動します。
2. 右上の **Add Project** ボタンをクリックします。
3. プロジェクト名（例：`Stitch Dashboard`）を入力し、テーマカラーを選択して **Save** をクリックします。
4. 新しく作成したプロジェクトの隣にある **Phases** タブをクリックします。
5. **Add Phase** をクリックし、フェーズ名（例：`Build`）を入力して **Save** をクリックします。

---

### 4. ワークブレイクダウンストラクチャー - WBS (管理者)
階層型の計画を作成し、対話型のガントチャートを構築します。

![Task Planning](frontend/public/tutorial/assets/04_task_planning.webp)
🎬 **[実演動画（MP4形式）を視聴](frontend/public/tutorial/assets/04_task_planning.mp4)**

#### 再現手順:
1. 左側のサイドバーで **Plans** ページに移動します。
2. ドロップダウンから対象 of **Project** と **Phase** を選択して絞り込みます。
3. **Add Task** ボタンをクリックし、WBSリストにタスクを作成します。
4. **タスク内容 (Task Description)**、**開始/終了日 (Start/End Dates)**、**予定時間 (Planned Hours)** を入力し、チームメンバーをアサインします。
5. 必要に応じて **Parent Task** を指定して階層を作成します（例：`UI Components` を `Project Foundation` の子タスクとして配置）。
6. **Save** をクリックすると、階層ツリーと対話型 **Gantt Chart** が即座にレンダリングされます。

---

### 5. チームおよびメンバーの一括招待 (管理者)
チームメンバーを一括でワークスペースに登録します。

![Team Onboarding](frontend/public/tutorial/assets/05_bulk_upload.webp)
🎬 **[実演動画（MP4形式）を視聴](frontend/public/tutorial/assets/05_bulk_upload.mp4)**

#### 再現手順:
1. ナビゲーションメニューから **Team** ページに移動します。
2. **Bulk Register** ボタンをクリックして一括登録モーダルを開きます。
3. **Download Template** をクリックし、標準のExcelテンプレートファイルをダウンロードします。
4. テンプレートファイルに、メンバーの氏名、メールアドレス、役割（USER/ADMIN）、およびマネージャーのメールアドレスを記入します。
5. 記入したExcelファイルをドラッグ＆ドロップまたは選択して、**Upload** をクリックします。
6. チームのグリッドビューおよびマネージャー階層線が自動的に更新されることを確認します。

---

### 6. 時間の記録と申請 (すべてのユーザー)
実働時間を記録し、承認申請を行います。

![Time Logging](frontend/public/tutorial/assets/06_time_logging.webp)
🎬 **[実演動画（MP4形式）を視聴](frontend/public/tutorial/assets/06_time_logging.mp4)**

#### 再現手順:
1. ダッシュボード上の **Quick Log Time** ウィジェットを見つけます。
2. 対象の **Project**、**Phase**、および作業した **WBS Planned Task** を選択します。
3. **作業時間 (Worked Hours)**（例：`4`）を入力し、作業要約を入力します。
4. **Log Time** をクリックします（下書き `DRAFT` として保存されます）。
5. **Time Logs** ページに移動し、下書きのエントリを確認したら、チェックを入れて **Submit** をクリックして承認申請を送信します。

---

### 7. リソース分析 & ヒートマップ (管理者)
チームの稼働状況、過密状態、およびユーティライゼーション率を可視化します。

![Analytics Reports](frontend/public/tutorial/assets/07_analytics_reports.webp)
🎬 **[実演動画（MP4形式）を視聴](frontend/public/tutorial/assets/07_analytics_reports.mp4)**

#### 再現手順:
1. サイドナビゲーションの **Reports** をクリックし、**Capacity** タブを選択します。
2. **開始日 (Start Date)** と **終了日 (End Date)** を設定して対象の期間を絞り込みます。
3. **Resource Capacity Heatmap** を確認します：
   - 🟩 **緑**: 通常稼働（1日最大8時間以下）。
   - 🟥 **赤**: リソース過密状態（1日8時間超）。
   - ⬛ **グレー**: 週末および組織の祝日。
4. 右上の **Export Report** ボタンをクリックすると、CSV形式でリソース能力レポートがダウンロードされます。

---

### 8. スーパー管理者設定 & ブランディング (スーパー管理者)
組織全体のロゴやテーマカラーアクセントをカスタマイズします。

![Superadmin Customization](frontend/public/tutorial/assets/08_superadmin_config.webp)

#### 再現手順:
1. **Super Admin** または権限を持つ管理者アカウントでログインし、**Admin** 設定画面に移動します。
2. **Branding Customization** パネルを見つけます。
3. 任意のコーポレートテーマカラーのHEXコードを設定します（例：オレンジなら `#ff5722`）。
4. 会社の **Logo** 画像ファイルをアップロードします。
5. **Save Customization** をクリックします。ヘッダーのロゴおよびボタンなどのテーマカラーが即座に更新されます。
