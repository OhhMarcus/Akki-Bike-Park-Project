import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** visit page strings. Edit both languages side by side. */
export const visitMessages = {
  "visit.eyebrow": m("Plan your visit", "規劃到訪"),
  "visit.title": m("Visit", "到訪"),
  "visit.lead": m("Everything you need before you ride: where we are, how to get here and what to bring.", "騎行前所需資料：位置、交通及應帶物品。"),

  "visit.map.title": m("Find us", "位置"),
  "visit.map.label": m("Map placeholder showing a pin on a topographic background", "地圖預留位置，於地形圖背景上顯示標記"),
  "visit.map.placeholder": m("Interactive map placeholder", "互動地圖預留位置"),
  "visit.map.open": m("Open in Google Maps", "於 Google 地圖開啟"),
  "visit.address": m("Address", "地址"),

  "visit.dir.title": m("From Tin Shui Wai MTR", "由天水圍港鐵站前往"),
  "visit.dir.note": m("Placeholder guidance. Route details to be confirmed by AKKI.", "預留指引，路線詳情待 AKKI 確認。"),
  "visit.dir.1": m("Exit Tin Shui Wai MTR station.", "離開天水圍港鐵站。"),
  "visit.dir.2": m("Follow the route to the park (transport option and stop to be confirmed).", "按路線前往樂園（交通方式及站點待確認）。"),
  "visit.dir.3": m("Continue on foot or by ride to the entrance (directions to be confirmed).", "步行或乘車前往入口（方向待確認）。"),
  "visit.dir.4": m("Check in at the park entrance with your booking reference.", "帶同預約編號於入口報到。"),

  "visit.tab.label": m("Ways to get here", "前往方式"),
  "visit.tab.car": m("Car", "自駕"),
  "visit.tab.taxi": m("Taxi", "的士"),
  "visit.tab.cycling": m("Cycling", "單車"),
  "visit.tab.transit": m("Public transport", "公共交通"),
  "visit.tab.carBody": m("Check the parking details below before you set off. Allow extra time on weekends and public holidays.", "出發前請先查閱下方泊車資料。週末及公眾假期請預留更多時間。"),
  "visit.tab.taxiBody": m("Show the driver the address or map link above. Pick-up and drop-off arrangements are to be confirmed by AKKI.", "請向司機出示上方地址或地圖連結。上落客安排待 AKKI 確認。"),
  "visit.tab.cyclingBody": m("Riding to the park? Wear your helmet, follow traffic rules and plan a safe route. Bike parking details are to be confirmed by AKKI.", "騎車前來？請佩戴頭盔、遵守交通規則並規劃安全路線。單車停放資料待 AKKI 確認。"),
  "visit.tab.transitBody": m("Public transport routes, stops and times are to be confirmed by AKKI. Check a live journey planner before you travel.", "公共交通路線、站點及班次待 AKKI 確認。出發前請以即時路線規劃器查閱。"),

  "visit.parking": m("Parking", "泊車"),
  "visit.hours": m("Opening hours", "開放時間"),
  "visit.contact": m("Contact", "聯絡"),
  "visit.contact.phone": m("Phone", "電話"),
  "visit.contact.email": m("Email", "電郵"),

  "visit.rules.title": m("Park rules", "場地守則"),
  "visit.rules.1": m("Helmet compulsory for every rider.", "所有車手必須佩戴頭盔。"),
  "visit.rules.2": m("Ride in one direction only on each trail.", "每條賽道只可單向騎行。"),
  "visit.rules.3": m("Stay on marked trails.", "只可行駛已標示的賽道。"),
  "visit.rules.4": m("Respect other riders and give way when asked.", "尊重其他車手，並按指示讓路。"),
  "visit.rules.5": m("Follow staff instructions at all times.", "請時刻遵從職員指示。"),
  "visit.rules.note": m("Final rules to be confirmed by AKKI.", "最終守則待 AKKI 確認。"),

  "visit.status.title": m("Weather & closures", "天氣及關閉安排"),
  "visit.status.body": m("If conditions are unsafe, the park may close or change sessions. Status is updated by park staff on this page and in the announcement bar. Booked riders can rebook or request a refund under the cancellation policy.", "如情況不安全，樂園可能關閉或更改時段。職員會於本頁及公告欄更新狀態。已預約車手可按取消政策改期或申請退款。"),
  "visit.status.policy": m("Read the cancellation policy", "閱讀取消政策"),

  "visit.access.title": m("Accessibility", "無障礙資訊"),
  "visit.access.body": m("Accessibility information is to be confirmed by AKKI. If you have access needs, contact us before your visit and we will advise what is possible.", "無障礙資訊待 AKKI 確認。如有特別需要，請於到訪前聯絡我們，我們會告知可行安排。"),

  "visit.faq.title": m("Visit questions", "到訪常見問題"),
  "visit.faq.1.q": m("What should I bring?", "應帶備甚麼？"),
  "visit.faq.1.a": m("Closed shoes, weather-appropriate clothing, water and your booking reference. Helmets and bikes can be added when booking.", "包頭鞋、合適天氣的衣物、飲用水及預約編號。預約時可加購頭盔及單車租借。"),
  "visit.faq.2.q": m("How early should I arrive?", "應提早多久抵達？"),
  "visit.faq.2.a": m("Arrive a little before your session for check-in and gear fitting. Exact timing is to be confirmed by AKKI.", "請於時段開始前稍早抵達以辦理報到及調校裝備。確切時間待 AKKI 確認。"),
  "visit.faq.3.q": m("Can spectators come along?", "可以陪同觀看嗎？"),
  "visit.faq.3.a": m("Spectator arrangements are to be confirmed by AKKI. Please ask us before you visit.", "觀眾安排待 AKKI 確認，到訪前請先向我們查詢。"),

  "visit.check.title": m("Plan your visit checklist", "到訪準備清單"),
  "visit.check.progress": m("{done} of {total} ready", "已完成 {done}／{total} 項"),
  "visit.check.reset": m("Reset", "重設"),
  "visit.check.print": m("Print checklist", "列印清單"),
  "visit.check.1": m("Booking confirmed and reference saved", "已確認預約並儲存編號"),
  "visit.check.2": m("Helmet packed or added to booking", "已備頭盔或已加購"),
  "visit.check.3": m("Closed shoes and weather-ready clothing", "包頭鞋及合適天氣的衣物"),
  "visit.check.4": m("Water and a snack", "飲用水及小食"),
  "visit.check.5": m("Guardian details ready for riders under 18", "18 歲以下車手已備監護人資料"),
  "visit.check.6": m("Checked park status before leaving", "出發前已查看場地狀態"),
  "visit.check.7": m("Route planned and travel time allowed", "已規劃路線並預留時間"),

  "visit.cta.title": m("Ready to ride?", "準備好出發？"),
} satisfies Record<string, LocalizedText>;
