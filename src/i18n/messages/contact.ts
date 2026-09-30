import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** contact page strings. Edit both languages side by side. */
export const contactMessages = {
  "contact.eyebrow": m("Get in touch", "聯絡我們"),
  "contact.title": m("Contact", "聯絡"),
  "contact.lead": m("Questions about riding, bookings or working together? Send us a message.", "對騎行、預約或合作有疑問？請向我們留言。"),

  "contact.form.title": m("Send a message", "傳送訊息"),
  "contact.form.topic": m("Topic", "查詢類別"),
  "contact.topic.general": m("General enquiry", "一般查詢"),
  "contact.topic.booking": m("Booking support", "預約支援"),
  "contact.topic.group": m("Group sales", "團體銷售"),
  "contact.topic.partnership": m("Sponsorship & partnership", "贊助及合作夥伴"),
  "contact.help.general": m("Ask us anything about the park.", "有關樂園的任何問題都歡迎查詢。"),
  "contact.help.booking": m("Include your booking reference if you have one. You can also manage bookings in My Bookings.", "如有預約編號請一併提供。你亦可於「我的預約」管理預約。"),
  "contact.help.group": m("For schools, teams and events, the group enquiry form lets you plan size and add-ons.", "學校、團隊及活動查詢，可使用團體查詢表格規劃人數及附加服務。"),
  "contact.help.partnership": m("Tell us about your organisation and what you have in mind.", "請介紹你的機構及合作構思。"),
  "contact.help.groupLink": m("Open the group enquiry form", "前往團體查詢表格"),
  "contact.form.messagePh": m("How can we help?", "我們可以如何協助？"),
  "contact.form.send": m("Send message", "傳送訊息"),
  "contact.form.sending": m("Sending…", "傳送中…"),
  "contact.form.doneTitle": m("Message received", "已收到訊息"),
  "contact.form.doneBody": m("Thanks, {name}. We will reply by email.", "多謝 {name}，我們會以電郵回覆。"),
  "contact.form.another": m("Send another message", "再傳送一則訊息"),

  "contact.info.title": m("Reach us directly", "直接聯絡"),
  "contact.info.phone": m("Phone", "電話"),
  "contact.info.email": m("Email", "電郵"),
  "contact.info.response": m("Expected response time", "預計回覆時間"),
  "contact.info.follow": m("Follow", "關注我們"),
  "contact.info.hours": m("Operating hours", "營運時間"),
  "contact.info.links": m("Looking for something else?", "想找其他資料？"),
  "contact.info.book": m("Book a ride", "預約騎行"),
  "contact.info.groups": m("Groups & private events", "團體及私人活動"),
  "contact.info.visit": m("Plan your visit", "規劃到訪"),
  "contact.social.instagram": m("Instagram", "Instagram"),
  "contact.social.facebook": m("Facebook", "Facebook"),
  "contact.social.youtube": m("YouTube", "YouTube"),
} satisfies Record<string, LocalizedText>;
