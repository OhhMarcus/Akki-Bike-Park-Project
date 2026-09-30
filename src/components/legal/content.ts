import { siteConfig } from "@/config/site";
import type { LocalizedText } from "@/types";

const L = (en: string, zh: string): LocalizedText => ({ en, zh });

export type LegalSection = { id: string; h: LocalizedText; p?: LocalizedText[]; ul?: LocalizedText[] };
export type LegalDocId = "privacy" | "terms" | "cancellation" | "waiver";

const N = siteConfig.cancellationWindowHours;

export const legalDocs: Record<LegalDocId, LegalSection[]> = {
  privacy: [
    { id: "intro", h: L("Approach", "方針"), p: [L("These principles describe how AKKI intends to design its booking system to handle rider data with care, with reference to Hong Kong's Personal Data (Privacy) Ordinance (Cap. 486). This is a high-level outline only and is not a statement of legal compliance.", "本文說明 AKKI 擬如何以審慎方式設計預約系統處理車手資料，並參考香港《個人資料（私隱）條例》（第 486 章）。此僅為概括性大綱，並非法律合規聲明。")] },
    { id: "collect", h: L("Data we collect", "我們收集的資料"), ul: [L("Booking details: session, date and experience.", "預約資料：時段、日期及體驗項目。"), L("Participant details: name, age and rider level.", "參加者資料：姓名、年齡及車手級別。"), L("Guardian details for riders under 18.", "18 歲以下車手的監護人資料。"), L("Emergency contact name and phone number.", "緊急聯絡人姓名及電話。"), L("Contact details: email and phone.", "聯絡資料：電郵及電話。")] },
    { id: "purpose", h: L("Purpose", "使用目的"), p: [L("Data is used to run your booking, keep riders safe, contact you about your session and respond to enquiries. Marketing messages are sent only with separate consent.", "資料用於處理預約、保障車手安全、就時段聯絡你及回覆查詢。只有在另行取得同意後才會發送推廣訊息。")] },
    { id: "minimise", h: L("Minimisation", "資料最小化"), p: [L("We aim to ask only for what is needed to run a safe session.", "我們只會要求運作安全活動所需的資料。")] },
    { id: "cards", h: L("Payment data", "付款資料"), p: [L("Card details are not stored by AKKI. Payments in this prototype are demonstration only; a real payment provider handles card data in a live system.", "AKKI 不會儲存信用卡資料。本原型的付款僅為示範；正式系統將由付款服務供應商處理卡片資料。")] },
    { id: "consent", h: L("Consent controls", "同意選項"), p: [L("Consent is requested with clear wording at the point of collection. Marketing consent is optional and separate from booking.", "於收集資料時以清晰字句徵求同意。推廣同意屬自願，並與預約分開。")] },
    { id: "retention", h: L("Retention", "保留期限"), p: [L("Retention periods: to be confirmed by AKKI.", "保留期限：待 AKKI 確認。")] },
    { id: "access", h: L("Access and correction", "查閱及更正"), p: [L("Riders may ask to see or correct their personal data. Request process to be confirmed by AKKI.", "車手可要求查閱或更正個人資料。申請程序待 AKKI 確認。")] },
    { id: "minors", h: L("Minors and guardian consent", "未成年人及監護人同意"), p: [L("For riders under 18, a parent or guardian provides details and consent at booking.", "18 歲以下車手須由家長或監護人於預約時提供資料及同意。")] },
    { id: "requests", h: L("Privacy requests", "私隱查詢"), p: [L(`Send privacy requests to ${siteConfig.contact.email} (placeholder contact, to be confirmed).`, `私隱查詢請發送至 ${siteConfig.contact.email}（預留聯絡方式，待確認）。`)] },
  ],
  terms: [
    { id: "intro", h: L("About these terms", "關於本條款"), p: [L("Placeholder booking terms. Final terms are to be provided by AKKI.", "預留預約條款，正式條款由 AKKI 提供。")] },
    { id: "booking", h: L("Bookings", "預約"), ul: [L("A booking is confirmed once payment or approval is completed.", "完成付款或批核後，預約方為確認。"), L("Bookings are for the named riders, date and session.", "預約適用於所列車手、日期及時段。"), L("Placeholder: transfer rules to be confirmed by AKKI.", "預留：轉讓規則待 AKKI 確認。")] },
    { id: "prices", h: L("Prices and payment", "價格及付款"), p: [L("All prices shown in this prototype are demonstration prices and not real offers. Final prices and accepted payment methods to be confirmed by AKKI.", "本原型顯示的價格均為示範價格，並非真實報價。最終價格及付款方式待 AKKI 確認。")] },
    { id: "rider", h: L("Rider responsibilities", "車手責任"), ul: [L("Wear a helmet at all times on the trails.", "在賽道上須時刻佩戴頭盔。"), L("Follow park rules and staff instructions.", "遵守場地守則及職員指示。"), L("Ride within your ability.", "按自身能力騎行。")] },
    { id: "changes", h: L("Changes by the park", "樂園作出的更改"), p: [L("The park may change or close sessions for safety or weather. See the Cancellation Policy.", "樂園可因安全或天氣更改或關閉時段，詳見取消政策。")] },
    { id: "liability", h: L("Liability", "責任"), p: [L("Placeholder: liability wording to be provided by AKKI's legal adviser.", "預留：責任條款將由 AKKI 法律顧問提供。")] },
  ],
  cancellation: [
    { id: "intro", h: L("Demo policy", "示範政策"), p: [L("This is a demonstration policy, to be confirmed by AKKI. It shows how the booking prototype behaves.", "此為示範政策，待 AKKI 確認，用於展示預約原型的運作。")] },
    { id: "free", h: L("Free cancellation or change", "免費取消或更改"), p: [L(`Riders can cancel or change a booking free of charge up to ${N} hours before the session starts.`, `車手可於時段開始前 ${N} 小時內免費取消或更改預約。`)] },
    { id: "late", h: L("Late changes", "逾時更改"), p: [L(`Requests made less than ${N} hours before the session: treatment to be confirmed by AKKI.`, `於時段開始前少於 ${N} 小時提出的申請：處理方式待 AKKI 確認。`)] },
    { id: "weather", h: L("Weather and closures", "天氣及關閉"), p: [L("If AKKI closes the park or a session for weather or safety, riders can rebook or request a refund.", "如 AKKI 因天氣或安全關閉樂園或時段，車手可改期或申請退款。")] },
    { id: "how", h: L("How to request", "申請方法"), p: [L("Open My Bookings to send a cancel or change request, or contact us.", "於「我的預約」提交取消或更改申請，或聯絡我們。")] },
    { id: "refunds", h: L("Refunds", "退款"), p: [L("Refunds in this prototype are simulated. Real refund timing to be confirmed by AKKI.", "本原型的退款為模擬。實際退款時間待 AKKI 確認。")] },
  ],
  waiver: [
    { id: "intro", h: L("About this waiver", "關於此免責聲明"), p: [L(`Placeholder waiver text, version ${siteConfig.waiverVersion}. The final waiver is to be written and approved by AKKI's legal adviser.`, `預留免責聲明文本，版本 ${siteConfig.waiverVersion}。正式版本須由 AKKI 法律顧問撰寫及批核。`)] },
    { id: "risk", h: L("Acknowledgement of risk", "風險確認"), p: [L("Placeholder: mountain biking involves risk of injury. Riders acknowledge these risks and agree to follow park rules. Final wording to be provided.", "預留：山地單車運動存在受傷風險。車手確認明白風險並同意遵守場地守則。最終字句待提供。")] },
    { id: "rules", h: L("Rules and equipment", "規則及裝備"), ul: [L("Helmet is compulsory.", "必須佩戴頭盔。"), L("Follow staff instructions.", "遵從職員指示。"), L("Report injuries or incidents to staff.", "向職員報告受傷或事故。")] },
    { id: "minors", h: L("Riders under 18", "18 歲以下車手"), ul: [L("A parent or guardian signs on behalf of riders under 18.", "由家長或監護人代 18 歲以下車手簽署。"), L("Guardian details are collected during booking.", "監護人資料於預約時收集。"), L("Guardian identity is verified on arrival.", "監護人身份於抵達時核實。")] },
    { id: "digital", h: L("Digital acceptance", "電子確認"), p: [L("The booking flow records acceptance of this waiver version. Legal effect to be confirmed by AKKI's legal adviser.", "預約流程會記錄此版本免責聲明的確認。法律效力待 AKKI 法律顧問確認。")] },
  ],
};

export const legalOrder: { id: LegalDocId; href: string }[] = [
  { id: "privacy", href: "/privacy" },
  { id: "terms", href: "/terms" },
  { id: "cancellation", href: "/cancellation" },
  { id: "waiver", href: "/waiver" },
];
