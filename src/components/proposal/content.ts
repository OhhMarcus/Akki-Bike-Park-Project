import { BarChart3, CalendarCheck, Database, FileText, Globe, Languages, Megaphone, MessageCircle, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

export interface IconCard {
  icon: LucideIcon;
  title: LocalizedText;
  body: LocalizedText;
  goal?: LocalizedText;
}

/** Hypotheses to validate with staff, not facts about AKKI. */
export const frictions: IconCard[] = [
  { icon: MessageCircle, title: m("Bookings by chat or phone", "以聊天或電話預約"), body: m("Back-and-forth messages to agree a date and confirm.", "為確定日期及確認而來回溝通。") },
  { icon: Search, title: m("Unclear availability", "名額不清晰"), body: m("Riders cannot see which sessions still have space.", "車手看不到哪些時段仍有名額。") },
  { icon: Languages, title: m("Information in one language", "資訊語言單一"), body: m("Visitors and tourists may need Chinese and English.", "本地及遊客車手可能需要中英文資訊。") },
  { icon: Megaphone, title: m("Events are hard to promote", "活動難以宣傳"), body: m("Dates spread across posts and chats, easy to miss.", "日期散落於帖文及對話中，容易錯過。") },
  { icon: FileText, title: m("Manual waivers and paperwork", "人手處理免責聲明及文件"), body: m("Forms collected on the day slow down entry.", "當日收集表格會拖慢入場。") },
  { icon: Database, title: m("No capacity or customer data", "缺乏容量及客戶數據"), body: m("Hard to see busy periods, repeat riders or enquiry volume.", "難以掌握繁忙時段、回頭客及查詢數量。") },
];

export const benefits: IconCard[] = [
  {
    icon: CalendarCheck,
    title: m("Direct online booking", "直接網上預約"),
    body: m("Riders choose a session and pay in one flow, any hour.", "車手隨時可在同一流程揀時段及付款。"),
    goal: m("Share of bookings made online; time staff spend on booking messages.", "網上預約佔比；職員處理預約訊息所用時間。"),
  },
  {
    icon: Megaphone,
    title: m("Centralised event promotion", "集中活動宣傳"),
    body: m("One events calendar with registration, shared everywhere.", "一個附報名功能的活動日曆，可全面分享。"),
    goal: m("Event registrations per event; enquiry response time.", "每項活動的報名人數；查詢回覆時間。"),
  },
  {
    icon: Globe,
    title: m("Bilingual content", "雙語內容"),
    body: m("Traditional Chinese first, English alongside, on every page.", "每一頁均以繁體中文為主，並附英文。"),
    goal: m("Share of visits and bookings in each language.", "各語言的訪問及預約佔比。"),
  },
  {
    icon: BarChart3,
    title: m("Customer and capacity data", "客戶及容量數據"),
    body: m("See demand by session and who comes back.", "按時段掌握需求，並了解誰會再來。"),
    goal: m("Capacity utilisation on weekdays; repeat-rider rate.", "平日容量使用率；回頭車手比率。"),
  },
];

export const journeyBefore: LocalizedText[] = [m("Message", "傳訊息"), m("Wait for reply", "等待回覆"), m("Confirm date", "確認日期"), m("Pay", "付款"), m("Paperwork", "文件手續")];
export const journeyAfter: LocalizedText[] = [m("Choose experience", "揀選體驗"), m("Pick a slot", "揀時段"), m("Sign waiver", "簽署免責聲明"), m("Pay", "付款"), m("Confirmation", "收到確認")];
export const staffBefore: LocalizedText[] = [m("Read and answer each message", "逐則閱讀及回覆訊息"), m("Check availability by hand", "人手查核名額"), m("Send payment details", "發送付款資料"), m("Track who has paid", "追蹤誰已付款"), m("Collect forms on the day", "當日收集表格")];
export const staffAfter: LocalizedText[] = [m("Review the day's bookings", "查看當日預約"), m("Handle exceptions only", "只處理特殊情況")];

export interface PhaseContent {
  id: "phase1" | "phase2" | "phase3";
  title: LocalizedText;
  deliverables: LocalizedText[];
  provides: LocalizedText[];
}

export const phases: PhaseContent[] = [
  {
    id: "phase1",
    title: m("Brand website and booking prototype", "品牌網站及預約原型"),
    deliverables: [m("Brand website and park information", "品牌網站及樂園資訊"), m("Booking prototype", "預約原型"), m("Events pages", "活動頁面"), m("Bilingual content", "雙語內容"), m("Contact and WhatsApp", "聯絡及 WhatsApp")],
    provides: [m("Official details and photos", "官方資料及相片"), m("Trail and park information", "賽道及樂園資訊"), m("Staff contacts", "職員聯絡")],
  },
  {
    id: "phase2",
    title: m("Live operations", "正式營運"),
    deliverables: [m("Live payments", "線上付款"), m("Automated confirmation emails", "自動確認電郵"), m("Membership integration", "會員整合"), m("Digital waivers", "電子免責聲明"), m("Admin tools", "管理工具"), m("Analytics", "數據分析")],
    provides: [m("Payment account details", "收款帳戶資料"), m("Final waiver text", "免責聲明定稿"), m("Membership rules", "會員規則")],
  },
  {
    id: "phase3",
    title: m("Growth features", "進階功能"),
    deliverables: [m("Loyalty programme", "會員回饋計劃"), m("Advanced customer management", "進階客戶管理"), m("School and corporate booking workflows", "學校及企業預約流程"), m("Merchandise and rental integration", "商品及租借整合"), m("Mobile-app readiness", "手機應用程式準備")],
    provides: [m("Programme and partner rules", "計劃及夥伴規則"), m("Rental and merchandise lists", "租借及商品清單"), m("Feedback from the first phases", "首兩階段的回饋")],
  },
];

export const roadmap: { key: "now" | "next" | "later"; items: LocalizedText[] }[] = [
  { key: "now", items: [m("Brand website", "品牌網站"), m("Booking prototype", "預約原型"), m("Events and contact", "活動及聯絡")] },
  { key: "next", items: [m("Live payments", "線上付款"), m("Confirmation emails", "確認電郵"), m("Waivers and memberships", "免責聲明及會員"), m("Admin tools and analytics", "管理工具及分析")] },
  { key: "later", items: [m("Loyalty", "會員回饋"), m("School and corporate bookings", "學校及企業預約"), m("Rental and merchandise", "租借及商品"), m("Mobile app", "手機應用程式")] },
];

export const needs: { icon: LucideIcon; label: LocalizedText }[] = [
  { icon: Globe, label: m("Official address and map details", "官方地址及地圖資料") },
  { icon: CalendarCheck, label: m("Opening hours and session times", "開放時間及時段") },
  { icon: BarChart3, label: m("Real prices and packages", "真實價格及套票") },
  { icon: Search, label: m("Photos and video of the park", "樂園相片及影片") },
  { icon: FileText, label: m("Waiver text and policies", "免責聲明及政策文本") },
  { icon: Megaphone, label: m("Trail information and rules", "賽道資訊及規則") },
  { icon: Users, label: m("Staff contacts and roles", "職員聯絡及職責") },
];
