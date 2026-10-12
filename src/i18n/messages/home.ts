import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** home strings (prefix "home."). English and Traditional Chinese (HK) side by side. */
export const homeMessages = {
  /* metadata */
  "home.meta.title": m("Pump track, lessons and races", "Pump Track、課程同比賽"),
  "home.meta.description": m(
    "Pump track, jumps and trails. See if the park's open, book a lesson or a pump track session, and catch the next race.",
    "Pump Track、跳台同山徑。睇下樂園開唔開、預約課程同 Pump Track 時段，仲有下一場比賽。",
  ),

  /* hero */
  "home.hero.line": m(
    "Pump track and jumps here, trails right next door. Bring your bike or rent one and come ride.",
    "Pump Track、跳台喺度，山徑就喺隔籬。自己帶車或者租架，一齊嚟踩啦！",
  ),

  /* live park status card */
  "home.status.title": m("Park status", "樂園狀態"),
  "home.status.updated": m("Updated {time}", "{time}更新"),
  "home.status.humidity": m("Humidity {n}%", "濕度 {n}%"),
  "home.status.when": m("{day} {time}", "{day}{time}"),
  "home.status.nextPump": m("Next free pump track session", "下一節有位嘅 Pump Track"),
  "home.status.noPump": m("No free sessions in the next two weeks.", "未來兩星期暫時冇位。"),
  "home.status.nextRace": m("Next race", "下一場比賽"),
  "home.status.noRace": m("No races on the calendar yet.", "暫時未有比賽。"),
  "home.status.policy": m("What it means", "有咩影響"),
  "home.status.seeTimes": m("See all times", "睇所有時段"),
  "home.status.seeEvents": m("See events", "睇活動"),

  /* pump track teaser */
  "home.pump.title": m("Grab a *session*", "揀個*時段*嚟踩"),
  "home.pump.lead": m(
    "Pick a time, add a bike or helmet if you need one, done.",
    "揀個時間，要租單車或者頭盔就加埋，搞掂。",
  ),
  "home.pump.length": m("{d} sessions", "每節 {d}"),
  "home.pump.emptyTitle": m("Nothing open soon", "暫時冇時段"),
  "home.pump.emptyBody": m("Check the calendar for the next free session.", "睇下日曆，搵下一個有位嘅時段。"),

  /* lessons teaser */
  "home.lessons.title": m("Level *up*", "技術*升呢*"),
  "home.lessons.lead": m(
    "Two-hour classes in small groups, taught in English and Cantonese. Start from zero or take your riding further.",
    "兩小時小組班，英文或廣東話授課。由零開始，或者再上一層樓。",
  ),
  "home.lessons.group": m("Small group, max {n}", "小組，最多 {n} 人"),
  "home.lessons.langs": m("English & Cantonese", "英文及廣東話"),
  "home.lessons.next": m("Next class", "下一堂"),
  "home.lessons.nextNone": m("No open classes in the next 4 weeks.", "未來 4 星期暫時冇位。"),
  "home.lessons.book": m("Book {lesson}", "預約{lesson}"),
  "home.lessons.all": m("All about lessons", "課程詳情"),
  "home.lessons.photoAlt": m("Riders in an AKKI {lesson}", "AKKI {lesson}上堂情況"),
  "home.lessons.photoWhat": m("{lesson} in action", "{lesson}上堂相"),
  "home.pack.body": m(
    "Riding most weeks? Buy five classes in one go and pay less per class.",
    "差唔多每星期都嚟？一次過買 5 堂，每堂平啲。",
  ),
  "home.pack.save": m("Save {amount}", "慳 {amount}"),
  "home.pack.perClass": m("{amount} per class", "每堂 {amount}"),
  "home.pack.cta": m("{lesson} pack", "{lesson}套票"),

  /* photo band */
  "home.ride.title": m("Trails start *next door*", "*山徑*就喺隔籬"),
  "home.ride.body": m(
    "Warm up on the pump track, then head out on the trails right next to the park.",
    "喺 Pump Track 熱完身，就出發去樂園隔籬嘅山徑。",
  ),
  "home.ride.cta": m("Find a group ride", "搵團踩"),
  "home.ride.alt": m("Mountain biker on the trails next to AKKI Bike Park", "山地單車手喺 AKKI 樂園隔籬嘅山徑踩車"),
  "home.ride.what": m("trail riding", "山徑踩車"),

  /* events teaser */
  "home.events.title": m("Races, jams and group *rides*", "比賽、夜 Jam 同*團踩*"),
  "home.events.lead": m(
    "Race the series, session a night jam or roll out with the crew.",
    "參加系列賽、夜晚嚟 Jam，或者同大家一齊出發團踩。",
  ),
  "home.events.emptyTitle": m("Nothing on just yet", "暫時未有活動"),
  "home.events.emptyBody": m("New events show up here. Check back soon.", "新活動會喺度公佈，遲啲再嚟睇下。"),

  /* club teaser */
  "home.club.title": m("Join the *crew*", "加入*單車會*"),
  "home.club.body": m(
    "Ride here a lot? Join the AKKI Bike Club. Signing up online takes a minute.",
    "成日嚟踩？加入 AKKI 單車會，網上報名一分鐘搞掂。",
  ),
  "home.club.fee": m("{price} a year", "每年 {price}"),
  "home.club.cta": m("Join the club", "加入單車會"),

  /* visit teaser */
  "home.visit.title": m("Where we *ride*", "我哋喺*邊度*"),
  "home.visit.getting": m("MTR to {station}, then taxi or walk.", "喺{station}落車，再搭的士或者步行。"),
  "home.visit.cta": m("Plan your visit", "到訪資訊"),
} satisfies Record<string, LocalizedText>;
