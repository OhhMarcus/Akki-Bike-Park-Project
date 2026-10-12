import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** events strings (prefix "events."). English and Traditional Chinese (HK) side by side. */
export const eventsMessages = {
  /* page meta */
  "events.meta.title": m("Events & races", "活動及比賽"),
  "events.meta.desc": m(
    "Pump track races, night jams, group rides and kids camps at AKKI Bike Park in Sheung Shui. Check the dates and register online.",
    "上水 AKKI 丫髻山地單車樂園嘅 Pump Track 比賽、夜 Jam、團踩同小朋友營。睇清楚日期，網上報名。",
  ),

  /* listing hero */
  "events.hero.title": m("Races, jams & group *rides*", "比賽、夜 Jam 同*團踩*"),
  "events.hero.lead": m(
    "Timed races on the pump track, night jams under the lights, group rides on the trails next door and kids camps. Pick one, grab a spot, come ride.",
    "Pump Track 計時賽、燈光下嘅夜 Jam、隔籬山徑團踩，仲有小朋友營。揀個啱你嘅，報個名，一齊嚟踩。",
  ),
  "events.next.eyebrow": m("Next race", "下一場比賽"),
  "events.next.cta": m("Grab a spot", "即刻報名"),
  "events.startsIn": m("Starts in", "距離開始"),

  /* type filter */
  "events.filter.label": m("Filter events by type", "按類型篩選活動"),
  "events.filter.all": m("All", "全部"),
  "events.typePlural.race": m("races", "比賽"),
  "events.typePlural.nightjam": m("night jams", "夜 Jam"),
  "events.typePlural.groupride": m("group rides", "團踩"),
  "events.typePlural.kidscamp": m("kids camps", "小朋友營"),
  "events.count.one": m("{n} event", "{n} 個活動"),
  "events.count.other": m("{n} events", "{n} 個活動"),

  /* calendar + list */
  "events.calendar.label": m("Events calendar", "活動日曆"),
  "events.calendar.monthEmpty": m("Nothing on in {month}.", "{month}暫時未有活動。"),
  "events.calendar.jump": m("Go to {month}", "跳去{month}"),
  "events.chip.aria": m("{type}: {title}, {when}", "{type}：{title}，{when}"),
  "events.month.heading": m("On in {month}", "{month}活動"),
  "events.month.none": m("Nothing else coming up in {month}.", "{month}暫時冇其他活動。"),
  "events.list.label": m("Upcoming events", "即將舉行嘅活動"),

  /* empty states */
  "events.empty.title": m("Nothing on the calendar yet", "暫時未有活動"),
  "events.empty.body": m(
    "New dates go up here as soon as they're set. The pump track's open in the meantime.",
    "一有新日期就會喺度公佈。未有活動嘅時候，嚟踩下 Pump Track 啦。",
  ),
  "events.empty.typeTitle": m("No {types} coming up", "暫時未有{types}"),
  "events.empty.typeBody": m(
    "New dates go up here as soon as they're set. Check out the other events in the meantime.",
    "一有新日期就會喺度公佈，可以先睇下其他活動。",
  ),
  "events.empty.showAll": m("Show all events", "顯示全部活動"),

  /* date + time in one line */
  "events.when": m("{date}, {time}", "{date}{time}"),

  /* prices */
  "events.priceFrom": m("from {price}", "{price} 起"),
  "events.priceRange": m("{min} – {max}", "{min} 至 {max}"),

  /* event page */
  "events.back": m("All events", "所有活動"),
  "events.seeAll": m("See all events", "睇晒所有活動"),
  "events.getThere": m("How to get here", "點樣嚟"),
  "events.about": m("The plan", "活動內容"),
  "events.categories": m("Categories", "組別"),
  "events.categoriesLead": m(
    "Each category has its own spots. Pick yours when you register.",
    "每個組別名額分開計，報名時揀返你嗰組。",
  ),
  "events.col.ages": m("Ages", "年齡"),
  "events.col.spots": m("Spots", "名額"),
  "events.onTheDay": m("On the day", "當日流程"),
  "events.day.arrive": m("Sign in", "報到"),
  "events.day.start": m("Kick-off", "正式開始"),
  "events.day.startBody": m("Stick with the crew and follow the staff's calls.", "跟住大隊，聽從職員指示。"),
  "events.day.end": m("Wrap up", "完結"),
  "events.day.endBody": m("That's a wrap. Thanks for riding.", "活動完結，多謝你嚟踩！"),
  "events.bring": m("What to bring", "要帶咩"),
  "events.bring.helmet": m("A helmet, on the whole time. No helmet? Rent one at the park.", "頭盔，全程都要戴。冇頭盔？可以喺樂園租。"),
  "events.bring.bike": m("A bike in good working order. Need a rental? WhatsApp us before the day.", "狀態良好嘅單車。想租車？請喺活動前 WhatsApp 我哋。"),
  "events.bring.shoes": m("Closed shoes and clothes you can move in", "包頭鞋同方便活動嘅衫"),
  "events.bring.water": m("Water and a snack", "水同小食"),
  "events.know": m("Good to know", "注意事項"),
  "events.know.waiver": m(
    "Every rider accepts the waiver. Under 18? A parent or guardian does it for you.",
    "每位騎手都要同意免責聲明。18 歲以下由家長或監護人代為同意。",
  ),
  "events.know.weather": m("If the weather shuts the park, we'll message you on WhatsApp.", "如果因天氣關閉樂園，我哋會 WhatsApp 通知你。"),
  "events.know.spots": m("Spots are limited. Once a category's full, it's full.", "名額有限，額滿即止。"),
  "events.ended.title": m("This one's done", "呢個活動已經完結"),
  "events.ended.body": m("Registration's closed. See what's coming up next.", "報名已經截止，睇下之後仲有咩活動。"),
  "events.full.title": m("Every category's full", "所有組別已經滿晒"),
  "events.full.body": m("Keep an eye on the calendar for the next one.", "留意活動日曆，下次早啲報名！"),
  "events.more.title": m("More *events*", "更多*活動*"),

  /* share */
  "events.share.wa": m("Share on WhatsApp", "WhatsApp 分享"),
  "events.share.text": m("Who's in? {title}, {when} {url}", "一齊去？{title}，{when} {url}"),

  /* photos */
  "events.photo.race.alt": m("Riders racing laps on the pump track", "車手喺 Pump Track 計時比賽"),
  "events.photo.race.what": m("race day", "比賽日"),
  "events.photo.nightjam.alt": m("Riders on the pump track at night under lights", "夜晚燈光下喺 Pump Track 踩車"),
  "events.photo.nightjam.what": m("night jam", "夜 Jam"),
  "events.photo.groupride.alt": m("A group of riders on the trails", "一班車手喺山徑踩車"),
  "events.photo.groupride.what": m("group ride", "團踩"),
  "events.photo.kidscamp.alt": m("Kids practising skills on their bikes", "小朋友踩單車練技術"),
  "events.photo.kidscamp.what": m("kids camp", "小朋友營"),

  /* register sheet */
  "events.reg.step": m("Step {n} of 2", "第 {n} 步（共 2 步）"),
  "events.reg.pick": m("Pick a category", "揀組別"),
  "events.reg.rider": m("Rider", "騎手資料"),
  "events.reg.ageHint": m("This category: {ages}", "此組別：{ages}"),
  "events.reg.minor": m(
    "Under 18? A parent or guardian should fill this in and accept the waiver.",
    "未滿 18 歲？請由家長或監護人填寫及同意免責聲明。",
  ),
  "events.reg.edit": m("Edit details", "修改資料"),
  "events.reg.mate": m("Bring a mate", "叫埋朋友"),
  "events.err.full": m("That category just filled up. Pick another one?", "呢個組別啱啱爆滿，揀過第二個？"),

  /* not found */
  "events.notFound.title": m("Can't find that event", "搵唔到呢個活動"),
  "events.notFound.body": m("It may have finished or come off the calendar.", "活動可能已經完結，或者已從活動日曆移除。"),
} satisfies Record<string, LocalizedText>;
