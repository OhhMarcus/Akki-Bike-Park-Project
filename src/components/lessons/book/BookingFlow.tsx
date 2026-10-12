"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { lessons } from "@/content/catalogue";
import type { MessageKey } from "@/i18n/dictionary";
import { useI18n } from "@/i18n/provider";
import { useAvailability, useNowHK, useRiders, useSavedRider } from "@/lib/hooks";
import { createBooking, findRiderByPhone, quote, usablePack, type BookingResult } from "@/lib/services";
import { bikeSizeForHeight } from "@/lib/sizing";
import { addDays } from "@/lib/time";
import { hasErrors, validate } from "@/lib/validation";
import type { Booking, ISODate, LessonId, PackHolding } from "@/types";
import { WaiverBlock, waiverErrors } from "@/components/booking/Waiver";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookingSummary, type SummaryProps } from "./BookingSummary";
import { FlowStepper } from "./FlowStepper";
import { StepClassDate } from "./StepClassDate";
import { StepDone } from "./StepDone";
import { StepPay } from "./StepPay";
import { StepRider, type RiderErrors } from "./StepRider";
import { StepTime } from "./StepTime";
import { InlineAlert, StepHeading, stepTitleId } from "./bits";
import {
  AGE_RANGE, BOOKING_WINDOW_DAYS, STEP, anotherDraft, draftRentals, initialDraft, isBookable, isBookableDay, localPhone, type Draft,
} from "./draft";

/** Each step gets its own browser history entry, so the phone's Back gesture steps back instead of leaving. */
const HISTORY_KEY = "akkiLessonStep";
/** "Booked in N seconds" only when it was actually quick. */
const SHOW_SECONDS_UNDER = 180;

type Done = { booking: Booking; pack?: PackHolding; seconds?: number };

/** Reads ?lesson=, &pack=1 and &date= (needs a Suspense boundary for useSearchParams). */
export function LessonBookingFlow() {
  const params = useSearchParams();
  const lessonId: LessonId = params.get("lesson") === "advanced" ? "advanced" : "foundation";
  const buyPack = params.get("pack") === "1";
  const rawDate = params.get("date") ?? "";
  // a real calendar date only (2026-02-30 or 2026-13-45 are ignored)
  const ms = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? Date.parse(`${rawDate}T00:00:00Z`) : NaN;
  const date = !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 10) === rawDate ? rawDate : null;
  return <Flow key={`${lessonId}:${buyPack}:${date}`} initialLesson={lessonId} initialPack={buyPack} initialDate={date} />;
}

function Flow({ initialLesson, initialPack, initialDate }: { initialLesson: LessonId; initialPack: boolean; initialDate: ISODate | null }) {
  const { t, l, fmt } = useI18n();
  const now = useNowHK();
  const avail = useAvailability(now);
  const [riders] = useRiders();
  const [savedRider, setSavedRider] = useSavedRider();

  const [draft, setDraft] = useState<Draft>(() => initialDraft(initialLesson, initialPack, initialDate));
  const [step, setStep] = useState<number>(STEP.class);
  /** steps stay mounted once visited (hidden when inactive) so nothing typed or signed is lost */
  const [visited, setVisited] = useState<number>(STEP.class);
  /** steps where Continue was pressed: their errors are now shown */
  const [tried, setTried] = useState<number[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [riderNotice, setRiderNotice] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const startedAt = useRef(0);

  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);
  const lesson = lessons[draft.lessonId];
  const today = now?.date ?? null;
  const lastDay = today ? addDays(today, BOOKING_WINDOW_DAYS - 1) : null;

  /* ---------- dates & sessions (live: other tabs, admin and new bookings update these) ---------- */
  const dayState = useCallback((d: ISODate) => avail.dayLessons(d, draft.lessonId), [avail, draft.lessonId]);
  const dateOpen = useCallback(
    (d: ISODate, id: LessonId) => !!today && !!lastDay && d >= today && d <= lastDay && isBookableDay(avail.dayLessons(d, id)),
    [avail, today, lastDay],
  );
  const firstOpen = useCallback(
    (id: LessonId) => {
      if (!today) return null;
      for (let i = 0; i < BOOKING_WINDOW_DAYS; i++) {
        const d = addDays(today, i);
        if (dateOpen(d, id)) return d;
      }
      return null;
    },
    [today, dateOpen],
  );
  const sessions = useMemo(() => (draft.date ? avail.sessions(draft.date, draft.lessonId) : []), [avail, draft.date, draft.lessonId]);
  const session = sessions.find((s) => s.id === draft.sessionId);
  const openSessions = sessions.filter(isBookable);
  const noOpenDates = !!today && firstOpen(draft.lessonId) === null;

  /* ---------- rider, gear, pack, price ---------- */
  const suggested = validate.height(draft.height) ? null : bikeSizeForHeight(Number(draft.height));
  const bikeSize = draft.bikeSize ?? suggested;
  const rentals = draftRentals(draft, bikeSize);
  // `riders` is a dependency so pack balances refresh when the rider store changes (other tab, admin).
  const pack = useMemo(() => usablePack(findRiderByPhone(draft.phone), draft.lessonId), [riders, draft.phone, draft.lessonId]);
  const usePack = !draft.buyPack && draft.usePack && !!pack;
  const q = quote({ kind: "lesson", riders: 1, rentals, lessonId: draft.lessonId, usePack, buyPack: draft.buyPack });
  const ageValid = !validate.age(draft.age, AGE_RANGE.min, AGE_RANGE.max);
  const minor = ageValid && Number(draft.age) < 18;

  /* ---------- validation ---------- */
  const msg = (k: MessageKey | undefined) => (k ? t(k) : undefined);
  const classError = draft.date && dateOpen(draft.date, draft.lessonId) ? undefined : t("val.pickDate");
  const timeError = session && isBookable(session) ? undefined : t("val.pickTime");
  const riderErrors: RiderErrors = {
    name: msg(validate.name(draft.name)),
    phone: msg(validate.phone(draft.phone)),
    age: !ageValid ? t("val.age", AGE_RANGE) : Number(draft.age) < lesson.minAge ? t("val.minAge", { n: lesson.minAge }) : undefined,
    height: msg(validate.height(draft.height)),
    experience: draft.experience ? undefined : t("lessons.rider.pickOne"),
  };
  const w = waiverErrors(draft.waiver, minor);
  const waiverMsgs = { agreed: msg(w.agreed), guardian: msg(w.guardian), signature: msg(w.signature) };
  const valid = [!classError, !timeError, !hasErrors(riderErrors), !hasErrors(waiverMsgs)];
  const firstInvalid = valid.indexOf(false);
  // the Time step can always show a chosen day, even one that has just filled up (Continue still needs an open day)
  const reachable = firstInvalid === -1 ? STEP.pay : firstInvalid === STEP.class && draft.date ? STEP.time : firstInvalid;
  const shown = (s: number) => tried.includes(s);

  /* ---------- once the HK clock is known: check ?date= or pick the first open day ---------- */
  const dateChecked = useRef(false);
  useEffect(() => {
    if (!today || dateChecked.current) return;
    dateChecked.current = true;
    startedAt.current = Date.now();
    setDraft((d) => (d.date && dateOpen(d.date, d.lessonId) ? d : { ...d, date: firstOpen(d.lessonId), sessionId: null }));
  }, [today, dateOpen, firstOpen]);

  /* ---------- prefill name + number saved on this device ---------- */
  const prefillChecked = useRef(false);
  useEffect(() => {
    if (prefillChecked.current || !savedRider) return;
    prefillChecked.current = true;
    if (draft.name || draft.phone) return;
    setDraft((d) => ({ ...d, name: savedRider.name, phone: localPhone(savedRider.phone) }));
    setPrefilled(true);
  }, [savedRider, draft.name, draft.phone]);

  /* ---------- navigation, mirrored in browser history ---------- */
  const stepRef = useRef(step);
  const reachableRef = useRef(reachable);
  const doneRef = useRef(false);
  const pendingDone = useRef(false);
  useEffect(() => {
    stepRef.current = step;
    reachableRef.current = reachable;
    doneRef.current = done !== null;
  });

  useEffect(() => {
    const h = window.history;
    h.replaceState({ [HISTORY_KEY]: STEP.class }, "");
    const restoration = h.scrollRestoration;
    h.scrollRestoration = "manual";
    const onPop = (e: PopStateEvent) => {
      if (pendingDone.current) {
        // landed back on the flow's first entry after booking: it now stands for "Done"
        pendingDone.current = false;
        h.replaceState({ [HISTORY_KEY]: STEP.done }, "");
        return;
      }
      if (doneRef.current) return;
      const raw = (e.state as Record<string, unknown> | null)?.[HISTORY_KEY];
      const want = typeof raw === "number" ? raw : STEP.class;
      const next = Math.min(want, reachableRef.current);
      if (next !== want) h.replaceState({ [HISTORY_KEY]: next }, "");
      stepRef.current = next;
      setStep(next);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      h.scrollRestoration = restoration;
    };
  }, []);

  const navigate = useCallback((target: number) => {
    const cur = stepRef.current;
    if (target === cur) return;
    if (target < cur) {
      window.history.go(target - cur); // popstate sets the step
      return;
    }
    for (let s = cur + 1; s <= target; s++) window.history.pushState({ [HISTORY_KEY]: s }, "");
    stepRef.current = target;
    setVisited((v) => Math.max(v, target));
    setStep(target);
  }, []);

  /* scroll back up to the flow and move focus to the new step's title */
  const flowRef = useRef<HTMLDivElement>(null);
  const lastStep = useRef(step);
  useEffect(() => {
    if (lastStep.current === step) return;
    lastStep.current = step;
    const el = flowRef.current;
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      if (window.scrollY > y) window.scrollTo({ top: Math.max(0, y) });
    }
    document.getElementById(stepTitleId(step))?.focus({ preventScroll: true });
  }, [step]);

  /* ---------- actions ---------- */
  const markTried = (s: number) => setTried((p) => (p.includes(s) ? p : [...p, s]));

  const focusFirstInvalid = (s: number) => {
    const targets: (string | false | undefined)[] =
      s === STEP.class ? ["#lesson-step-0 [data-date]:not([disabled])"]
      : s === STEP.time ? ['#lesson-step-1 input[name="session"]:not(:disabled)']
      : s === STEP.rider
        ? [
            riderErrors.name && "#rider-name",
            riderErrors.phone && "#rider-phone",
            riderErrors.age && "#rider-age",
            riderErrors.height && "#rider-height",
            riderErrors.experience && 'input[name="rider-exp"]',
          ]
        : [waiverMsgs.agreed && "#waiver-agree", waiverMsgs.guardian && "#waiver-guardian", waiverMsgs.signature && "#signature"];
    requestAnimationFrame(() => {
      const el = targets.filter((x): x is string => !!x).map((sel) => document.querySelector<HTMLElement>(sel)).find(Boolean);
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: "center" });
    });
  };

  const next = () => {
    markTried(step);
    if (!valid[step]) {
      focusFirstInvalid(step);
      return;
    }
    if (step === STEP.class && !session && openSessions.length === 1) patch({ sessionId: openSessions[0].id });
    if (step === STEP.rider) setRiderNotice(null);
    navigate(step + 1);
  };
  const back = () => navigate(Math.max(STEP.class, step - 1));

  const changeLesson = (id: LessonId) => {
    setNotice(null);
    setDraft((d) => (d.lessonId === id ? d : { ...d, lessonId: id, sessionId: null, date: d.date && dateOpen(d.date, id) ? d.date : firstOpen(id) }));
  };
  const changeDate = (d: ISODate) => {
    if (d === draft.date) return;
    setNotice(null);
    patch({ date: d, sessionId: null });
  };
  const changeSession = (id: string) => {
    setNotice(null);
    patch({ sessionId: id });
  };

  /** The engine said no (session filled up, closed, started…): back to Time with the reason. */
  const bounce = (message: string) => {
    setNotice(message);
    setTried((p) => p.filter((s) => s !== STEP.time)); // the alert says it all; no extra "Pick a time"
    patch({ sessionId: null });
    navigate(STEP.time);
  };

  const pay = () => {
    if (stepRef.current !== STEP.pay) return; // left the step while "processing"
    setPayError(null);
    if (!session) {
      bounce(t("err.not_found"));
      return;
    }
    let res: BookingResult;
    try {
      res = createBooking({
        targetId: session.id,
        riders: 1,
        rentals,
        name: draft.name.trim(),
        phone: draft.phone,
        source: "website",
        payment: "paid",
        usePack,
        buyPack: draft.buyPack,
        rider: { age: Number(draft.age), heightCm: Number(draft.height), experience: draft.experience ?? undefined },
        waiverSigned: true,
      });
    } catch {
      setPayError(t("err.generic"));
      return;
    }
    if (!res.ok) {
      if (res.error === "no_pack") {
        patch({ usePack: false });
        setPayError(t("err.no_pack"));
      } else if (res.error === "invalid_phone" || res.error === "invalid") {
        setRiderNotice(t(`err.${res.error}`));
        markTried(STEP.rider);
        navigate(STEP.rider);
      } else {
        bounce(t(`err.${res.error}`, { n: res.remaining ?? 0 }));
      }
      return;
    }
    const booking = res.booking;
    setSavedRider({ name: booking.riderName, phone: booking.phone });
    const holder = findRiderByPhone(booking.phone);
    const packAfter = usePack
      ? holder?.packs.find((p) => p.id === pack?.id)
      : draft.buyPack
        ? holder?.packs.find((p) => p.lessonId === draft.lessonId)
        : undefined;
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    setDone({ booking, pack: packAfter, seconds: seconds > 0 && seconds < SHOW_SECONDS_UNDER ? seconds : undefined });
    // fold the flow's history entries into one "Done" entry so Back leaves the page
    const depth = stepRef.current;
    if (depth > 0) {
      pendingDone.current = true;
      window.history.go(-depth);
    } else {
      window.history.replaceState({ [HISTORY_KEY]: STEP.done }, "");
    }
    stepRef.current = STEP.done;
    setStep(STEP.done);
  };

  const another = () => {
    setDraft((d) => {
      const n = anotherDraft(d);
      return n.date && dateOpen(n.date, n.lessonId) ? n : { ...n, date: firstOpen(n.lessonId) };
    });
    setDone(null);
    setTried([]);
    setNotice(null);
    setRiderNotice(null);
    setPayError(null);
    setPrefilled(false);
    setVisited(STEP.class);
    window.history.replaceState({ [HISTORY_KEY]: STEP.class }, "");
    stepRef.current = STEP.class;
    setStep(STEP.class);
    startedAt.current = Date.now();
  };

  /* ---------- render ---------- */
  const summary: SummaryProps = { lessonId: draft.lessonId, buyPack: draft.buyPack, date: draft.date, session, riderName: draft.name, rentals };
  const inFlow = step < STEP.done;
  const total = (
    <span className="min-w-0">
      <span className="block truncate text-[11px] font-semibold uppercase tracking-wide text-muted">
        {t("label.total")}
        {draft.date && today ? ` · ${fmt.dateWeekday(draft.date)}` : null}
      </span>
      <span className="h-display block text-2xl tabular">{fmt.money(q.total)}</span>
    </span>
  );

  const panel = (i: number, title: string, body: React.ReactNode, lead?: string) =>
    i <= visited && (
      <section key={i} id={`lesson-step-${i}`} hidden={step !== i} aria-labelledby={stepTitleId(i)}>
        <StepHeading step={i} title={title} lead={lead} />
        {body}
      </section>
    );

  return (
    <div ref={flowRef} className="container pb-10 pt-6 sm:pt-8">
      <FlowStepper current={step} reachable={reachable} done={done !== null} onSelect={navigate} />

      <div className={cn("mt-8 grid gap-10", inFlow && "lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-14")}>
        <div className="min-w-0">
          {notice && step <= STEP.time && (
            <InlineAlert className="mb-7" title={t("lessons.pay.errorTitle")}>
              {notice}
            </InlineAlert>
          )}

          {panel(
            STEP.class,
            t("lessons.h.class"),
            <StepClassDate
              lessonId={draft.lessonId}
              buyPack={draft.buyPack}
              date={draft.date}
              min={today}
              max={lastDay}
              dayState={dayState}
              openCount={openSessions.length}
              noOpenDates={noOpenDates}
              error={shown(STEP.class) ? classError : undefined}
              onLesson={changeLesson}
              onBuyPack={(buyPack) => patch({ buyPack })}
              onDate={changeDate}
            />,
          )}

          {panel(
            STEP.time,
            t("lessons.h.time"),
            <StepTime
              date={draft.date}
              sessions={sessions}
              value={draft.sessionId}
              now={now}
              error={shown(STEP.time) ? timeError : undefined}
              onChange={changeSession}
              onChangeDate={() => navigate(STEP.class)}
            />,
          )}

          {panel(
            STEP.rider,
            t("lessons.h.rider"),
            <StepRider
              draft={draft}
              patch={patch}
              errors={shown(STEP.rider) ? riderErrors : {}}
              suggested={suggested}
              bikeSize={bikeSize}
              pack={draft.buyPack ? undefined : pack}
              minor={minor}
              prefilled={prefilled}
              notice={riderNotice}
              onSwitchFoundation={() => {
                changeLesson("foundation");
                navigate(STEP.class);
              }}
            />,
          )}

          {panel(
            STEP.waiver,
            t("lessons.h.waiver"),
            <div className="max-w-2xl space-y-5">
              {minor && (
                <p className="flex items-start gap-3 rounded-lg border border-line bg-card px-4 py-3 text-sm text-fg/90">
                  <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  {t("lessons.waiver.minor", { name: draft.name.trim() })}
                </p>
              )}
              <WaiverBlock value={draft.waiver} onChange={(waiver) => patch({ waiver })} minor={minor} errors={shown(STEP.waiver) ? waiverMsgs : undefined} />
            </div>,
            t("lessons.waiver.lead"),
          )}

          {panel(
            STEP.pay,
            t("lessons.h.pay"),
            <StepPay
              details={summary}
              quote={q}
              error={payError}
              seed={draft.sessionId ?? "akki"}
              onPay={pay}
              onEditClass={() => navigate(STEP.class)}
              onEditRider={() => navigate(STEP.rider)}
            />,
          )}

          {done && step === STEP.done && (
            <section aria-labelledby={stepTitleId(STEP.done)}>
              <StepHeading step={STEP.done} title={t("lessons.h.done")} srOnly />
              <StepDone booking={done.booking} title={l(lesson.name)} seconds={done.seconds} pack={done.pack} onAnother={another} />
            </section>
          )}

          {inFlow && (
            <div className="mt-10 hidden items-center justify-between gap-4 border-t border-line pt-6 md:flex">
              {step > STEP.class ? (
                <Button variant="secondary" size="lg" onClick={back}>
                  <ArrowLeft aria-hidden className="h-5 w-5" />
                  {t("btn.back")}
                </Button>
              ) : (
                <span />
              )}
              {step < STEP.pay && (
                <div className="flex items-center gap-6">
                  <span className="text-right lg:hidden">{total}</span>
                  <Button size="lg" onClick={next}>
                    {t("btn.continue")}
                    <ArrowRight aria-hidden className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {inFlow && (
          <aside aria-label={t("lessons.sum.title")} className="hidden lg:block">
            <BookingSummary {...summary} quote={q} />
          </aside>
        )}
      </div>

      {inFlow && (
        <div
          className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-4 pt-3 backdrop-blur md:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center gap-3">
            {step > STEP.class && (
              <Button variant="secondary" size="lg" className="w-12 shrink-0 px-0" onClick={back} aria-label={t("btn.back")}>
                <ArrowLeft aria-hidden className="h-5 w-5" />
              </Button>
            )}
            <div className="min-w-0 flex-1">{total}</div>
            {step < STEP.pay && (
              <Button size="lg" className="shrink-0" onClick={next}>
                {t("btn.continue")}
                <ArrowRight aria-hidden className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
