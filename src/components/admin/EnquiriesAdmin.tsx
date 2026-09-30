"use client";

import { useState } from "react";
import { Download, MessageCircle, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import type { MessageKey } from "@/i18n/dictionary";
import { useEnquiries, useGroupEnquiries, useWaitlist } from "@/lib/store";
import { downloadFile, toCsv } from "@/lib/dates";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/common/States";
import { DemoTag } from "@/components/common/DemoTag";
import { cn } from "@/lib/utils";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { csvName, replyUrl } from "./helpers";

type Tab = "general" | "group" | "waitlist";
const tabs: { id: Tab; label: MessageKey }[] = [
  { id: "general", label: "admin.en.general" },
  { id: "group", label: "admin.en.group" },
  { id: "waitlist", label: "admin.en.waitlist" },
];

function StatusSelect<S extends string>({ value, options, label, onChange }: { value: S; options: readonly S[]; label: string; onChange: (s: S) => void }) {
  const { t } = useI18n();
  return (
    <Select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as S)} className="w-36">
      {options.map((o) => (
        <option key={o} value={o}>{t(`admin.st.${o}`)}</option>
      ))}
    </Select>
  );
}

function ReplyLink({ phone, email, name }: { phone?: string; email: string; name: string }) {
  const { t } = useI18n();
  return (
    <a href={replyUrl(phone, email, t("admin.en.replyText", { name }))} target="_blank" rel="noopener noreferrer" aria-label={`${t("admin.en.reply")}: ${name}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
      <MessageCircle className="h-4 w-4" />
    </a>
  );
}

export function EnquiriesAdmin() {
  const { t, date } = useI18n();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("general");
  const [enquiries, setEnquiries] = useEnquiries();
  const [groups, setGroups] = useGroupEnquiries();
  const [waitlist, setWaitlist] = useWaitlist();
  const [deleting, setDeleting] = useState<{ tab: Tab; id: string; name: string } | null>(null);

  const created = (iso: string) => <span className="whitespace-nowrap">{date(iso.slice(0, 10))}</span>;
  const del = (tabId: Tab, id: string, name: string) => (
    <Button variant="ghost" size="icon" aria-label={`${t("btn.delete")}: ${name}`} onClick={() => setDeleting({ tab: tabId, id, name })}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
  const empty = <EmptyState title={t("admin.en.empty")} />;
  const exportBtn = (rows: Record<string, unknown>[], base: string) => (
    <Button
      variant="secondary"
      disabled={rows.length === 0}
      onClick={() => {
        downloadFile(csvName(base), toCsv(rows), "text/csv");
        toast(t("admin.exported"), "success");
      }}
    >
      <Download className="h-4 w-4" aria-hidden />
      {t("btn.export")}
    </Button>
  );

  const generalCols: Column<(typeof enquiries)[number]>[] = [
    { key: "date", header: t("label.date"), sortValue: (e) => e.createdAt, cell: (e) => created(e.createdAt) },
    { key: "name", header: t("label.name"), sortValue: (e) => e.name, cell: (e) => <span className="font-medium">{e.name} {e.isDemo && <DemoTag />}</span> },
    { key: "topic", header: t("admin.en.topic"), cell: (e) => t(`admin.en.topic.${e.topic}`) },
    { key: "message", header: t("label.message"), cell: (e) => <p className="line-clamp-2 min-w-[14rem] max-w-md text-silver">{e.message}</p> },
    { key: "status", header: t("label.status"), sortValue: (e) => e.status, cell: (e) => <StatusSelect label={`${t("label.status")}: ${e.name}`} value={e.status} options={["new", "replied", "closed"] as const} onChange={(s) => setEnquiries((p) => p.map((x) => (x.id === e.id ? { ...x, status: s } : x)))} /> },
  ];
  const groupCols: Column<(typeof groups)[number]>[] = [
    { key: "date", header: t("label.date"), sortValue: (e) => e.createdAt, cell: (e) => created(e.createdAt) },
    { key: "org", header: t("admin.en.organisation"), sortValue: (e) => e.organisation, cell: (e) => <div><p className="font-medium">{e.organisation} {e.isDemo && <DemoTag />}</p><p className="text-xs text-silver-dim">{e.contactName}</p></div> },
    { key: "segment", header: t("admin.en.segment"), cell: (e) => t(`admin.en.segment.${e.segment}`) },
    { key: "size", header: t("admin.en.size"), sortValue: (e) => e.groupSize, cell: (e) => e.groupSize, className: "tabular-nums" },
    { key: "message", header: t("label.message"), cell: (e) => <p className="line-clamp-2 min-w-[12rem] max-w-sm text-silver">{e.message}</p> },
    { key: "status", header: t("label.status"), sortValue: (e) => e.status, cell: (e) => <StatusSelect label={`${t("label.status")}: ${e.organisation}`} value={e.status} options={["new", "contacted", "quoted", "won", "lost"] as const} onChange={(s) => setGroups((p) => p.map((x) => (x.id === e.id ? { ...x, status: s } : x)))} /> },
  ];
  const waitCols: Column<(typeof waitlist)[number]>[] = [
    { key: "date", header: t("admin.en.slotDate"), sortValue: (e) => e.date, cell: (e) => <span className="whitespace-nowrap">{date(e.date)} · {t(`period.${e.period}`)}</span> },
    { key: "name", header: t("label.name"), sortValue: (e) => e.name, cell: (e) => <span className="font-medium">{e.name} {e.isDemo && <DemoTag />}</span> },
    { key: "exp", header: t("admin.bk.experience"), cell: (e) => t(`exp.${e.experienceId}`) },
    { key: "party", header: t("admin.en.party"), sortValue: (e) => e.partySize, cell: (e) => e.partySize, className: "tabular-nums" },
    { key: "status", header: t("label.status"), sortValue: (e) => e.status, cell: (e) => <StatusSelect label={`${t("label.status")}: ${e.name}`} value={e.status} options={["waiting", "notified", "booked", "removed"] as const} onChange={(s) => setWaitlist((p) => p.map((x) => (x.id === e.id ? { ...x, status: s } : x)))} /> },
  ];

  return (
    <>
      <AdminPageHeader title={t("admin.en.title")} description={t("admin.en.sub")} />
      <div role="tablist" aria-label={t("admin.en.title")} className="mb-4 flex gap-1 overflow-x-auto border-b border-graphite-700">
        {tabs.map((x) => {
          const count = x.id === "general" ? enquiries.filter((e) => e.status === "new").length : x.id === "group" ? groups.filter((e) => e.status === "new").length : waitlist.filter((e) => e.status === "waiting").length;
          return (
            <button key={x.id} type="button" role="tab" id={`tab-${x.id}`} aria-selected={tab === x.id} aria-controls={`panel-${x.id}`} onClick={() => setTab(x.id)} className={cn("inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-medium", tab === x.id ? "border-bone text-bone" : "border-transparent text-silver hover:text-bone")}>
              {t(x.label)}
              {count > 0 && <span className="rounded-full bg-signal/15 px-2 text-xs text-signal">{count}</span>}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "general" && (
          <AdminDataTable
            rows={enquiries}
            columns={generalCols}
            rowKey={(e) => e.id}
            caption={t("admin.en.general")}
            searchText={(e) => `${e.name} ${e.email} ${e.message}`}
            defaultSort={{ key: "date", dir: "desc" }}
            empty={empty}
            toolbar={exportBtn(enquiries.map((e) => ({ date: e.createdAt, name: e.name, email: e.email, phone: e.phone ?? "", topic: e.topic, message: e.message, status: e.status })), "enquiries")}
            actions={(e) => (<><ReplyLink phone={e.phone} email={e.email} name={e.name} />{del("general", e.id, e.name)}</>)}
          />
        )}
        {tab === "group" && (
          <AdminDataTable
            rows={groups}
            columns={groupCols}
            rowKey={(e) => e.id}
            caption={t("admin.en.group")}
            searchText={(e) => `${e.organisation} ${e.contactName} ${e.email} ${e.message}`}
            defaultSort={{ key: "date", dir: "desc" }}
            empty={empty}
            toolbar={exportBtn(groups.map((e) => ({ date: e.createdAt, organisation: e.organisation, contact: e.contactName, email: e.email, phone: e.phone, segment: e.segment, group_size: e.groupSize, preferred_date: e.preferredDate ?? "", add_ons: e.addOns.join("|"), message: e.message, status: e.status })), "group-enquiries")}
            actions={(e) => (<><ReplyLink phone={e.phone} email={e.email} name={e.contactName} />{del("group", e.id, e.organisation)}</>)}
          />
        )}
        {tab === "waitlist" && (
          <AdminDataTable
            rows={waitlist}
            columns={waitCols}
            rowKey={(e) => e.id}
            caption={t("admin.en.waitlist")}
            searchText={(e) => `${e.name} ${e.email} ${e.phone}`}
            defaultSort={{ key: "date", dir: "asc" }}
            empty={empty}
            toolbar={exportBtn(waitlist.map((e) => ({ name: e.name, email: e.email, phone: e.phone, experience: e.experienceId, date: e.date, period: e.period, party_size: e.partySize, status: e.status })), "waitlist")}
            actions={(e) => (<><ReplyLink phone={e.phone} email={e.email} name={e.name} />{del("waitlist", e.id, e.name)}</>)}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.confirm.title")}
        body={deleting ? t("admin.confirm.body", { name: deleting.name }) : ""}
        onConfirm={() => {
          if (!deleting) return;
          const { tab: k, id } = deleting;
          if (k === "general") setEnquiries((p) => p.filter((x) => x.id !== id));
          else if (k === "group") setGroups((p) => p.filter((x) => x.id !== id));
          else setWaitlist((p) => p.filter((x) => x.id !== id));
          toast(t("admin.deleted"), "success");
        }}
      />
    </>
  );
}
