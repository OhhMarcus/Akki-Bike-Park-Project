import type { GroupEnquiry, LocalizedText } from "@/types";

const L = (en: string, zh: string): LocalizedText => ({ en, zh });

export type SegmentKey = GroupEnquiry["segment"];
export type AddOnKey = GroupEnquiry["addOns"][number];

export type Segment = {
  key: SegmentKey;
  anchor: string;
  icon: "GraduationCap" | "Users" | "Briefcase" | "PartyPopper" | "Bike" | "Megaphone";
  /** experience whose DEMO price is used for the indicative range */
  priceExp: "school" | "private" | "corporate";
  /** instant demo booking target, if any */
  bookExp?: "school" | "private" | "corporate";
  blurb: LocalizedText;
  benefits: LocalizedText[];
  itinerary: { step: "arrival" | "briefing" | "activity" | "wrapup"; text: LocalizedText }[];
};

export const segments: Segment[] = [
  {
    key: "school", anchor: "schools", icon: "GraduationCap", priceExp: "school", bookExp: "school",
    blurb: L("Outdoor sessions that get a class moving and building confidence.", "讓全班動起來、建立自信的戶外活動。"),
    benefits: [L("Outdoor activity beyond the classroom", "走出課室的戶外活動"), L("Beginner-friendly, helmets required for all", "新手友善，全員佩戴頭盔"), L("Clear supervision and safety briefing", "清晰的看管及安全簡介")],
    itinerary: [
      { step: "arrival", text: L("Check-in and helmet fitting.", "報到及調校頭盔。") },
      { step: "briefing", text: L("Safety and park rules for the class.", "向全班講解安全及場地規則。") },
      { step: "activity", text: L("Guided riding in small groups.", "分小組帶領騎行。") },
      { step: "wrapup", text: L("Regroup and headcount.", "集合及點名。") },
    ],
  },
  {
    key: "youth", anchor: "youth", icon: "Users", priceExp: "school", bookExp: "private",
    blurb: L("Programmes for clubs, scouts and youth groups.", "適合會社、童軍及青少年團體的活動。"),
    benefits: [L("Builds skill, resilience and teamwork", "培養技術、毅力及團隊精神"), L("Levels grouped so everyone progresses", "按程度分組，人人進步"), L("Flexible for regular or one-off visits", "可作恆常或單次活動")],
    itinerary: [
      { step: "arrival", text: L("Arrival, gear check and sign-in.", "抵達、檢查裝備及登記。") },
      { step: "briefing", text: L("Goals for the session and safety rules.", "說明活動目標及安全規則。") },
      { step: "activity", text: L("Skills stations and guided riding.", "技術練習站及帶領騎行。") },
      { step: "wrapup", text: L("Group reflection and next steps.", "小組分享及後續安排。") },
    ],
  },
  {
    key: "corporate", anchor: "corporate", icon: "Briefcase", priceExp: "corporate", bookExp: "corporate",
    blurb: L("Team-building that swaps the meeting room for the trail.", "以山徑代替會議室的團隊建立。"),
    benefits: [L("Shared challenge that brings teams together", "共同挑戰凝聚團隊"), L("Mixed abilities catered for", "照顧不同能力的同事"), L("Add coaching, catering or photography", "可加配教練、餐飲或攝影")],
    itinerary: [
      { step: "arrival", text: L("Welcome and equipment fitting.", "迎接及配備裝備。") },
      { step: "briefing", text: L("Session goals and safety briefing.", "活動目標及安全簡介。") },
      { step: "activity", text: L("Team challenges and guided rides.", "團隊挑戰及帶領騎行。") },
      { step: "wrapup", text: L("Debrief and group photo option.", "總結及可選團體相片。") },
    ],
  },
  {
    key: "birthday", anchor: "birthday", icon: "PartyPopper", priceExp: "private", bookExp: "private",
    blurb: L("A birthday spent riding with friends.", "與朋友一起騎行的生日。"),
    benefits: [L("Active celebration that riders remember", "令人難忘的運動慶祝"), L("Guided so guests of all levels join in", "有人帶領，各程度賓客均可參與"), L("Add photography or catering", "可加配攝影或餐飲")],
    itinerary: [
      { step: "arrival", text: L("Guests arrive and get fitted.", "賓客抵達並配備裝備。") },
      { step: "briefing", text: L("Quick safety briefing.", "簡短安全簡介。") },
      { step: "activity", text: L("Guided ride and games on bikes.", "帶領騎行及單車遊戲。") },
      { step: "wrapup", text: L("Refreshments and group photo.", "茶點及大合照。") },
    ],
  },
  {
    key: "private", anchor: "private", icon: "Bike", priceExp: "private", bookExp: "private",
    blurb: L("Reserve the park for friends, family or your riding crew.", "為朋友、家人或車隊預留場地。"),
    benefits: [L("A session set around your group", "按團體需要安排時段"), L("Guided or free riding, your choice", "帶領或自由騎行，任君選擇"), L("Simple booking and clear pricing", "預約簡單、價格清晰")],
    itinerary: [
      { step: "arrival", text: L("Arrival and check-in.", "抵達及報到。") },
      { step: "briefing", text: L("Park rules and safety briefing.", "場地規則及安全簡介。") },
      { step: "activity", text: L("Riding, guided or self-paced.", "帶領或自由騎行。") },
      { step: "wrapup", text: L("Wrap-up and feedback.", "總結及意見。") },
    ],
  },
  {
    key: "brand", anchor: "brands", icon: "Megaphone", priceExp: "corporate",
    blurb: L("A trail setting for launches, demos and content shoots.", "適合發佈會、產品示範及拍攝的山徑場地。"),
    benefits: [L("Real riding environment for your product", "為產品提供真實騎行環境"), L("Demo rides for guests and media", "為賓客及傳媒安排試騎"), L("Coordinated with park operations", "與場地營運協調")],
    itinerary: [
      { step: "arrival", text: L("Team and guest arrival, set-up.", "團隊及賓客抵達、佈置。") },
      { step: "briefing", text: L("Run-through and safety briefing.", "流程講解及安全簡介。") },
      { step: "activity", text: L("Demonstration rides and content capture.", "示範騎行及內容拍攝。") },
      { step: "wrapup", text: L("Pack-down and follow-up.", "撤場及跟進。") },
    ],
  },
];

export const segmentMsgKey = (k: SegmentKey) => `groups.seg.${k}` as const;

export const addOnKeys: AddOnKey[] = ["coaching", "rental", "catering", "photography"];

/** Resolve ?segment= / #hash values (segment key or anchor id) to a segment key. */
export function resolveSegment(v: string | null | undefined): SegmentKey | null {
  if (!v) return null;
  const s = v.replace(/^#/, "");
  return segments.find((x) => x.key === s || x.anchor === s)?.key ?? null;
}
