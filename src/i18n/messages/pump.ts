import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** pump strings (prefix "pump."). English and Traditional Chinese (HK) side by side. */
export const pumpMessages = {
  /* page */
  "pump.meta.title": m("Pump Track sessions", "Pump Track 時段"),
  "pump.meta.description": m(
    "Live pump track availability for the next two weeks at AKKI Bike Park, Sheung Shui. Pick a day, tap a time, book in under 30 seconds.",
    "AKKI 丫髻山地單車樂園 Pump Track 未來兩星期即時餘位。揀日子、揀時段，30 秒內搞掂預約。",
  ),
  "pump.eyebrow": m("Pump Track sessions", "Pump Track 時段"),
  "pump.title": m("Book your *laps*", "即刻*霸位*"),
  "pump.lead": m(
    "Pick a day, tap a time, pay. You're on the track in under 30 seconds.",
    "揀日子、揀時段、付款，30 秒內搞掂，即刻落場踩。",
  ),
  "pump.photo.alt": m("Rider pumping through the berms of the AKKI pump track", "車手喺 AKKI Pump Track 彎道借力加速"),
  "pump.photo.what": m("pump track action", "Pump Track 動作相"),

  /* key facts */
  "pump.facts": m("Session details", "時段資料"),
  "pump.fact.length": m("Session length", "每節時間"),
  "pump.fact.capacity": m("Riders per session", "每節人數"),
  "pump.fact.price": m("Per rider", "每位收費"),
  "pump.fact.bike": m("Bike rental", "租單車"),
  "pump.fact.helmet": m("Helmet {price}", "頭盔 {price}"),

  /* picking a day */
  "pump.pickDay": m("Pick a day", "揀日子"),
  "pump.live": m("Live", "即時"),
  "pump.liveHint": m("Spots update as riders book", "餘位會即時更新"),
  "pump.dayCount.one": m("{n} session open", "{n} 節有位"),
  "pump.dayCount.other": m("{n} sessions open", "{n} 節有位"),
  "pump.earlier.one": m("{n} earlier session today is done.", "今日較早嘅 {n} 節已經完結。"),
  "pump.earlier.other": m("{n} earlier sessions today are done.", "今日較早嘅 {n} 節已經完結。"),
  "pump.slot.aria": m("Book {time}, {date}. {status}, {left}.", "預約{date} {time}。{status}，{left}。"),
  "pump.slot.eventLink": m("See the event", "睇活動詳情"),

  /* empty / closed days */
  "pump.empty.rest.title": m("Track's resting", "呢日休息"),
  "pump.empty.rest.body": m("No pump track sessions on {day}. Pick another day.", "{day}冇 Pump Track 時段，揀第二日啦。"),
  "pump.empty.done.title": m("Done for today", "今日收工喇"),
  "pump.empty.done.body": m("Today's sessions have all started. Grab one on another day.", "今日嘅時段已經全部開始咗，揀第二日啦。"),
  "pump.empty.full.title": m("All booked out", "全日爆滿"),
  "pump.empty.full.body": m("Every session left on this day is full or closed.", "呢日剩低嘅時段已經滿晒或者暫停。"),
  "pump.empty.closed.title": m("Track closed", "場地暫停"),
  "pump.empty.closed.body": m("No pump track sessions on this day: {reason}.", "呢日冇 Pump Track 時段：{reason}。"),
  "pump.next": m("Next open: {date}", "下一日有位：{date}"),
  "pump.nearest": m("Closest open day: {date}", "最近有位：{date}"),
  "pump.none": m("Nothing open in the next two weeks. WhatsApp us and we'll find you a time.", "未來兩星期都冇位，WhatsApp 我哋幫你搵時間。"),

  /* week grid (desktop) */
  "pump.week.this": m("This week", "今個星期"),
  "pump.week.next": m("Next week", "下個星期"),
  "pump.week.later": m("Week after", "下下個星期"),
  "pump.week.range": m("{a} – {b}", "{a} 至 {b}"),
  "pump.week.caption": m("Pump Track sessions, {range}", "Pump Track 時段：{range}"),
  "pump.week.outside": m("Not open for booking", "未開放預約"),
  "pump.week.opens": m("Opens {time}", "{time}開放"),
  "pump.week.empty": m("No sessions this week. Try the other week.", "呢個星期冇時段，睇下另一個星期啦。"),

  /* groups */
  "pump.group.lead": m("Group of 7 or more?", "7 人或以上？"),
  "pump.group.cta": m("WhatsApp us", "WhatsApp 我哋"),
  "pump.group.prefill": m(
    "Hi AKKI! We're a group of 7+ and want to ride the pump track on {date}.",
    "Hi AKKI！我哋有 7 個人或以上，想 {date} 嚟踩 Pump Track。",
  ),

  /* booking sheet */
  "pump.sheet.desc": m("Pump Track session · {left}", "Pump Track 時段 · {left}"),
  "pump.step": m("Step {n} of 2 · {label}", "第 {n} 步（共 2 步）· {label}"),
  "pump.step.details": m("Riders & details", "人數及資料"),
  "pump.step.pay": m("Pay", "付款"),
  "pump.perRider": m("{price} per rider", "每位 {price}"),
  "pump.rent.add": m("Rent gear", "租裝備"),
  "pump.rent.hide": m("Hide", "收起"),
  "pump.details": m("Your details", "聯絡資料"),
  "pump.clearDetails": m("Not you? Clear", "不是你？清除"),
  "pump.edit": m("Edit", "修改"),
  "pump.fail.pick": m("Pick another time", "揀第二個時間"),
  "pump.fail.alt": m("Next session with room", "下一節有位"),
  "pump.fail.switch": m("Switch to this one", "轉去呢節"),
} satisfies Record<string, LocalizedText>;
