import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** visit strings (prefix "visit."). English and Traditional Chinese (HK) side by side. */
export const visitMessages = {
  /* metadata */
  "visit.meta.title": m("Visit: map, hours and getting here", "到訪：地圖、開放時間及交通"),
  "visit.meta.description": m(
    "Where AKKI Bike Park is, pump track hours, getting here by MTR, taxi or car, what to bring, and what happens when the weather turns.",
    "AKKI 位置、Pump Track 開放時間、港鐵、的士或自駕點樣嚟、要帶咩，同天氣有變點安排。",
  ),

  /* hero */
  "visit.hero.title": m("Come *find* us", "嚟*樂園*搵我哋"),
  "visit.hero.lead": m(
    "Where we are, when we're open, what to bring and what happens when the weather turns.",
    "我哋喺邊、幾時開、要帶咩，同天氣有變點安排，全部喺度。",
  ),
  "visit.hero.alt": m("Riders on the pump track at AKKI Bike Park", "車手喺 AKKI 樂園嘅 Pump Track 踩車"),
  "visit.hero.what": m("park overview", "樂園全景"),
  "visit.live.label": m("Right now", "而家"),

  /* map, address, hours */
  "visit.map.title": m("On the *map*", "睇*地圖*"),
  "visit.map.open": m("Open in Google Maps", "喺 Google 地圖打開"),
  "visit.map.preview": m("Map preview", "地圖預覽"),
  "visit.map.alt": m("Stylised map with a pin on the park's area: {area}", "示意地圖，標示樂園所在地區：{area}"),
  "visit.address": m("Address", "地址"),
  "visit.questions": m("Questions before you come?", "出發前有問題？"),
  "visit.newTab": m("(opens in a new tab)", "（會開新分頁）"),

  /* getting here */
  "visit.go.eyebrow": m("Getting here", "交通"),
  "visit.go.title": m("Getting *here*", "*交通*指南"),
  "visit.go.lead": m("Pick how you're coming.", "揀你嘅交通方式。"),
  "visit.go.tabs": m("Ways to get here", "交通方式"),
  "visit.go.mtr": m("MTR", "港鐵"),
  "visit.go.taxi": m("Taxi", "的士"),
  "visit.go.car": m("Car", "自駕"),
  "visit.go.mtr.step1": m("Take the MTR to {station}.", "喺{station}落車。"),
  "visit.go.mtr.step2": m("From the station, hop in a taxi or walk over.", "出閘後可以搭的士，或者行過嚟。"),
  "visit.go.mtr.tbc": m("Walking route, bus and minibus options: to be confirmed.", "步行路線、巴士及小巴資料：待確認。"),
  "visit.go.transit": m("Public transport directions", "公共交通路線"),
  "visit.go.taxi.show": m("Show the driver", "畀司機睇"),
  "visit.go.taxi.tip": m(
    "The full address is still to be confirmed. Until then, ask for the area.",
    "詳細地址仲待確認，暫時同司機講地區就得。",
  ),
  "visit.go.car.parking": m("Parking", "泊車"),
  "visit.go.car.tbc": m("Parking details to be confirmed.", "泊車資料待確認。"),
  "visit.go.drive": m("Driving directions", "駕車路線"),

  /* FAQ */
  "visit.faq.eyebrow": m("FAQ", "常見問題"),
  "visit.faq.title": m("Good to *know*", "出發前*睇睇*"),
  "visit.faq.wear.q": m("What should I wear and bring?", "要着咩、帶咩？"),
  "visit.faq.wear.a": m(
    "Closed shoes and clothes you can move in. Gloves if you have them, plus water and sunscreen. Helmets stay on the whole time: bring yours or rent one here.",
    "包頭鞋、方便郁動嘅衫褲，有手套就帶埋，記得帶水同防曬。全程要戴頭盔，可以自備或者喺度租。",
  ),
  "visit.faq.age.q": m("Is there a minimum age?", "有冇年齡限制？"),
  "visit.faq.age.a": m(
    "Foundation Class is for ages {f} and up, Advanced Class for {a} and up. Riders under 18 need a parent or guardian to sign the waiver.",
    "基礎班適合 {f} 歲或以上，進階班適合 {a} 歲或以上。18 歲以下騎手須由家長或監護人簽署免責聲明。",
  ),
  "visit.faq.rent.q": m("Can I rent a bike and helmet?", "可唔可以租單車同頭盔？"),
  "visit.faq.rent.a": m(
    "Yes, add them when you book. Tell us your height and we'll suggest a size, from kids' 20-inch bikes up to XL. Bikes are {bike} each, helmets {helmet}.",
    "可以，預約時加埋就得。話我哋知你嘅身高，我哋會建議尺寸，由兒童 20 吋到 XL 都有。單車每架 {bike}，頭盔每個 {helmet}。",
  ),
  "visit.faq.change.q": m("Can I change or cancel a booking?", "可唔可以改期或者取消預約？"),
  "visit.faq.change.a": m(
    "WhatsApp us your booking ref and we'll sort it out. The exact change and refund rules are still to be confirmed.",
    "WhatsApp 我哋你嘅預約編號，我哋會幫你處理。改期同退款細則待確認。",
  ),
  "visit.faq.klook.q": m("I booked on Klook. What now?", "我喺 Klook 訂咗，跟住點？"),
  "visit.faq.klook.a": m(
    "You're all set. Klook bookings go into the same schedule as everyone else's. Bring your Klook confirmation and get there 15 minutes early to sign in and gear up.",
    "搞掂晒。Klook 預約同其他預約都喺同一個時間表。記得帶埋 Klook 確認，提早 15 分鐘到，報到同準備裝備。",
  ),
  "visit.faq.night.q": m("Can I ride after dark?", "夜晚可唔可以踩？"),
  "visit.faq.night.a": m(
    "Evening sessions run until closing time (see the hours above). Lighting details are still to be confirmed, so bring a front light if you have one.",
    "夜晚時段會開到收場時間（睇上面嘅開放時間）。照明安排待確認，有前燈就帶埋。",
  ),
  "visit.faq.rain.q": m("What if it rains?", "落雨點算？"),
  "visit.faq.rain.a": m(
    "Check the weather policy below. If we have to close, everyone booked gets a WhatsApp with their options.",
    "睇下面嘅天氣安排。如果要暫停開放，已預約嘅朋友會收到 WhatsApp 通知同安排。",
  ),

  /* weather policy */
  "visit.weather.eyebrow": m("Weather policy", "天氣安排"),
  "visit.weather.title": m("When the *weather* turns", "*天氣*有變點算"),
  "visit.weather.lead": m(
    "We follow HK Observatory warnings. If we have to close, everyone booked gets a WhatsApp, and their booking is moved or refunded.",
    "我哋跟香港天文台嘅警告安排。如果要暫停開放，已預約嘅朋友會收到 WhatsApp，預約可以改期或者退款。",
  ),
  "visit.weather.sample": m("Sample policy. AKKI will confirm the real rules.", "示範安排，實際規則由 AKKI 確認。"),
  "visit.weather.list": m("What happens under each warning", "各個警告下嘅安排"),
  "visit.weather.now": m("In force now", "現正生效"),
  "visit.weather.outcome.closed": m("Park closes", "暫停開放"),
  "visit.weather.outcome.paused": m("Riding pauses", "暫停踩車"),
  "visit.weather.outcome.open": m("Open with care", "照常開放"),
  "visit.weather.closes": m(
    "Park closes. Bookings are flagged, then moved or refunded.",
    "樂園暫停開放。受影響嘅預約會被標記，之後改期或者退款。",
  ),
  "visit.weather.amber_rain": m(
    "Riding pauses until the rain eases and staff have checked the track.",
    "暫停踩車，等雨勢減弱、職員檢查好場地先繼續。",
  ),
  "visit.weather.t3": m(
    "Riding may pause in strong gusts. Staff make the call on the day.",
    "風勢太大可能暫停踩車，由職員即場決定。",
  ),
  "visit.weather.thunderstorm": m("Riding pauses until the storm passes.", "暫停踩車，等雷暴過咗先。"),
  "visit.weather.very_hot": m(
    "Open, with extra water breaks. Take it easy out there.",
    "照常開放，會加多啲飲水休息。量力而為。",
  ),
} satisfies Record<string, LocalizedText>;
