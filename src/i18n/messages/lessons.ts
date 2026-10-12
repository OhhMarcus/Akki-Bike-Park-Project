import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** lessons strings (prefix "lessons."). English and Traditional Chinese (HK) side by side. */
export const lessonsMessages = {
  /* metadata */
  "lessons.meta.title": m("Mountain bike lessons", "山地單車課程"),
  "lessons.meta.desc": m(
    "Foundation and Advanced classes at AKKI Bike Park in Sheung Shui. Two-hour small-group lessons in English and Cantonese.",
    "AKKI 丫髻山地單車樂園基礎班及進階班。兩小時小班教學，以英文及廣東話授課。",
  ),
  "lessons.bookMeta.title": m("Book a lesson", "預約課程"),
  "lessons.bookMeta.desc": m(
    "Pick a class, date and time, sign the waiver and pay. Done in a couple of minutes.",
    "揀課程、日期同時間，簽免責聲明再付款，幾分鐘搞掂。",
  ),

  /* /lessons hero */
  /* \u2060 (word joiner) keeps 第一跳 on one line on phones */
  "lessons.hero.title": m("From first laps to first *jumps*", "由第一圈到*第\u2060一\u2060跳*"),
  "lessons.hero.lead": m(
    "Two-hour classes in small groups. Start with the basics, or level up and start sending the jumps.",
    "兩小時小班教學。由基本功學起，或者再升一級，開始玩跳台。",
  ),
  "lessons.hero.packCta": m("5-class pack", "5 堂套票"),
  "lessons.hero.photoAlt": m("Coach and riders on the pump track during a class", "教練同學員喺 Pump Track 上堂"),
  "lessons.hero.photoWhat": m("lesson in action", "上堂相片"),
  "lessons.facts.label": m("Lesson basics", "課程重點"),
  "lessons.facts.langs": m("English & Cantonese", "英文及廣東話"),
  "lessons.facts.hire": m("Bike & helmet hire", "租單車及頭盔"),

  /* class cards */
  "lessons.classes.eyebrow": m("Two classes", "兩個班別"),
  "lessons.classes.title": m("Pick your *level*", "揀你嘅*程度*"),
  "lessons.classes.lead": m(
    "Never ridden off-road? Start with Foundation. Got the basics? Advanced is where the jumps come in.",
    "未試過越野？由基礎班開始。基本功有晒？進階班就開始玩跳台。",
  ),
  "lessons.card.photoAlt": m("Riders in a {lesson} at AKKI Bike Park", "AKKI 丫髻山地單車樂園{lesson}上堂情況"),
  "lessons.card.photoWhat": m("{lesson} action", "{lesson}相片"),
  "lessons.card.ages": m("Ages", "年齡"),
  "lessons.card.minAge": m("{n}+", "{n} 歲或以上"),
  "lessons.card.learn": m("What you'll learn", "你會學到"),
  "lessons.card.next": m("Next classes", "即將開班"),
  "lessons.card.sampleTimes": m("Sample times", "示範時間"),
  "lessons.card.none": m("No open classes in the next 4 weeks.", "未來四星期暫時未有空位。"),
  "lessons.card.noneCta": m("WhatsApp us for a time", "WhatsApp 我哋約時間"),
  "lessons.card.book": m("Book {lesson}", "預約{lesson}"),

  /* 5-class pack */
  "lessons.pack.eyebrow": m("Ride more, pay less", "踩得多，慳得多"),
  "lessons.pack.title": m("5-class *pack*", "5 堂*套票*"),
  "lessons.pack.lead": m(
    "Five classes at the same level for less. Your first class is booked when you buy; the rest stay on your mobile number.",
    "同一程度 5 堂，價錢更抵。買套票時順便預約第一堂，其餘堂數會記錄喺你嘅手提電話號碼。",
  ),
  "lessons.pack.how": m(
    "Booking again? Use the same mobile number and your pack classes show up at checkout.",
    "之後預約用返同一個手提電話號碼，付款時就會見到套票堂數。",
  ),
  "lessons.pack.name": m("{lesson} pack", "{lesson}套票"),
  "lessons.pack.price": m("for {n} classes", "共 {n} 堂"),
  "lessons.pack.each": m("Works out at {price} a class", "平均每堂 {price}"),
  "lessons.pack.save": m("Save {amount} vs {single} for 5 single classes", "比 5 堂單堂（{single}）慳 {amount}"),
  "lessons.pack.valid": m("Use within {n} days of buying", "購買後 {n} 日內有效"),
  "lessons.pack.firstClass": m("Pick the date of your first class at checkout", "預約時一併選擇第一堂日期"),
  "lessons.pack.cta": m("Get the {lesson} pack", "買{lesson}套票"),

  /* coaches */
  "lessons.coaches.eyebrow": m("Coaches", "教練"),
  "lessons.coaches.title": m("Meet the *crew*", "認識*教練*"),
  "lessons.coaches.lead": m(
    "Small groups mean your coach actually watches you ride, then tells you what to fix.",
    "小班教學，教練會專心睇你踩，再話你知邊度要改善。",
  ),
  "lessons.coaches.photoAlt": m("Portrait of {name}", "{name}嘅照片"),
  "lessons.coaches.teaches": m("Teaches in {langs}", "授課語言：{langs}"),

  /* FAQ */
  "lessons.faq.eyebrow": m("Before you ride", "上堂之前"),
  "lessons.faq.title": m("Good to *know*", "上堂*須知*"),
  "lessons.faq.bring.q": m("What should I bring?", "要帶啲咩？"),
  "lessons.faq.bring.a": m(
    "Closed shoes, sportswear you can move in, water, and gloves if you have them. Your helmet stays on the whole time: bring your own or hire one when you book.",
    "請穿包頭鞋及方便活動的運動服，並帶備飲用水；有手套亦可帶備。全程必須佩戴頭盔，可自備或於預約時租用。",
  ),
  "lessons.faq.age.q": m("How old do riders need to be?", "幾多歲可以上堂？"),
  "lessons.faq.age.a": m(
    "Foundation Class is for ages {f} and up, Advanced Class for {a} and up. Riders under 18 need a parent or guardian to sign the waiver.",
    "基礎班適合 {f} 歲或以上，進階班適合 {a} 歲或以上。18 歲以下騎手須由家長或監護人簽署免責聲明。",
  ),
  "lessons.faq.rent.q": m("Can I hire a bike and helmet? What size do I need?", "可唔可以租單車同頭盔？要揀咩尺寸？"),
  "lessons.faq.rent.a": m(
    "Yes. Add a bike ({bike}) or a helmet ({helmet}) when you book. Enter your height and we'll suggest a size, from kids' 20\" and 24\" bikes up to XL.",
    "可以。預約時可加租單車（{bike}）或頭盔（{helmet}）。輸入身高後，系統會建議合適尺寸，由兒童 20 吋、24 吋單車至 XL 均有。",
  ),
  "lessons.faq.rain.q": m("What happens if it rains?", "落雨點算？"),
  "lessons.faq.rain.a": m(
    "We follow the HK Observatory. If a rainstorm warning or typhoon signal stops classes, we'll WhatsApp you to pick a new date.",
    "我們會留意香港天文台的天氣警告。如因暴雨警告或颱風信號暫停上課，我們會以 WhatsApp 通知你另選日期。",
  ),
  "lessons.faq.klook.q": m("I booked on Klook. Do I need to book here too?", "我喺 Klook 訂咗，仲使唔使喺度預約？"),
  "lessons.faq.klook.a": m(
    "No. Booked on Klook? You're already on our list. Just get there 15 minutes early to sign in and gear up.",
    "不用。已在 Klook 預訂的話，你已經在我們的名單上，只需於上課前 15 分鐘到達報到及準備裝備。",
  ),

  /* other ways to book */
  "lessons.other.title": m("Klook or WhatsApp works too", "Klook 或 WhatsApp 都得"),
  "lessons.other.body": m(
    "Lessons are also on Klook, and plenty of riders book with us on WhatsApp.",
    "課程亦可以喺 Klook 預訂，亦有好多騎手直接 WhatsApp 我哋預約。",
  ),
  "lessons.other.klook": m("Booked on Klook? You're already on our list.", "喺 Klook 訂咗？你已經喺我哋嘅名單上。"),
  "lessons.other.wa": m("Book on WhatsApp", "WhatsApp 預約"),
  "lessons.wa.prefill": m("Hi AKKI! I'd like to book a lesson.", "Hi AKKI！我想預約課程。"),

  /* booking flow: page */
  "lessons.book.title": m("Book a *class*", "預約*課程*"),
  "lessons.book.lead": m(
    "Six quick steps. Go back any time: nothing you've filled in gets lost.",
    "六個簡單步驟。隨時可返回上一步修改，已填資料不會遺失。",
  ),

  /* steps */
  "lessons.steps.label": m("Booking steps", "預約步驟"),
  "lessons.steps.count": m("Step {n} of {total}", "第 {n} 步（共 {total} 步）"),
  "lessons.steps.completed": m("completed", "已完成"),
  "lessons.step.class": m("Class & date", "課程及日期"),
  "lessons.step.time": m("Time", "時間"),
  "lessons.step.rider": m("Rider", "騎手資料"),
  "lessons.step.waiver": m("Waiver", "免責聲明"),
  "lessons.step.pay": m("Pay", "付款"),
  "lessons.step.done": m("Done", "完成"),
  "lessons.h.class": m("Pick a class and date", "揀課程同日期"),
  "lessons.h.time": m("Pick a time", "揀時間"),
  "lessons.h.rider": m("Who's riding?", "邊位上堂？"),
  "lessons.h.waiver": m("Sign the waiver", "簽署免責聲明"),
  "lessons.h.pay": m("Check and pay", "確認及付款"),
  "lessons.h.done": m("Booking confirmed", "預約已確認"),

  /* step 1: class & date */
  "lessons.class.legend": m("Class", "課程"),
  "lessons.type.legend": m("Single class or 5-class pack", "單堂或 5 堂套票"),
  "lessons.type.single": m("Single class", "單堂"),
  "lessons.type.singleDetail": m("{price} for this class", "每堂 {price}"),
  "lessons.type.packDetail": m("{price} for 5 · save {save}", "5 堂 {price} · 慳 {save}"),
  "lessons.date.hint": m("Marked days still have space. Book up to 4 weeks ahead.", "有標記的日子尚有名額，可預約未來四星期內的課堂。"),
  "lessons.date.chosen.one": m("{date} · {n} class that day", "{date} · 當日有 {n} 堂"),
  "lessons.date.chosen.other": m("{date} · {n} classes that day", "{date} · 當日有 {n} 堂"),
  "lessons.date.none": m("No open {lesson} dates in the next 4 weeks", "未來四星期暫時未有{lesson}空位"),
  "lessons.date.noneBody": m("WhatsApp us and we'll find a time that works.", "WhatsApp 我哋，一齊約個時間。"),

  /* step 2: time */
  "lessons.time.legend": m("Classes on {date}", "{date}嘅課堂"),
  "lessons.time.taught": m("Taught in {lang}", "{lang}授課"),
  "lessons.time.started": m("Started", "已開始"),
  "lessons.time.none": m("No classes left on this day", "當日已沒有可預約的課堂"),
  "lessons.time.noneBody": m("Pick another date and we'll show you the times.", "請選擇其他日期查看上課時間。"),
  "lessons.time.changeDate": m("Change date", "更改日期"),

  /* step 3: rider */
  "lessons.rider.prefilled": m("Filled in from your last booking on this device.", "已填入你上次在此裝置預約時的資料。"),
  "lessons.rider.ageHint": m("{lesson}: ages {n} and up", "{lesson}適合 {n} 歲或以上"),
  "lessons.rider.minor": m("Under 18? A parent or guardian signs the waiver in the next step.", "未滿 18 歲？下一步須由家長或監護人簽署免責聲明。"),
  "lessons.rider.sizeTitle": m("Suggested bike: {size}", "建議單車尺寸：{size}"),
  "lessons.rider.sizeWhy": m(
    "Based on a height of {cm} cm. Hiring a bike? You can change the size below.",
    "根據 {cm} 厘米身高建議。如需租車，可在下方更改尺寸。",
  ),
  "lessons.rider.sizeWait": m("Enter your height and we'll suggest a bike size.", "輸入身高，系統會建議單車尺寸。"),
  "lessons.rider.advWarn": m(
    "Advanced Class assumes you've got the basics. Never ridden off-road? Foundation Class is the place to start.",
    "進階班需具備基本技巧。如從未試過越野，建議由基礎班開始。",
  ),
  "lessons.rider.switch": m("Switch to Foundation", "改為基礎班"),
  "lessons.rider.pickOne": m("Pick one", "請選擇一項"),
  "lessons.rent.suggestedOpt": m("{size} (suggested)", "{size}（建議）"),
  "lessons.pack.use": m("Use 1 of your pack classes ({n} left)", "使用 1 堂套票（尚餘 {n} 堂）"),
  "lessons.pack.useDetail": m("We found a {lesson} pack on this number, valid until {date}.", "此電話號碼有{lesson}套票，有效期至{date}。"),
  "lessons.pack.buying": m(
    "You're buying a 5-class pack. This class uses the first one; the other {n} stay on your number.",
    "你正在購買 5 堂套票，今次預約會使用第一堂，其餘 {n} 堂會記錄在你的電話號碼。",
  ),

  /* step 4: waiver */
  "lessons.waiver.lead": m("Read it, tick the box and sign with your finger or mouse.", "請細閱內容、剔選同意，再用手指或滑鼠簽名。"),
  "lessons.waiver.minor": m("{name} is under 18, so a parent or guardian needs to tick and sign.", "{name}未滿 18 歲，須由家長或監護人剔選及簽名。"),

  /* step 5: pay */
  "lessons.pay.editClass": m("Change class or time", "更改課程或時間"),
  "lessons.pay.editRider": m("Edit rider details", "修改騎手資料"),
  "lessons.pay.errorTitle": m("We couldn't book that", "未能完成預約"),

  /* step 6: done */
  "lessons.done.packLeft.one": m("{n} class left on your pack", "套票尚餘 {n} 堂"),
  "lessons.done.packLeft.other": m("{n} classes left on your pack", "套票尚餘 {n} 堂"),
  "lessons.done.packUse": m(
    "Use them by {date}. Book with the same mobile number and they show up at checkout.",
    "請於{date}前使用。預約時使用同一手提電話號碼，付款時便會顯示。",
  ),
  "lessons.done.pumpLead": m("Come early and get some laps in on the pump track.", "早啲嚟，順便喺 Pump Track 踩幾圈。"),

  /* summary */
  "lessons.sum.title": m("Your booking", "你的預約"),
  "lessons.sum.notYet": m("Not picked yet", "未選擇"),
} satisfies Record<string, LocalizedText>;
