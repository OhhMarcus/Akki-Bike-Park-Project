"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useProgrammes, useStored } from "@/lib/store";
import { hkToday } from "@/lib/dates";
import { sanitizeText } from "@/lib/sanitize";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { DemoTag } from "@/components/common/DemoTag";
import { EmptyState } from "@/components/common/States";
import type { CoachingProgramme } from "@/types";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { ProgrammeForm } from "./ProgrammeForm";
import { isIsoDate, toInt } from "./helpers";

export type CoachingSession = { id: string; programmeId: string; date: string; instructor: string; capacity: number };
const NO_SESSIONS: CoachingSession[] = [];

export function CoachingAdmin() {
  const { t, l, date, money } = useI18n();
  const toast = useToast();
  const [programmes, setProgrammes] = useProgrammes();
  const [sessions, setSessions] = useStored<CoachingSession[]>("coachingSessions", NO_SESSIONS);
  const [editing, setEditing] = useState<CoachingProgramme | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CoachingSession | null>(null);

  const [sProgramme, setSProgramme] = useState("");
  const [sDate, setSDate] = useState("");
  const [sInstructor, setSInstructor] = useState("");
  const [sCapacity, setSCapacity] = useState("6");
  const [sErrors, setSErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setSProgramme(programmes[0]?.id ?? "");
    setSDate("");
    setSInstructor("");
    setSCapacity("6");
    setSErrors({});
    setCreating(true);
  };

  const createSession = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!programmes.some((p) => p.id === sProgramme)) err.programme = t("val.required");
    if (!isIsoDate(sDate)) err.date = t("admin.err.date");
    const cap = toInt(sCapacity);
    if (cap === null || cap < 1 || cap > 100) err.capacity = t("admin.err.number");
    setSErrors(err);
    if (Object.keys(err).length || cap === null) return;
    setSessions((prev) => [{ id: uid("cs"), programmeId: sProgramme, date: sDate, instructor: sanitizeText(sInstructor, 80), capacity: cap }, ...prev]);
    setCreating(false);
    toast(t("state.saved"), "success");
  };

  const nameOf = (id: string) => {
    const p = programmes.find((x) => x.id === id);
    return p ? l(p.name) : id;
  };

  const progColumns: Column<CoachingProgramme>[] = [
    { key: "name", header: t("admin.co.fName"), sortValue: (p) => l(p.name), cell: (p) => <span className="font-medium">{l(p.name)}</span> },
    { key: "level", header: t("label.level"), cell: (p) => t(`level.${p.level}`) },
    { key: "group", header: t("admin.co.fGroup"), cell: (p) => l(p.groupSize) },
    {
      key: "price",
      header: t("label.price"),
      sortValue: (p) => p.priceHKD ?? -1,
      cell: (p) => (
        <span className="whitespace-nowrap">
          {p.priceHKD === null ? t("label.tbc") : money(p.priceHKD)} <DemoTag />
        </span>
      ),
    },
    { key: "next", header: t("admin.co.fOffset"), sortValue: (p) => p.nextSessionOffsetDays, cell: (p) => t("admin.co.inDays", { n: p.nextSessionOffsetDays }) },
  ];

  const sessColumns: Column<CoachingSession>[] = [
    { key: "programme", header: t("admin.co.programme"), sortValue: (s) => nameOf(s.programmeId), cell: (s) => <span className="font-medium">{nameOf(s.programmeId)}</span> },
    { key: "date", header: t("label.date"), sortValue: (s) => s.date, cell: (s) => date(s.date) },
    { key: "instructor", header: t("admin.co.fInstructor"), cell: (s) => s.instructor || <span className="text-silver-dim">{t("admin.co.instructorTbc")}</span> },
    { key: "cap", header: t("admin.ev.fCapacity"), sortValue: (s) => s.capacity, cell: (s) => s.capacity, className: "tabular-nums" },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.co.title")} description={t("admin.co.sub")} />

      <section aria-labelledby="co-prog" className="space-y-3">
        <h2 id="co-prog" className="font-display text-2xl font-bold uppercase">{t("admin.co.programmes")}</h2>
        <AdminDataTable
          rows={programmes}
          columns={progColumns}
          rowKey={(p) => p.id}
          caption={t("admin.co.programmes")}
          searchText={(p) => `${p.name.en} ${p.name.zh}`}
          pageSize={6}
          empty={<EmptyState title={t("admin.co.emptyProgrammes")} />}
          actions={(p) => (
            <Button variant="ghost" size="icon" aria-label={`${t("btn.edit")}: ${l(p.name)}`} onClick={() => setEditing(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        />
      </section>

      <section aria-labelledby="co-sess" className="mt-10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="co-sess" className="font-display text-2xl font-bold uppercase">
              {t("admin.co.sessions")} <DemoTag label={t("demo.placeholder")} />
            </h2>
            <p className="text-sm text-silver">{t("admin.co.sessionsNote", { today: date(hkToday()) })}</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("admin.co.newSession")}
          </Button>
        </div>
        <AdminDataTable
          rows={sessions}
          columns={sessColumns}
          rowKey={(s) => s.id}
          caption={t("admin.co.sessions")}
          pageSize={6}
          defaultSort={{ key: "date", dir: "asc" }}
          empty={<EmptyState title={t("admin.co.emptySessions")} />}
          actions={(s) => (
            <Button variant="ghost" size="icon" aria-label={`${t("btn.delete")}: ${nameOf(s.programmeId)}`} onClick={() => setDeleting(s)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        />
      </section>

      <Modal open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={t("admin.co.edit")} className="max-w-2xl">
        {editing && (
          <ProgrammeForm
            key={editing.id}
            programme={editing}
            onCancel={() => setEditing(null)}
            onSave={(p) => {
              setProgrammes((prev) => prev.map((x) => (x.id === p.id ? p : x)));
              setEditing(null);
              toast(t("state.saved"), "success");
            }}
          />
        )}
      </Modal>

      <Modal open={creating} onOpenChange={setCreating} title={t("admin.co.newSession")}>
        <form onSubmit={createSession} noValidate className="space-y-4">
          <Field label={t("admin.co.programme")} htmlFor="cs-prog" error={sErrors.programme}>
            <Select id="cs-prog" value={sProgramme} onChange={(e) => setSProgramme(e.target.value)}>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{l(p.name)}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("label.date")} htmlFor="cs-date" error={sErrors.date}>
            <Input id="cs-date" type="date" value={sDate} aria-invalid={!!sErrors.date} onChange={(e) => setSDate(e.target.value)} />
          </Field>
          <Field label={t("admin.co.fInstructor")} htmlFor="cs-instr" hint={t("admin.co.instructorHint")}>
            <Input id="cs-instr" value={sInstructor} onChange={(e) => setSInstructor(e.target.value)} />
          </Field>
          <Field label={t("admin.ev.fCapacity")} htmlFor="cs-cap" error={sErrors.capacity}>
            <Input id="cs-cap" inputMode="numeric" value={sCapacity} aria-invalid={!!sErrors.capacity} onChange={(e) => setSCapacity(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreating(false)}>{t("btn.cancel")}</Button>
            <Button type="submit">{t("btn.save")}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.confirm.title")}
        body={deleting ? t("admin.confirm.body", { name: `${nameOf(deleting.programmeId)} ${deleting.date}` }) : ""}
        onConfirm={() => {
          if (!deleting) return;
          setSessions((prev) => prev.filter((x) => x.id !== deleting.id));
          toast(t("admin.deleted"), "success");
        }}
      />
    </>
  );
}
