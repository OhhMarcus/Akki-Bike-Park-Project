import type { LocalizedText } from "@/types";

/**
 * HOW TO EDIT THE PROPOSAL PRICING
 * 1. Replace a `priceHKD: null` with a number (whole HK$), e.g. `priceHKD: 48000`.
 *    `null` renders as "HK$ ____ (to be quoted)" and is treated as "not yet quoted" in totals.
 * 2. Edit `note` and `included` freely (both languages side by side).
 * 3. Phase timelines: set `weeks` to a number once agreed; `null` renders "to be agreed".
 * 4. Presenters can also type numbers live on the page with "Edit mode"; that is kept
 *    only in the presenter's browser (localStorage) and never changes this file.
 * Every value below is a PLACEHOLDER, not a quotation.
 */

export interface PricingTier {
  id: string;
  name: LocalizedText;
  /** One-off build price (website tiers) or monthly price (support tiers), in HKD. null = to be quoted. */
  priceHKD: number | null;
  note: LocalizedText;
  included: LocalizedText[];
}

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

export const websiteTiers: PricingTier[] = [
  {
    id: "web-phase1",
    name: m("Phase 1: Brand site and booking prototype", "第一階段：品牌網站及預約原型"),
    priceHKD: null,
    note: m("One-off. Scope confirmed after the pilot workshop.", "一次性收費。範圍於試行工作坊後確認。"),
    included: [
      m("Bilingual brand website and park information", "雙語品牌網站及樂園資訊"),
      m("Booking flow prototype and events pages", "預約流程原型及活動頁面"),
      m("Contact form and WhatsApp entry points", "聯絡表格及 WhatsApp 入口"),
    ],
  },
  {
    id: "web-phase2",
    name: m("Phase 2: Live operations", "第二階段：正式營運功能"),
    priceHKD: null,
    note: m("One-off. Payment provider fees are separate.", "一次性收費。支付平台費用另計。"),
    included: [
      m("Live payments and confirmation emails", "線上付款及確認電郵"),
      m("Digital waivers and membership integration", "電子免責聲明及會員整合"),
      m("Admin tools and analytics", "管理工具及數據分析"),
    ],
  },
  {
    id: "web-phase3",
    name: m("Phase 3: Growth features", "第三階段：進階功能"),
    priceHKD: null,
    note: m("One-off. Optional; scoped per feature.", "一次性收費。屬選配，按功能訂定範圍。"),
    included: [
      m("Loyalty and advanced customer management", "會員回饋及進階客戶管理"),
      m("School and corporate booking workflows", "學校及企業預約流程"),
      m("Merchandise and rental integration, app readiness", "商品及租借整合、手機應用程式準備"),
    ],
  },
];

export const supportTiers: PricingTier[] = [
  {
    id: "support-essential",
    name: m("Essential care", "基本維護"),
    priceHKD: null,
    note: m("Per month. Hosting, security updates, small content edits.", "每月收費。主機、安全更新及小型內容修改。"),
    included: [m("Hosting and monitoring", "主機及監察"), m("Security and dependency updates", "安全及套件更新"), m("Email support", "電郵支援")],
  },
  {
    id: "support-standard",
    name: m("Standard care", "標準維護"),
    priceHKD: null,
    note: m("Per month. Adds a monthly change allowance.", "每月收費。包含每月修改額度。"),
    included: [m("Everything in Essential", "包含基本維護所有項目"), m("Monthly content and event updates", "每月內容及活動更新"), m("Monthly performance summary", "每月成效摘要")],
  },
  {
    id: "support-growth",
    name: m("Growth partner", "增長夥伴"),
    priceHKD: null,
    note: m("Per month. Ongoing improvement against agreed goals.", "每月收費。按既定目標持續優化。"),
    included: [m("Everything in Standard", "包含標準維護所有項目"), m("Goal tracking and quarterly review", "目標追蹤及季度檢討"), m("Priority response", "優先回覆")],
  },
];

/** Timeline placeholders per phase. `weeks: null` renders as "to be agreed". */
export const phaseTimelines: Record<"phase1" | "phase2" | "phase3", { weeks: number | null }> = {
  phase1: { weeks: null },
  phase2: { weeks: null },
  phase3: { weeks: null },
};
