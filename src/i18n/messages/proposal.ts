import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** proposal page strings. Edit both languages side by side. */
export const proposalMessages = {
  // Top bar
  "proposal.private": m("Private proposal", "私人建議書"),
  "proposal.viewDemo": m("View live demo", "查看示範網站"),
  "proposal.print": m("Print / save as PDF", "列印 / 儲存為 PDF"),
  "proposal.navLabel": m("Proposal sections", "建議書章節"),

  // Section nav
  "proposal.nav.overview": m("Overview", "概覽"),
  "proposal.nav.friction": m("Friction", "常見痛點"),
  "proposal.nav.benefits": m("Benefits", "效益"),
  "proposal.nav.journey": m("Journey", "客戶旅程"),
  "proposal.nav.phases": m("Phases", "階段"),
  "proposal.nav.pricing": m("Pricing", "收費"),
  "proposal.nav.roadmap": m("Roadmap", "路線圖"),
  "proposal.nav.needs": m("From AKKI", "AKKI 需提供"),
  "proposal.nav.next": m("Next step", "下一步"),

  // Hero
  "proposal.hero.eyebrow": m("Proposal for AKKI management", "致 AKKI 管理層的建議書"),
  "proposal.hero.title": m("A booking platform you can already click through", "一個你現在就能親手體驗的預約平台"),
  "proposal.hero.body": m(
    "This is a working prototype, not a mock-up. Riders can browse the park, pick a session, sign a digital waiver and receive a confirmation, while staff manage it all from one admin. We propose a pilot to test it with real riders.",
    "這是可實際操作的原型，並非設計圖。車手可瀏覽樂園、揀選時段、簽署電子免責聲明並收到確認；職員則在同一個後台管理所有預約。我們建議以試行項目，與真實車手一同驗證。",
  ),
  "proposal.hero.approve": m("Approve Pilot Project", "批准試行項目"),
  "proposal.hero.seeDemo": m("See the demo", "體驗示範"),
  "proposal.hero.linkHome": m("Public website", "公眾網站"),
  "proposal.hero.linkBooking": m("Booking flow", "預約流程"),
  "proposal.hero.linkAdmin": m("Staff admin", "職員後台"),
  "proposal.hero.credentials": m("Demo admin login", "示範後台登入"),
  "proposal.hero.credentialsNote": m("Demo credentials only. Data stays in your browser and nothing is charged.", "僅供示範。資料只保存在你的瀏覽器，不會收取任何費用。"),

  // Common section labels
  "proposal.goal": m("Measurable goal", "可量度目標"),
  "proposal.baselineNote": m("Goals are tracked, not promised. Baselines are measured in the pilot.", "目標用作追蹤，並非保證。基線數據將於試行期間量度。"),
  "proposal.illustrative": m("Illustrative", "示意"),

  // Friction
  "proposal.friction.eyebrow": m("Where a platform helps", "平台能協助之處"),
  "proposal.friction.title": m("Typical friction to validate with AKKI staff", "需與 AKKI 職員核實的常見痛點"),
  "proposal.friction.body": m(
    "These are patterns common to outdoor venues. They are hypotheses, not statements about how AKKI operates today. The pilot starts by checking each one with your team.",
    "以下是戶外場地常見的情況，屬假設而非 AKKI 現況的陳述。試行項目會先與你的團隊逐項核實。",
  ),
  "proposal.friction.validate": m("To validate", "待核實"),

  // Benefits
  "proposal.benefits.eyebrow": m("What changes", "改變之處"),
  "proposal.benefits.title": m("Benefits, framed as goals to track", "效益：以可追蹤的目標表達"),
  "proposal.benefits.body": m("Each benefit comes with a metric we would measure from day one. No outcomes are guaranteed.", "每項效益都配有由第一天起量度的指標，不作任何結果保證。"),

  // Journey
  "proposal.journey.eyebrow": m("Customer journey", "客戶旅程"),
  "proposal.journey.title": m("From five back-and-forth steps to five clear ones", "由來回溝通，變成清晰五步"),
  "proposal.journey.body": m("A simplified, illustrative comparison. The real current process is confirmed with AKKI staff in the pilot.", "以下為簡化的示意比較。實際現有流程會在試行期間與 AKKI 職員確認。"),
  "proposal.journey.before": m("Before: by message", "之前：以訊息預約"),
  "proposal.journey.after": m("After: on the platform", "之後：透過平台"),
  "proposal.journey.staff": m("Steps for staff", "職員需處理的步驟"),

  // Phases
  "proposal.phases.eyebrow": m("Implementation", "實施計劃"),
  "proposal.phases.title": m("Three phases, each useful on its own", "三個階段，每階段都能獨立發揮作用"),
  "proposal.phases.body": m("Start small, learn from real riders, then expand. Timelines are placeholders until agreed with AKKI.", "由小規模開始，從真實車手身上學習，再逐步擴展。時間表在與 AKKI 議定前僅為預留。"),
  "proposal.phases.phase": m("Phase {n}", "第 {n} 階段"),
  "proposal.phases.deliverables": m("Deliverables", "交付內容"),
  "proposal.phases.provides": m("What AKKI provides", "AKKI 需提供"),
  "proposal.phases.timeline": m("Timeline", "時間表"),
  "proposal.phases.weeksTbc": m("Weeks: to be agreed", "週數：待議定"),
  "proposal.phases.weeks": m("{n} weeks", "{n} 週"),

  // Pricing
  "proposal.pricing.eyebrow": m("Investment", "投資"),
  "proposal.pricing.title": m("Pricing and support packages", "收費及維護方案"),
  "proposal.pricing.body": m("Prices below are placeholders to be quoted after the pilot workshop. Nothing here is an offer until confirmed in writing.", "以下價格為預留位置，將於試行工作坊後報價。在書面確認前，內容均不構成要約。"),
  "proposal.pricing.tag": m("Placeholder pricing", "預留價格"),
  "proposal.pricing.website": m("Website project (one-off, by phase)", "網站項目（一次性，按階段）"),
  "proposal.pricing.support": m("Monthly support (choose one)", "每月維護（擇一）"),
  "proposal.pricing.tbc": m("HK$ ____ (to be quoted)", "HK$ ____（待報價）"),
  "proposal.pricing.perMonth": m("/ month", "／月"),
  "proposal.pricing.included": m("Included", "包含"),
  "proposal.pricing.select": m("Select this package", "選擇此方案"),
  "proposal.pricing.selected": m("Selected", "已選擇"),
  "proposal.pricing.editOn": m("Edit mode: on", "編輯模式：開"),
  "proposal.pricing.editOff": m("Edit mode", "編輯模式"),
  "proposal.pricing.reset": m("Reset", "重設"),
  "proposal.pricing.editHint": m("Presenter mode: type HK$ amounts into the cards. Stored only in this browser.", "講者模式：在卡片內輸入港元金額，只儲存於此瀏覽器。"),
  "proposal.pricing.amount": m("Amount in HK$", "金額（港元）"),
  "proposal.pricing.oneOff": m("One-off total", "一次性合計"),
  "proposal.pricing.monthly": m("Monthly support", "每月維護"),
  "proposal.pricing.firstYear": m("First-year total", "首年合計"),
  "proposal.pricing.partial": m("Excludes items still to be quoted.", "不包括仍待報價的項目。"),
  "proposal.pricing.totals": m("Totals", "合計"),

  // Roadmap
  "proposal.roadmap.eyebrow": m("Roadmap", "路線圖"),
  "proposal.roadmap.title": m("Now, next, later", "現在、下一步、之後"),
  "proposal.roadmap.now": m("Now", "現在"),
  "proposal.roadmap.next": m("Next", "下一步"),
  "proposal.roadmap.later": m("Later", "之後"),

  // Needs
  "proposal.needs.eyebrow": m("From your side", "需要 AKKI 提供"),
  "proposal.needs.title": m("What AKKI needs to provide", "AKKI 需要提供的資料"),
  "proposal.needs.body": m("Everything in the demo that is not verified is flagged with a Demo label, so nothing invented is mistaken for fact. Supplying the items below lets us replace every placeholder.", "示範網站內所有未經核實的內容都已標示「示範」，避免虛構資料被誤當事實。提供以下資料後，我們便能取代所有預留內容。"),

  // Approve CTA block
  "proposal.cta.title": m("Ready to run the pilot?", "準備好開始試行了嗎？"),
  "proposal.cta.body": m("Approving the pilot confirms interest only. We will follow up to agree scope, timeline and pricing before any work starts.", "批准試行只代表確認意向。在任何工作開始前，我們會跟進並議定範圍、時間表及收費。"),

  // Approve modal
  "proposal.approve.title": m("Approve Pilot Project", "批准試行項目"),
  "proposal.approve.desc": m("Confirm your interest. This is not a contract; we will contact you to agree the details.", "確認你的意向。此舉並非合約，我們會聯絡你議定細節。"),
  "proposal.approve.org": m("Organisation", "機構"),
  "proposal.approve.start": m("Preferred start", "期望開始時間"),
  "proposal.approve.startAsap": m("As soon as possible", "越早越好"),
  "proposal.approve.start1": m("Within 1 month", "一個月內"),
  "proposal.approve.start3": m("Within 3 months", "三個月內"),
  "proposal.approve.startTalk": m("Let's discuss", "再商討"),
  "proposal.approve.note": m("Anything we should know (optional)", "其他備註（選填）"),
  "proposal.approve.submit": m("Confirm interest", "確認意向"),
  "proposal.approve.successTitle": m("Thank you", "多謝"),
  "proposal.approve.successBody": m("Your interest is recorded. We will be in touch to agree scope and timing.", "已記錄你的意向。我們會聯絡你議定範圍及時間。"),
  "proposal.approve.close": m("Close", "關閉"),
  "proposal.approve.prefix": m("Approve Pilot Project", "Approve Pilot Project"),

  // Contact form
  "proposal.contact.eyebrow": m("Questions", "查詢"),
  "proposal.contact.title": m("Contact the developer", "聯絡開發者"),
  "proposal.contact.body": m("Ask about scope, timing or anything in this proposal.", "如對範圍、時間或建議書內容有任何疑問，歡迎查詢。"),
  "proposal.contact.submit": m("Send message", "發送訊息"),
  "proposal.contact.sending": m("Sending…", "發送中…"),
  "proposal.contact.successTitle": m("Message sent", "訊息已發送"),
  "proposal.contact.successBody": m("Thanks. We will reply as soon as we can.", "多謝，我們會盡快回覆。"),
  "proposal.contact.another": m("Send another message", "再發送一則訊息"),
} satisfies Record<string, LocalizedText>;
