import { commonMessages } from "./messages/common";
import { bookMessages } from "./messages/book";
import { adminMessages } from "./messages/admin";
import { homeMessages } from "./messages/home";
import { lessonsMessages } from "./messages/lessons";
import { pumpMessages } from "./messages/pump";
import { eventsMessages } from "./messages/events";
import { clubMessages } from "./messages/club";
import { visitMessages } from "./messages/visit";
import { adminOpsMessages } from "./messages/adminOps";
import { adminPlanMessages } from "./messages/adminPlan";
import { adminInsightsMessages } from "./messages/adminInsights";

/**
 * Every visible string, in English and Traditional Chinese (Hong Kong),
 * including month/weekday names and date/time formats.
 * Files live in src/i18n/messages/*.ts as `"key": m("English", "中文")`.
 */
export const dictionary = {
  ...commonMessages,
  ...bookMessages,
  ...adminMessages,
  ...homeMessages,
  ...lessonsMessages,
  ...pumpMessages,
  ...eventsMessages,
  ...clubMessages,
  ...visitMessages,
  ...adminOpsMessages,
  ...adminPlanMessages,
  ...adminInsightsMessages,
};

export type MessageKey = keyof typeof dictionary;
export type PluralKey = { [K in MessageKey]: K extends `${infer B}.other` ? B : never }[MessageKey];
