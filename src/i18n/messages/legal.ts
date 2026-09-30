import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** legal page strings. Edit both languages side by side. */
export const legalMessages = {
  "legal.placeholder": m("Placeholder: to be replaced with text reviewed by AKKI's legal adviser.", "預留內容：將由 AKKI 法律顧問審閱後的正式文本取代。"),
  "legal.placeholderTitle": m("Placeholder document", "預留文件"),
  "legal.toc": m("On this page", "本頁內容"),
  "legal.version": m("Version {v}", "版本 {v}"),
  "legal.related": m("Related documents", "相關文件"),
  "legal.questions": m("Questions about this document?", "對此文件有疑問？"),
  "legal.contactUs": m("Contact us", "聯絡我們"),
  "legal.privacy.title": m("Privacy Policy", "私隱政策"),
  "legal.terms.title": m("Terms & Conditions", "條款及細則"),
  "legal.cancellation.title": m("Cancellation Policy", "取消政策"),
  "legal.waiver.title": m("Waiver & Guardian Consent", "免責聲明及監護人同意"),
} satisfies Record<string, LocalizedText>;
