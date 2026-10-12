import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** club strings (prefix "club."). English and Traditional Chinese (HK) side by side. */
export const clubMessages = {
  /* metadata */
  "club.meta.title": m("AKKI Bike Club", "AKKI 單車會"),
  "club.meta.description": m(
    "Join the AKKI Bike Club. Sign up online in a minute and ride with the crew.",
    "加入 AKKI 單車會，網上一分鐘報名，同大家一齊踩。",
  ),

  /* hero */
  "club.hero.eyebrow": m("AKKI Bike Club", "AKKI 單車會"),
  "club.hero.title": m("Ride with the *crew*", "同大家*一齊踩*"),
  "club.hero.lead": m(
    "AKKI's own bike club, for riders who'd rather be at the park. Sign up below and we'll take it from there.",
    "AKKI 自己嘅單車會，啱晒成日想嚟樂園踩車嘅你。喺下面報名，其餘交畀我哋。",
  ),
  "club.hero.cta": m("Sign up", "即刻報名"),
  "club.photo.alt": m("AKKI Bike Club riders together at the park", "AKKI 單車會會員喺樂園一齊踩車"),
  "club.photo.what": m("club riders", "單車會會員"),

  /* perks (placeholder list) */
  "club.perks.title": m("Member *perks*", "會員*福利*"),
  "club.perks.note": m("Placeholder list. AKKI will confirm the real perks.", "預留內容，實際福利由 AKKI 確認。"),
  "club.perks.rates": m("Member rates on pump track sessions", "Pump Track 時段會員價"),
  "club.perks.rides": m("Regular club rides", "定期會員團踩"),
  "club.perks.early": m("Early entry for races and events", "比賽同活動優先報名"),
  "club.perks.news": m("Club news and ride plans first", "第一時間收到會訊同團踩消息"),

  /* fee */
  "club.fee.label": m("Annual fee", "年費"),
  "club.fee.per": m("per year", "每年"),
  "club.fee.note": m(
    "Nothing to pay today. We'll sort the fee when we confirm your membership.",
    "今日唔使付款，確認入會後先安排繳費。",
  ),

  /* join form */
  "club.form.title": m("Join the *club*", "報名*入會*"),
  "club.form.lead": m("Takes a minute. We'll WhatsApp you to confirm.", "一分鐘搞掂，我哋會 WhatsApp 你確認。"),
  "club.form.consent": m(
    "I'm happy for AKKI to contact me about the club by WhatsApp or email.",
    "本人同意 AKKI 透過 WhatsApp 或電郵聯絡本人有關單車會嘅事宜。",
  ),
  "club.form.minor": m("Under 18? Fill this in with a parent or guardian.", "未滿 18 歲？請同家長或監護人一齊填寫。"),
  "club.form.submit": m("Send application", "遞交申請"),
  "club.form.demo": m("Demo: your details stay in this browser.", "示範：資料只會儲存喺呢個瀏覽器。"),
  "club.val.level": m("Pick your riding experience", "請揀你嘅騎車經驗"),

  /* success */
  "club.done.title": m("You're *in*, {name}", "{name}，*歡迎*加入"),
  "club.done.body": m("Application received. Here's what happens next:", "已收到你嘅申請，接住落嚟："),
  "club.done.step1": m("The AKKI team checks your details.", "AKKI 團隊會核對你嘅資料。"),
  "club.done.step2": m(
    "We WhatsApp you at {phone} to confirm and sort the annual fee.",
    "我哋會 WhatsApp 去 {phone} 確認，同安排繳交年費。",
  ),
  "club.done.step3": m("Then it's ride time. See you at the park.", "跟住就可以一齊踩，樂園見！"),
  "club.done.demo": m(
    "Demo: no message was sent. Your application is now in the staff dashboard.",
    "示範：未有真正發出訊息。你嘅申請已經喺職員後台出現。",
  ),
  "club.done.waPrefill": m(
    "Hi AKKI, it's {name}. I just signed up for the AKKI Bike Club.",
    "Hi AKKI，我係 {name}，啱啱報名咗 AKKI 單車會。",
  ),
  "club.done.dashboard": m("See it in the dashboard", "去後台睇睇"),
  "club.done.another": m("Sign up another rider", "幫另一位報名"),
} satisfies Record<string, LocalizedText>;
