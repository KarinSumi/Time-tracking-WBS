import re

def translate_manual():
    with open('frontend/public/tutorial/manual.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update CSS
    old_css = """        /* Language visibility rules */
        body [lang="th"] { display: none; }
        html[lang="th"] [lang="en"] { display: none; }
        html[lang="th"] [lang="th"] { display: block; }
        html[lang="th"] span[lang="th"] { display: inline-block; }"""
    
    new_css = """        /* Language visibility rules */
        body [lang="th"], body [lang="ja"] { display: none; }
        html[lang="th"] [lang="en"], html[lang="th"] [lang="ja"] { display: none; }
        html[lang="ja"] [lang="en"], html[lang="ja"] [lang="th"] { display: none; }
        html[lang="th"] [lang="th"], html[lang="ja"] [lang="ja"] { display: block; }
        html[lang="th"] span[lang="th"], html[lang="ja"] span[lang="ja"] { display: inline-block; }"""
    
    content = content.replace(old_css, new_css)

    # 2. Update Brand Section
    old_brand = """            <p lang="en">User Manual</p>
            <p lang="th">คู่มือการใช้งาน</p>"""
    new_brand = """            <p lang="en">User Manual</p>
            <p lang="th">คู่มือการใช้งาน</p>
            <p lang="ja">ユーザーマニュアル</p>"""
    content = content.replace(old_brand, new_brand)

    # 3. Update Nav Menu
    nav_replacements = {
        '01. Registration': '01. 登録',
        '02. Dashboard Navigation': '02. ダッシュボードナビゲーション',
        '03. Project Setup': '03. プロジェクト設定',
        '04. Task Planning (WBS)': '04. タスク計画 (WBS)',
        '05. Team Onboarding': '05. チームとメンバーの登録',
        '06. Time Logging': '06. 時間記録と提出',
        '07. Capacity Analytics': '07. リソース分析',
        '08. Superadmin Config': '08. スーパー管理者の設定'
    }

    for eng, jp in nav_replacements.items():
        pattern = r'(<span lang="th">.*?</span>)'
        def nav_repl(m):
            return f'{m.group(1)}\n                    <span lang="ja">{jp}</span>'
        # We need to find the specific block for each nav item.
        # A simpler way:
        block_pattern = f'(<span lang="en">{re.escape(eng)}</span>\\s*<span lang="th">.*?</span>)'
        match = re.search(block_pattern, content)
        if match:
            new_block = match.group(1) + f'\n                    <span lang="ja">{jp}</span>'
            content = content.replace(match.group(1), new_block)

    # 4. Update Language Buttons
    old_btns = """        <div class="lang-toggle-container">
            <button class="lang-btn active" onclick="setLanguage('en', this)">EN</button>
            <button class="lang-btn" onclick="setLanguage('th', this)">TH</button>
        </div>"""
    new_btns = """        <div class="lang-toggle-container">
            <button class="lang-btn active" onclick="setLanguage('en', this)">EN</button>
            <button class="lang-btn" onclick="setLanguage('th', this)">TH</button>
            <button class="lang-btn" onclick="setLanguage('ja', this)">JA</button>
        </div>"""
    content = content.replace(old_btns, new_btns)

    # 5. Badges
    content = content.replace('<span class="role-badge role-all" lang="th">ผู้ใช้ทุกคน</span>', '<span class="role-badge role-all" lang="th">ผู้ใช้ทุกคน</span>\n                <span class="role-badge role-all" lang="ja">すべてのユーザー</span>')
    content = content.replace('<span class="role-badge role-admin" lang="th">ผู้ดูแลระบบ</span>', '<span class="role-badge role-admin" lang="th">ผู้ดูแลระบบ</span>\n                <span class="role-badge role-admin" lang="ja">管理者</span>')
    content = content.replace('<span class="role-badge role-super" lang="th">ผู้ดูแลระบบระดับสูง</span>', '<span class="role-badge role-super" lang="th">ผู้ดูแลระบบระดับสูง</span>\n                <span class="role-badge role-super" lang="ja">スーパー管理者</span>')
    content = content.replace('<h3 class="steps-title" lang="th">ขั้นตอนการใช้งาน</h3>', '<h3 class="steps-title" lang="th">ขั้นตอนการใช้งาน</h3>\n                <h3 class="steps-title" lang="ja">手順</h3>')

    # 6. Content Modules
    modules_jp = {
        '01': {
            'title': 'アカウント登録',
            'desc': '新しいユーザープロフィールを作成し、会社のインスタンスを登録して、ワークスペース環境に安全に参加します。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li>ログインページの下部にある <strong>Register</strong> リンクをクリックします。</li>
                    <li><strong>フルネーム</strong>、<strong>メールアドレス</strong>、<strong>組織名</strong>、および <strong>パスワード</strong> を入力します。</li>
                    <li><strong>利用規約とプライバシーポリシー</strong> を読み、チェックボックスをオンにします。</li>
                    <li>青い <strong>Create Account</strong> ボタンをクリックします。</li>
                    <li>ログインページにリダイレクトされます。登録したメールアドレスとパスワードを入力して <strong>Sign In</strong> をクリックします。</li>
                </ol>'''
        },
        '02': {
            'title': 'ダッシュボードナビゲーション',
            'desc': 'タイムシートウィジェット、アクティブタスクインジケーター、ビジュアルワークカレンダー、一般的なメニュー操作に慣れてください。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li>今週の記録時間を表示する中央の <strong>Timesheet (タイムシート)</strong> を確認します。</li>
                    <li><strong>Active Tasks (アクティブなタスク)</strong> セクションで、現在自分に割り当てられているタスクを確認します。</li>
                    <li>日々の時間記録には、ダッシュボードの <strong>Quick Log (クイックログ)</strong> パネルを使用します。</li>
                    <li><strong>Weekly Visual Calendar (週間カレンダー)</strong> を操作して、作業の分布状況を確認します。</li>
                    <li>左側のサイドバーメニューを使用して、各モジュール（Projects, Plans, Team, Reports, Admin）に移動します。</li>
                </ol>'''
        },
        '03': {
            'title': 'プロジェクトとワークスペースの設定',
            'desc': 'クライアントプロジェクトを開始し、プロジェクトを戦略的なフェーズに分割し、開発タスクを割り当てます。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li>左側のサイドバーから <strong>Projects</strong> ページに移動します。</li>
                    <li>右上の青い <strong>Add Project</strong> ボタンをクリックします。</li>
                    <li><strong>プロジェクト名</strong>（例：<code>Stitch Dashboard</code>）を入力し、カラータグを選択して <strong>Save</strong> をクリックします。</li>
                    <li>プロジェクトの横にある <strong>Phases</strong> タブをクリックします。</li>
                    <li><strong>Add Phase</strong> をクリックし、フェーズ名（例：<code>Build</code>）を入力して <strong>Save</strong> をクリックし、プロジェクトを分割します。</li>
                </ol>'''
        },
        '04': {
            'title': 'タスク計画 (WBS)',
            'desc': '階層的なタスクを構造化し、タスクの依存関係を強制し、計画の見積もりを設定し、ガントタイムラインを検査します。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li>左側のサイドバーから <strong>Plans</strong> ページに移動します。</li>
                    <li>ドロップダウンフィルターから対象の <strong>Project (プロジェクト)</strong> と <strong>Phase (フェーズ)</strong> を選択します。</li>
                    <li><strong>Add Task</strong> ボタンをクリックして、WBSに新しいタスクを追加します。</li>
                    <li><strong>タスクの説明</strong>, <strong>開始日</strong>, <strong>終了日</strong>, <strong>予定時間</strong> を入力し、チームメンバーに割り当てます。</li>
                    <li>階層を作成するには、ドロップダウンメニューから <strong>Parent Task (親タスク)</strong> を設定します（例：<code>UI Components</code> を <code>Project Foundation</code> の下にネストする）。</li>
                    <li><strong>Save</strong> をクリックすると、タスクツリーとインタラクティブな <strong>ガントチャート</strong> が表示されます。</li>
                </ol>'''
        },
        '05': {
            'title': 'チームとメンバーの登録',
            'desc': '標準のExcelスプレッドシートを使用して企業のメンバーをインポートし、マネージャーの報告関係を維持します。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li>左側のサイドバーから <strong>Team</strong> ページに移動します。</li>
                    <li><strong>Bulk Register</strong> をクリックしてアップロードセクションを開きます。</li>
                    <li><strong>Download Template</strong> をクリックして、標準のExcelテンプレートをダウンロードします。</li>
                    <li>ファイルを開き、従業員の <strong>名前</strong>, <strong>メールアドレス</strong>, <strong>役割</strong> (USER/ADMIN), および <strong>マネージャーのメールアドレス</strong> を入力します。</li>
                    <li>スプレッドシートを保存し、画面に戻ってファイルを選択またはドラッグし、<strong>Upload</strong> をクリックします。</li>
                    <li>新しいメンバーとマネージャーの関係がチーム一覧に反映されたことを確認します。</li>
                </ol>'''
        },
        '06': {
            'title': '時間記録と提出',
            'desc': 'クイックログを介して稼働時間を記録し、毎週のタイムシートの下書きを確認し、管理者の検証のためにログを提出します。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li>ダッシュボードで <strong>Quick Log Time</strong> ウィジェットを見つけます。</li>
                    <li>対象の <strong>Project</strong>, <strong>Phase</strong>, および <strong>WBS Planned Task</strong> を選択します。</li>
                    <li><strong>Worked Hours (作業時間)</strong>（例：<code>4</code>）を入力し、作業内容の簡単な説明を記入します。</li>
                    <li><strong>Log Time</strong> をクリックして保存します。これにより、ステータスが <code>DRAFT</code> として記録されます。</li>
                    <li><strong>Time Logs</strong> ページに移動します。チェックボックスで下書きの記録を選択し、<strong>Submit</strong> をクリックして承認を申請します。</li>
                </ol>'''
        },
        '07': {
            'title': 'リソース分析とヒートマップ',
            'desc': 'チームのキャパシティヒートマップを分析し、稼働率を追跡し、計画と実績の差異を評価します。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li><strong>Reports</strong> ページに移動し、<strong>Capacity</strong> タブをクリックします。</li>
                    <li>日付ピッカーを使用して <strong>Start Date (開始日)</strong> と <strong>End Date (終了日)</strong> を設定し、特定の期間を指定します。</li>
                    <li><strong>Resource Heatmap (リソースヒートマップ)</strong> を確認します：
                        <ul>
                            <li>🟩 <strong>緑色</strong>: 通常の割り当てと健全な稼働率。</li>
                            <li>🟥 <strong>赤色</strong>: リソースの過剰割り当て（1日に8時間以上）。</li>
                            <li>⬛ <strong>灰色</strong>: 週末および会社の休日。</li>
                        </ul>
                    </li>
                    <li>右上の <strong>Export Report</strong> ボタンをクリックして、CSV形式の容量レポートをダウンロードします。</li>
                </ol>'''
        },
        '08': {
            'title': 'スーパー管理者の設定とブランディング',
            'desc': 'テーマのブランディングカラー、組織ロゴのアップロードなど、ホワイトラベルのカスタマイズを適用します。',
            'steps': '''<ol class="steps-list" lang="ja">
                    <li>サイドバーから <strong>Admin Settings</strong>（または Admin）ページに移動します。</li>
                    <li><strong>Branding Customization</strong> パネルを見つけます。</li>
                    <li>カスタムのプライマリテーマカラーを入力します（例：オレンジの場合は <code>#ff5722</code>、またはパレットから選択）。</li>
                    <li>アップロードウィジェットを使用して、企業の <strong>ロゴ画像</strong> を選択します。</li>
                    <li><strong>Save Customization</strong> をクリックします。サイドバーのロゴとテーマのアクセントカラーがリアルタイムで更新されることを確認します。</li>
                </ol>'''
        }
    }

    # Add <h2 lang="ja"> and <p lang="ja"> right after the <h2 lang="th"> and <p lang="th"> for each section
    for mod_num, jp_data in modules_jp.items():
        # Insert H2 and P
        h2_th_pattern = r'(<h2 lang="th">.*?</h2>)'
        p_th_pattern = r'(<p class="module-desc" lang="th">.*?</p>)'
        
        # We process section by section to avoid matching wrong modules, but a global replace with search is tricky.
        # Let's find the section first.
        section_pattern = f'<section id=".*?".*?<!-- Module {mod_num} -->'
        # Actually it's easier to find the TH h2 that is close to the EN h2 of that module.
        # But we can just use re.sub on the whole content by matching the specific EN H2.
        # Since I don't know the exact EN H2 text without looking it up, I'll iterate through sections using the module comment.
        pass

    # Better approach: split by '<section id="'
    sections = content.split('<section id="')
    new_sections = [sections[0]]
    for i in range(1, len(sections)):
        sec = sections[i]
        mod_index = str(i).zfill(2)
        if mod_index in modules_jp:
            data = modules_jp[mod_index]
            # Replace H2
            sec = re.sub(r'(<h2 lang="th">.*?</h2>)', r'\1\n            <h2 lang="ja">' + data['title'] + '</h2>', sec, count=1)
            # Replace P
            sec = re.sub(r'(<p class="module-desc" lang="th">.*?</p>)', r'\1\n            <p class="module-desc" lang="ja">' + data['desc'] + '</p>', sec, count=1)
            # Replace steps
            sec = re.sub(r'(</ol>\s*)(</div>\s*</section>)', r'\1' + data['steps'] + r'\n            \2', sec, count=1)
        
        new_sections.append(sec)

    content = '<section id="'.join(new_sections)

    with open('frontend/public/tutorial/manual.html', 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    translate_manual()
