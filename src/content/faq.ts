import type { LocalizedText } from "@/types";
const L = (en: string, zh: string): LocalizedText => ({ en, zh });

/** Generic FAQ. Keep answers factual; anything uncertain points to AKKI confirmation. */
export const generalFaq: { q: LocalizedText; a: LocalizedText }[] = [
  { q: L("Do I need my own bike?", "我需要自備單車嗎？"), a: L("No. You can request a rental bike when booking, subject to availability.", "不需要。預約時可申請租借單車，視乎供應。") },
  { q: L("Is a helmet required?", "必須戴頭盔嗎？"), a: L("Wear one. Helmets are strongly expected on the trails and AKKI will confirm the exact rules. Ask about rental helmets when booking.", "請佩戴。賽道上強烈建議所有車手戴頭盔，確實規定以 AKKI 為準。預約時可查詢頭盔租借。") },
  { q: L("Can children ride?", "小朋友可以參加嗎？"), a: L("Yes, with a guardian’s consent and supervision. Age guidance is shown on each trail and programme.", "可以，但須有監護人同意及看管。年齡指引會顯示於各賽道及課程。") },
  { q: L("What happens in bad weather?", "天氣惡劣會怎樣？"), a: L("Park status is updated on the homepage. If AKKI closes for safety, riders can rebook or request a refund under the cancellation policy.", "場地狀態會於首頁更新。如因安全關閉，車手可按取消政策改期或申請退款。") },
  { q: L("How do I cancel or change a booking?", "如何取消或更改預約？"), a: L("Open My Bookings and send a cancel or change request. Terms are shown before you pay.", "於「我的預約」提交取消或更改申請，付款前會顯示條款。") },
];
