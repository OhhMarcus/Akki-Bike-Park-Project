import type { LocalizedText } from "@/types";

const m = (en: string, zh: string): LocalizedText => ({ en, zh });

/** home page strings. Edit both languages side by side. */
export const homeMessages = {
  // Hero
  "home.hero.title": m("Ride Hong Kong Differently", "用不一樣的方式騎遍香港"),
  "home.hero.body": m(
    "Accessible progression, expert coaching and a community that rides together, from first pedal to first jump.",
    "循序漸進、專業教學、彼此同行的騎行社群，由第一下踏板到第一次跳躍。",
  ),
  "home.hero.photoAlt": m(
    "A rider leaning into a banked berm on a trail at AKKI Bike Park",
    "車手在丫髻山地單車樂園的賽道上傾斜過彎",
  ),

  // Quick booking
  "home.qb.title": m("Plan your ride", "計劃你的騎行"),
  "home.qb.experience": m("Experience", "體驗項目"),
  "home.qb.date": m("Date", "日期"),
  "home.qb.period": m("Session", "時段"),
  "home.qb.riders": m("Riders", "車手人數"),
  "home.qb.fewer": m("Fewer riders", "減少人數"),
  "home.qb.more": m("More riders", "增加人數"),
  "home.qb.cta": m("Check availability & book", "查詢名額及預約"),
  "home.qb.pastDate": m("Please choose today or a later date.", "請選擇今日或之後的日期。"),
  "home.qb.hintLoading": m("Checking availability…", "正在查詢名額…"),
  "home.qb.hintOk": m("{n} spots left for this session.", "此時段尚餘 {n} 個名額。"),
  "home.qb.hintFew": m("Only {n} spots left. Fewer than your group of {riders}.", "只尚餘 {n} 個名額，少於你的 {riders} 位車手。"),
  "home.qb.hintFull": m("This session is full. Try another session or date.", "此時段已滿，請試試其他時段或日期。"),
  "home.qb.hintClosed": m("The park is not open for this session.", "此時段不開放。"),
  "home.qb.quoteOnly": m("Group experiences are confirmed by enquiry.", "團體項目需經查詢確認。"),

  // Audience
  "home.aud.eyebrow": m("Who it is for", "適合誰人"),
  "home.aud.title": m("Find your line", "找到你的路線"),
  "home.aud.first.title": m("First-Time Riders", "首次騎行"),
  "home.aud.first.body": m("A guided first ride with helmet and bike included. No experience needed.", "教練帶領的首次騎行，包含頭盔及單車，無需任何經驗。"),
  "home.aud.first.cta": m("Book a first ride", "預約首次騎行"),
  "home.aud.exp.title": m("Experienced Riders", "資深車手"),
  "home.aud.exp.body": m("Sharpen your skills with coaching, then ride the trails at your pace.", "透過教學磨練技術，再按自己節奏暢騎賽道。"),
  "home.aud.exp.cta": m("See coaching", "查看教練課程"),
  "home.aud.groups.title": m("Groups & Schools", "團體及學校"),
  "home.aud.groups.body": m("Schools, teams and celebrations, planned around your group.", "學校、團隊及慶祝活動，按你的團體度身安排。"),
  "home.aud.groups.cta": m("Plan a group visit", "籌劃團體到訪"),

  // Highlights
  "home.hl.eyebrow": m("Why AKKI", "為何選擇 AKKI"),
  "home.hl.title": m("Built around the rider", "以車手為本"),
  "home.hl.progression.title": m("Clear progression", "清晰進階路徑"),
  "home.hl.progression.body": m("Step by step from balance and braking to cornering and jumps.", "由平衡、煞車，一步步到過彎與跳躍。"),
  "home.hl.coaching.title": m("Bilingual coaching", "雙語教學"),
  "home.hl.coaching.body": m("Coaching in Cantonese and English for riders of every age.", "以廣東話及英語為各年齡車手授課。"),
  "home.hl.trails.title": m("Trails for every level", "適合各級別的賽道"),
  "home.hl.trails.body": m("Beginner-friendly to advanced terrain, marked by difficulty.", "由新手友善至高階地形，並清楚標示難度。"),
  "home.hl.events.title": m("Events & community", "活動與社群"),
  "home.hl.events.body": m("Clinics, community rides and races to meet fellow riders.", "工作坊、社區騎行及比賽，結識同好。"),
  "home.hl.rental.title": m("Gear rental available", "可租借裝備"),
  "home.hl.rental.body": m("Arrive with nothing but curiosity. Bikes and protective gear can be rented.", "只需帶著好奇心到來，單車及護具均可租借。"),
  "home.hl.safety.title": m("Safety first", "安全至上"),
  "home.hl.safety.body": m("Protective gear guidance, clear trail rules and a supportive team.", "護具指引、清晰賽道規則及貼心團隊。"),

  // Trails
  "home.trail.eyebrow": m("The park", "樂園"),
  "home.trail.title": m("Trails & facilities", "賽道及設施"),
  "home.trail.note": m("Placeholder trail data until AKKI confirms the official layout.", "賽道資料為預留內容，待 AKKI 確認正式佈局。"),
  "home.trail.cta": m("Explore the park", "探索樂園"),

  // Events
  "home.ev.eyebrow": m("Events", "活動"),
  "home.ev.title": m("Upcoming events", "即將舉行的活動"),
  "home.ev.all": m("View all events", "查看所有活動"),
  "home.ev.label": m("Upcoming events carousel", "即將舉行活動輪播"),
  "home.ev.prev": m("Previous events", "上一批活動"),
  "home.ev.next": m("Next events", "下一批活動"),
  "home.ev.slide": m("{i} of {n}", "第 {i} 個，共 {n} 個"),
  "home.ev.empty": m("New events are on the way. Check back soon.", "新活動即將公布，請稍後再看。"),
  "home.ev.free": m("Free", "免費"),

  // Coaching
  "home.co.eyebrow": m("Coaching", "教練課程"),
  "home.co.title": m("Learn with us", "與我們一起學習"),
  "home.co.all": m("See all programmes", "查看所有課程"),

  // Gallery
  "home.gal.eyebrow": m("Gallery", "相片集"),
  "home.gal.title": m("Life at the park", "樂園日常"),
  "home.gal.note": m("Photo placeholders. Add real images in /public and set `src` in Gallery.tsx.", "相片預留位置。請將真實相片放入 /public，並在 Gallery.tsx 設定 `src`。"),
  "home.gal.riding": m("A rider carving through a berm on the flow trail", "車手在流暢賽道的彎道上過彎"),
  "home.gal.coaching": m("A coach demonstrating body position to a small group", "教練向小組示範身體姿勢"),
  "home.gal.kids": m("Young riders practising on the pump track with helmets on", "戴著頭盔的小車手在 Pump Track 練習"),
  "home.gal.events": m("Riders lining up at the start of a community event", "車手在社區活動起點排隊"),
  "home.gal.trails": m("A wide view of the park trails winding through the hillside", "蜿蜒穿過山坡的樂園賽道全景"),
  "home.gal.community": m("Riders sharing a break together after a session", "車手完成課堂後一同休息"),

  // Testimonials
  "home.te.eyebrow": m("Riders", "車手"),
  "home.te.title": m("Rider voices", "車手心聲"),
  "home.te.label": m("Rider quotes", "車手評語"),
  "home.te.prev": m("Previous quote", "上一則評語"),
  "home.te.next": m("Next quote", "下一則評語"),
  "home.te.dot": m("Show quote {i}", "顯示第 {i} 則評語"),
  "home.te.note": m(
    "These are placeholders, not real reviews. Replace them in src/content/testimonials.ts with permissioned quotes.",
    "以下為預留內容，並非真實評語。請在 src/content/testimonials.ts 換上已獲授權的真實評語。",
  ),

  // Location
  "home.loc.eyebrow": m("Visit", "到訪"),
  "home.loc.title": m("Find the park", "前往樂園"),
  "home.loc.address": m("Address", "地址"),
  "home.loc.transit": m("Getting there", "交通"),
  "home.loc.transitBody": m("Directions from Tin Shui Wai MTR are on the visit page.", "由天水圍站前往的路線載於到訪頁面。"),
  "home.loc.cta": m("Directions & visitor info", "路線及到訪資訊"),
  "home.loc.mapAlt": m("Topographic map of the park area (placeholder)", "樂園一帶地形圖（預留）"),
  "home.loc.mapCaption": m("Map placeholder", "地圖預留位置"),

  // Social
  "home.so.eyebrow": m("Community", "社群"),
  "home.so.title": m("Follow the ride", "追蹤騎行點滴"),
  "home.so.tile": m("Social post placeholder {i}", "社交帖文預留位置 {i}"),
  "home.so.cta": m("Follow on Instagram", "在 Instagram 追蹤我們"),
  "home.so.note": m("Placeholder tiles. Connect the real feed later.", "預留位置，日後連結真實動態。"),

  // Membership
  "home.mem.eyebrow": m("Membership", "會員"),
  "home.mem.title": m("Ride more, for less", "多騎多著數"),
  "home.mem.body": m("Membership options for regular riders and families. Ask us to find the right fit.", "為常客及家庭而設的會員方案，歡迎查詢最適合你的選擇。"),
  "home.mem.cta": m("Ask about membership", "查詢會員"),
  "home.mem.per.monthly": m("per month", "每月"),
  "home.mem.per.annual": m("per year", "每年"),
  "home.mem.per.family": m("per year", "每年"),

  // Final CTA
  "home.cta.title": m("Ready to ride?", "準備好出發了嗎？"),
  "home.cta.body": m("Pick a date, bring your crew, and we will take care of the rest.", "揀好日子，約齊同伴，其餘交給我們。"),
  "home.cta.offerTitle": m("First-visit offer", "首次到訪優惠"),
  "home.cta.offerBody": m("New riders can use code FIRSTRIDE at checkout.", "新車手可於結帳時使用優惠碼 FIRSTRIDE。"),
  "home.cta.referral": m("Referred by a friend? Their referral code can be applied at checkout.", "由朋友推薦？可於結帳時輸入其推薦碼。"),
} satisfies Record<string, LocalizedText>;
