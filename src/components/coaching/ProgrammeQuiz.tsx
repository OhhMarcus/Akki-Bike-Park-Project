"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { useHydrated, useProgrammes } from "@/lib/store";
import { daysFromToday } from "@/lib/dates";
import { Button, buttonVariants } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/common/DifficultyBadge";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { cn } from "@/lib/utils";
import { recommend, type Answers, type Recommendation } from "./recommend";

type Step = { id: keyof Answers; options: { value: string; label: MessageKey }[] };

const steps: Step[] = [
  {
    id: "age",
    options: [
      { value: "child", label: "coaching.quiz.age.child" },
      { value: "pre", label: "coaching.quiz.age.pre" },
      { value: "teen", label: "coaching.quiz.age.teen" },
      { value: "adult", label: "coaching.quiz.age.adult" },
    ],
  },
  {
    id: "level",
    options: [
      { value: "new", label: "coaching.quiz.level.new" },
      { value: "regular", label: "coaching.quiz.level.regular" },
      { value: "expert", label: "coaching.quiz.level.expert" },
    ],
  },
  {
    id: "goal",
    options: [
      { value: "basics", label: "coaching.quiz.goal.basics" },
      { value: "flow", label: "coaching.quiz.goal.flow" },
      { value: "control", label: "coaching.quiz.goal.control" },
      { value: "jumps", label: "coaching.quiz.goal.jumps" },
      { value: "race", label: "coaching.quiz.goal.race" },
    ],
  },
  {
    id: "format",
    options: [
      { value: "group", label: "coaching.quiz.format.group" },
      { value: "solo", label: "coaching.quiz.format.solo" },
    ],
  },
];

const questionKey: Record<keyof Answers, MessageKey> = {
  age: "coaching.quiz.q.age",
  level: "coaching.quiz.q.level",
  goal: "coaching.quiz.q.goal",
  format: "coaching.quiz.q.format",
};

function isComplete(a: Partial<Record<keyof Answers, string>>): a is Answers {
  return steps.every((s) => Boolean(a[s.id]));
}

export function ProgrammeQuiz() {
  const { t, l } = useI18n();
  const [programmes] = useProgrammes();
  const hydrated = useHydrated();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<keyof Answers, string>>>({});
  const [done, setDone] = useState(false);
  const legendRef = useRef<HTMLLegendElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const results: Recommendation[] = useMemo(() => (done && isComplete(answers) ? recommend(programmes, answers) : []), [done, answers, programmes]);

  useEffect(() => {
    if (!moved.current) return;
    if (done) resultRef.current?.focus();
    else legendRef.current?.focus();
  }, [index, done]);

  const step = steps[index];
  const current = answers[step.id];
  const isLast = index === steps.length - 1;
  const under18 = answers.age === "child" || answers.age === "pre" || answers.age === "teen";
  const bookHref = (r: Recommendation) => `/booking?exp=${r.programme.experienceId}${hydrated ? `&date=${daysFromToday(r.programme.nextSessionOffsetDays)}` : ""}`;

  const retake = () => {
    moved.current = true;
    setAnswers({});
    setIndex(0);
    setDone(false);
  };

  return (
    <div className="surface p-5 md:p-8">
      {!done ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!current) return;
            moved.current = true;
            if (isLast) setDone(true);
            else setIndex(index + 1);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-silver-dim" aria-live="polite">
              {t("coaching.quiz.progress", { n: index + 1, total: steps.length })}
            </p>
            <div aria-hidden className="h-1 w-full overflow-hidden rounded bg-graphite-700">
              <div className="h-full bg-bone transition-[width] duration-300" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          <fieldset key={step.id} className="min-w-0 space-y-3 border-0 p-0">
            <legend ref={legendRef} tabIndex={-1} className="mb-3 font-display text-2xl font-bold uppercase outline-none md:text-3xl">
              {t(questionKey[step.id])}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {step.options.map((o) => (
                <label
                  key={o.value}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-silver",
                    current === o.value ? "border-bone bg-graphite-800" : "border-graphite-600 hover:bg-graphite-800",
                  )}
                >
                  <input
                    type="radio"
                    name={`quiz-${step.id}`}
                    value={o.value}
                    checked={current === o.value}
                    onChange={() => setAnswers((a) => ({ ...a, [step.id]: o.value }))}
                    className="h-4 w-4 shrink-0 accent-[#e8e6e1]"
                  />
                  {t(o.label)}
                </label>
              ))}
            </div>
            {step.id === "age" && <p className="text-xs text-silver-dim">{t("coaching.quiz.guardian")}</p>}
          </fieldset>
          <div className="flex gap-2">
            {index > 0 && (
              <Button
                variant="secondary"
                onClick={() => {
                  moved.current = true;
                  setIndex(index - 1);
                }}
              >
                {t("coaching.quiz.back")}
              </Button>
            )}
            <Button type="submit" disabled={!current} className="flex-1 sm:flex-none">
              {isLast ? t("coaching.quiz.finish") : t("coaching.quiz.next")}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6" aria-live="polite">
          {results.length === 0 ? (
            <div className="space-y-4">
              <h3 ref={resultRef} tabIndex={-1} className="font-display text-2xl font-bold uppercase outline-none">
                {t("coaching.quiz.resultTitle")}
              </h3>
              <p className="text-silver">{t("coaching.quiz.none")}</p>
              <div className="flex flex-wrap gap-2">
                <WhatsAppButton text={t("coaching.quiz.waHello")} />
                <Button variant="ghost" onClick={retake}>
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  {t("coaching.quiz.retake")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="eyebrow">{t("coaching.quiz.resultTitle")}</p>
                <h3 ref={resultRef} tabIndex={-1} className="font-display text-3xl font-bold uppercase outline-none md:text-4xl">
                  {l(results[0].programme.name)}
                </h3>
                <DifficultyBadge level={results[0].programme.level} />
                <p className="text-sm text-silver">{l(results[0].programme.summary)}</p>
                <p className="text-sm">
                  <span className="font-semibold">{t("coaching.quiz.why")}: </span>
                  <span className="text-silver">{Array.from(new Set(results[0].reasons)).map((k) => t(k)).join(l({ en: "; ", zh: "；" }))}</span>
                </p>
                {under18 && <p className="rounded-md border border-signal/40 bg-signal/5 p-3 text-sm text-silver">{t("coaching.quiz.guardian")}</p>}
                <div className="flex flex-wrap gap-2">
                  <Link href={bookHref(results[0])} className={buttonVariants()}>
                    {t("coaching.card.book")}
                  </Link>
                  <Link href={`#programme-${results[0].programme.id}`} className={buttonVariants({ variant: "secondary" })}>
                    {t("coaching.quiz.viewProgramme")}
                  </Link>
                  <Button variant="ghost" onClick={retake}>
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    {t("coaching.quiz.retake")}
                  </Button>
                </div>
              </div>
              {results.length > 1 && (
                <div className="border-t border-graphite-700 pt-5">
                  <p className="mb-3 text-xs uppercase tracking-wider text-silver-dim">{t("coaching.quiz.alsoConsider")}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {results.slice(1, 3).map((r) => (
                      <li key={r.programme.id}>
                        <Link href={`#programme-${r.programme.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-graphite-600 px-4 py-2 text-sm hover:bg-graphite-800">
                          {l(r.programme.name)}
                          <DifficultyBadge level={r.programme.level} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

