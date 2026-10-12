import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** Admin shell strings (prefix "admin."). Screen strings live in adminOps / adminPlan / adminInsights. */
export const adminMessages = {
  "admin.title": m("AKKI Ops", "AKKI 營運"),
  "admin.nav.label": m("Dashboard", "後台"),
  "admin.nav.today": m("Today", "今日"),
  "admin.nav.bookings": m("Bookings", "預約"),
  "admin.nav.add": m("Add booking", "新增預約"),
  "admin.nav.schedule": m("Schedule", "時間表"),
  "admin.nav.weather": m("Weather closure", "天氣關閉"),
  "admin.nav.events": m("Events", "活動"),
  "admin.nav.riders": m("Riders", "車手"),
  "admin.nav.stats": m("Stats", "數據"),
  "admin.demoMode": m("Demo mode · sample data", "示範模式 · 樣本數據"),
  "admin.noLogin": m("No login in the demo. Real version: staff accounts with roles.", "示範版毋須登入。正式版會有職員帳戶及權限。"),
  "admin.viewSite": m("View site", "睇網站"),
  "admin.reset": m("Reset demo data", "重設示範數據"),
  "admin.resetConfirm": m("Reset all demo changes and reload fresh sample data?", "重設所有示範改動，重新載入樣本數據？"),
  "admin.resetDone": m("Demo data reset", "已重設示範數據"),
  "admin.signedIn": m("Signed in as Demo Staff", "已登入：示範職員"),
} satisfies Record<string, LocalizedText>;
