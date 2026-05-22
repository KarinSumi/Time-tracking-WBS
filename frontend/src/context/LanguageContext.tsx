import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type Language = 'en' | 'th' | 'ja';

type Translations = Record<string, string>;

const dictionaries: Record<Language, Translations> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.logs': 'Time Logs',
    'nav.plans': 'WBS Plans',
    'nav.projects': 'Projects',
    'nav.team': 'Team Roster',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.admin': 'Admin Panel',
    'nav.logout': 'Logout',
    'nav.bulk': 'Bulk Entry',

    // Authentication
    'auth.login.title': 'Sign In to Aion',
    'auth.login.subtitle': 'Enterprise Time Logging & Portfolio Intelligence',
    'auth.login.email': 'Email Address',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Sign In',
    'auth.login.register_prompt': "Don't have an account?",
    'auth.login.register_link': 'Register Company',
    'auth.login.remember_me': 'Remember me',
    'auth.login.forgot_password': 'Forgot password?',
    'auth.login.demo_tip': 'Demo: admin@example.com / password123',
    'auth.register.title': 'Create Organization Account',
    'auth.register.subtitle': 'Register your company and workspace admin profile',
    'auth.register.fullname': 'Full Name',
    'auth.register.orgname': 'Organization Name',
    'auth.register.terms': 'I agree to the Terms of Service & Privacy Policy',
    'auth.register.submit': 'Create Account',
    'auth.register.login_prompt': 'Already registered?',
    'auth.register.login_link': 'Sign In instead',
    'auth.register.confirm_password': 'Confirm Password',
    'auth.register.confirm_password_placeholder': 'Re-enter password',
    'auth.register.password_placeholder': 'Min. 8 chars, 1 upper/lower/num/symbol',
    'auth.register.email_placeholder': 'you@company.com',
    'auth.register.fullname_placeholder': 'John Doe',
    'auth.register.orgname_placeholder': 'Your company name',

    // Dashboard
    'dash.welcome': 'Welcome back',
    'dash.weekly_timesheet': 'Weekly Timesheet',
    'dash.logged_hours': 'Logged Hours',
    'dash.daily_target': 'Daily Target',
    'dash.active_tasks': 'Active Assignments',
    'dash.quick_log': 'Quick Log Time',
    'dash.project': 'Project',
    'dash.phase': 'Phase',
    'dash.task': 'Planned WBS Task',
    'dash.hours': 'Hours Worked',
    'dash.description': 'Description',
    'dash.submit_log': 'Log Time',

    // Settings
    'set.title': 'Settings',
    'set.subtitle': 'Preferences & Organization Control',
    'set.tab.profile': 'Profile',
    'set.tab.org': 'Organization',
    'set.tab.team': 'Team',
    'set.tab.holidays': 'Holidays',
    'set.tab.audit': 'Compliance Audit',
    'set.profile.avatar': 'Upload Avatar',
    'set.profile.fullname': 'Full Name',
    'set.profile.email': 'Email Address',
    'set.profile.org': 'Organization',
    'set.pref.title': 'Preferences',
    'set.pref.dark': 'Dark Appearance',
    'set.pref.dark_desc': 'Switch between light and dark themes',
    'set.pref.notif': 'Notifications',
    'set.pref.notif_desc': 'Receive reminders and updates',
    'set.pref.target': 'Daily Target',
    'set.pref.target_desc': 'Hours you aim to work per day',
    'set.pref.lang': 'Interface Language',
    'set.pref.lang_desc': 'Switch platform display language',
    'set.org.branding': 'Organization Branding',
    'set.org.color': 'Brand Primary Color',
    'set.org.color_desc': 'Applied to buttons, active states, and accents',
    'set.org.logo': 'Organization Logo',
    'set.org.logo_upload': 'Upload New Logo',
    'set.org.logo_desc': 'Recommended: Square SVG or PNG (256x256)',
    'set.org.name': 'Organization Name',
    'set.save': 'Save Changes',
    'set.saving': 'Saving...',
  },
  th: {
    // Navigation
    'nav.dashboard': 'แดชบอร์ด',
    'nav.logs': 'บันทึกเวลา',
    'nav.plans': 'แผนงาน WBS',
    'nav.projects': 'โครงการ',
    'nav.team': 'รายชื่อทีม',
    'nav.reports': 'รายงาน',
    'nav.settings': 'ตั้งค่า',
    'nav.admin': 'ผู้ดูแลระบบ',
    'nav.logout': 'ออกจากระบบ',
    'nav.bulk': 'กรอกข้อมูลจำนวนมาก',

    // Authentication
    'auth.login.title': 'เข้าสู่ระบบ Aion',
    'auth.login.subtitle': 'ระบบลงเวลาและวิเคราะห์ข้อมูลพอร์ตโฟลิโอสำหรับองค์กร',
    'auth.login.email': 'ที่อยู่อีเมล',
    'auth.login.password': 'รหัสผ่าน',
    'auth.login.submit': 'เข้าสู่ระบบ',
    'auth.login.register_prompt': 'ยังไม่มีบัญชีใช่หรือไม่?',
    'auth.login.register_link': 'ลงทะเบียนองค์กร',
    'auth.login.remember_me': 'จดจำฉัน',
    'auth.login.forgot_password': 'ลืมรหัสผ่าน?',
    'auth.login.demo_tip': 'บัญชีตัวอย่าง: admin@example.com / password123',
    'auth.register.title': 'สร้างบัญชีองค์กร',
    'auth.register.subtitle': 'ลงทะเบียนบริษัทและโปรไฟล์ผู้ดูแลระบบของคุณ',
    'auth.register.fullname': 'ชื่อ-นามสกุล',
    'auth.register.orgname': 'ชื่อองค์กร',
    'auth.register.terms': 'ฉันยอมรับเงื่อนไขการบริการและนโยบายความเป็นส่วนตัว',
    'auth.register.submit': 'สร้างบัญชี',
    'auth.register.login_prompt': 'ลงทะเบียนแล้วใช่หรือไม่?',
    'auth.register.login_link': 'เข้าสู่ระบบแทน',
    'auth.register.confirm_password': 'ยืนยันรหัสผ่าน',
    'auth.register.confirm_password_placeholder': 'ป้อนรหัสผ่านอีกครั้ง',
    'auth.register.password_placeholder': 'ขั้นต่ำ 8 ตัวอักษร, พิมพ์ใหญ่/พิมพ์เล็ก/ตัวเลข/สัญลักษณ์ อย่างละ 1',
    'auth.register.email_placeholder': 'you@company.com',
    'auth.register.fullname_placeholder': 'สมชาย ดีใจ',
    'auth.register.orgname_placeholder': 'ชื่อบริษัทของคุณ',

    // Dashboard
    'dash.welcome': 'ยินดีต้อนรับกลับ',
    'dash.weekly_timesheet': 'ไทม์ชีทประจำสัปดาห์',
    'dash.logged_hours': 'ชั่วโมงที่บันทึกแล้ว',
    'dash.daily_target': 'เป้าหมายรายวัน',
    'dash.active_tasks': 'งานที่ได้รับมอบหมาย',
    'dash.quick_log': 'บันทึกเวลาด่วน',
    'dash.project': 'โครงการ',
    'dash.phase': 'ระยะโครงการ',
    'dash.task': 'งาน WBS ที่วางแผนไว้',
    'dash.hours': 'ชั่วโมงที่ทำงาน',
    'dash.description': 'คำอธิบายงาน',
    'dash.submit_log': 'บันทึกเวลา',

    // Settings
    'set.title': 'ตั้งค่า',
    'set.subtitle': 'การตั้งค่าและส่วนควบคุมองค์กร',
    'set.tab.profile': 'โปรไฟล์',
    'set.tab.org': 'องค์กร',
    'set.tab.team': 'ทีม',
    'set.tab.holidays': 'วันหยุด',
    'set.tab.audit': 'การตรวจสอบการทำงาน',
    'set.profile.avatar': 'อัปโหลดรูปโปรไฟล์',
    'set.profile.fullname': 'ชื่อ-นามสกุล',
    'set.profile.email': 'ที่อยู่อีเมล',
    'set.profile.org': 'องค์กร',
    'set.pref.title': 'การตั้งค่าทั่วไป',
    'set.pref.dark': 'โหมดมืด',
    'set.pref.dark_desc': 'สลับระหว่างธีมสว่างและธีมมืด',
    'set.pref.notif': 'การแจ้งเตือน',
    'set.pref.notif_desc': 'รับการแจ้งเตือนและการอัปเดต',
    'set.pref.target': 'เป้าหมายรายวัน',
    'set.pref.target_desc': 'ชั่วโมงการทำงานที่คุณตั้งเป้าหมายในแต่ละวัน',
    'set.pref.lang': 'ภาษาของระบบ',
    'set.pref.lang_desc': 'สลับภาษาที่แสดงบนแพลตฟอร์ม',
    'set.org.branding': 'แบรนด์ดิ้งองค์กร',
    'set.org.color': 'สีหลักของแบรนด์',
    'set.org.color_desc': 'ใช้กับปุ่ม สถานะที่เลือก และสีเน้นต่างๆ',
    'set.org.logo': 'โลโก้องค์กร',
    'set.org.logo_upload': 'อัปโหลดโลโก้ใหม่',
    'set.org.logo_desc': 'แนะนำ: ไฟล์ SVG หรือ PNG ทรงสี่เหลี่ยมจัตุรัส (256x256)',
    'set.org.name': 'ชื่อองค์กร',
    'set.save': 'บันทึกข้อมูล',
    'set.saving': 'กำลังบันทึก...',
  },
  ja: {
    // Navigation
    'nav.dashboard': 'ダッシュボード',
    'nav.logs': 'タイムログ',
    'nav.plans': 'WBS計画',
    'nav.projects': 'プロジェクト',
    'nav.team': 'チームメンバー',
    'nav.reports': 'レポート',
    'nav.settings': '設定',
    'nav.admin': '管理パネル',
    'nav.logout': 'ログアウト',
    'nav.bulk': '一括入力',

    // Authentication
    'auth.login.title': 'Aion にサインイン',
    'auth.login.subtitle': 'エンタープライズタイムロギング＆ポートフォリオインテリジェンス',
    'auth.login.email': 'メールアドレス',
    'auth.login.password': 'パスワード',
    'auth.login.submit': 'サインイン',
    'auth.login.register_prompt': 'アカウントをお持ちではありませんか？',
    'auth.login.register_link': '企業登録する',
    'auth.login.remember_me': 'ログイン状態を保持する',
    'auth.login.forgot_password': 'パスワードをお忘れですか？',
    'auth.login.demo_tip': 'デモ用アカウント: admin@example.com / password123',
    'auth.register.title': '組織アカウントの作成',
    'auth.register.subtitle': '企業と管理者用プロファイルを登録します',
    'auth.register.fullname': '氏名',
    'auth.register.orgname': '組織名',
    'auth.register.terms': '利用規約および個人情報保護方針に同意します',
    'auth.register.submit': 'アカウント作成',
    'auth.register.login_prompt': 'すでに登録されていますか？',
    'auth.register.login_link': '代わりにサインイン',
    'auth.register.confirm_password': 'パスワードの確認',
    'auth.register.confirm_password_placeholder': 'パスワードを再入力してください',
    'auth.register.password_placeholder': '8文字以上、大文字/小文字/数字/記号を各1文字以上',
    'auth.register.email_placeholder': 'you@company.com',
    'auth.register.fullname_placeholder': '山田 太郎',
    'auth.register.orgname_placeholder': '会社名・組織名',

    // Dashboard
    'dash.welcome': 'おかえりなさい',
    'dash.weekly_timesheet': '週間タイムシート',
    'dash.logged_hours': '記録された時間',
    'dash.daily_target': '1日の目標時間',
    'dash.active_tasks': 'アサイン中のタスク',
    'dash.quick_log': 'クイック時間入力',
    'dash.project': 'プロジェクト',
    'dash.phase': 'フェーズ',
    'dash.task': '計画WBSタスク',
    'dash.hours': '稼働時間',
    'dash.description': '業務内容',
    'dash.submit_log': '時間を記録',

    // Settings
    'set.title': '設定',
    'set.subtitle': '個人設定と組織管理',
    'set.tab.profile': 'プロファイル',
    'set.tab.org': '組織',
    'set.tab.team': 'チーム',
    'set.tab.holidays': '祝休日',
    'set.tab.audit': '監査ログ',
    'set.profile.avatar': 'アバターをアップロード',
    'set.profile.fullname': '氏名',
    'set.profile.email': 'メールアドレス',
    'set.profile.org': '組織',
    'set.pref.title': '個人設定',
    'set.pref.dark': 'ダークモード',
    'set.pref.dark_desc': 'ライトテーマとダークテーマを切り替えます',
    'set.pref.notif': '通知設定',
    'set.pref.notif_desc': 'お知らせやリマインダーを受け取ります',
    'set.pref.target': '1日の目標時間',
    'set.pref.target_desc': '1日に目標とする稼働時間',
    'set.pref.lang': '表示言語',
    'set.pref.lang_desc': 'プラットフォームの言語設定を変更します',
    'set.org.branding': '組織ブランディング',
    'set.org.color': 'ブランドプライマリカラー',
    'set.org.color_desc': 'ボタンやアクティブ状態、アクセントカラーに適用されます',
    'set.org.logo': '組織ロゴ',
    'set.org.logo_upload': '新しいロゴをアップロード',
    'set.org.logo_desc': '推奨: 正方形のSVGまたはPNG形式 (256x256)',
    'set.org.name': '組織名',
    'set.save': '変更を保存',
    'set.saving': '保存中...',
  },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'th' || saved === 'ja') {
      return saved;
    }
    // Attempt browser language detection
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'th') return 'th';
    if (browserLang === 'ja') return 'ja';
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string): string => {
    return dictionaries[language][key] || dictionaries['en'][key] || key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
