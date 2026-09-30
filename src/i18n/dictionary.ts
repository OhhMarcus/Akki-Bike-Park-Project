import { commonMessages } from "./messages/common";
import { homeMessages } from "./messages/home";
import { parkMessages } from "./messages/park";
import { bookingMessages } from "./messages/booking";
import { eventsMessages } from "./messages/events";
import { coachingMessages } from "./messages/coaching";
import { groupsMessages } from "./messages/groups";
import { visitMessages } from "./messages/visit";
import { contactMessages } from "./messages/contact";
import { adminMessages } from "./messages/admin";
import { proposalMessages } from "./messages/proposal";
import { legalMessages } from "./messages/legal";

/**
 * Central translation dictionary. Every UI string lives in src/i18n/messages/*.ts
 * as `"key": { en: "...", zh: "..." }` so both languages sit side by side.
 * Traditional Chinese (zh) is the default language of the site.
 */
export const dictionary = {
  ...commonMessages,
  ...homeMessages,
  ...parkMessages,
  ...bookingMessages,
  ...eventsMessages,
  ...coachingMessages,
  ...groupsMessages,
  ...visitMessages,
  ...contactMessages,
  ...adminMessages,
  ...proposalMessages,
  ...legalMessages,
};

export type MessageKey = keyof typeof dictionary;
