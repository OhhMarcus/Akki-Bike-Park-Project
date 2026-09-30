"use client";

import { useState } from "react";
import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { membershipTiers } from "@/config/pricing";
import { useI18n } from "@/i18n/provider";
import { useMemberships } from "@/lib/store";
import { addDays, downloadFile, hkToday, toCsv } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { DemoTag } from "@/components/common/DemoTag";
import { EmptyState } from "@/components/common/States";
import type { Membership } from "@/types";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { MembershipForm } from "./MembershipForm";
import { StatusBadge } from "./StatusBadge";
import { csvName } from "./helpers";

const SOON_DAYS = 30;

export function MembershipsAdmin() {
  const { t, l, date, money } = useI18n();
  const toast = useToast();
  const [members, setMembers] = useMemberships();
  const [editing, setEditing] = useState<Membership | "new" | null>(null);
  const [deleting, setDeleting] = useState<Membership | null>(null);
  const today = hkToday();
  const soon = addDays(today, SOON_DAYS);
  const expiringSoon = (m: Membership) => m.status === "active" && m.endsOn >= today && m.endsOn <= soon;
  const tierOf = (m: Membership) => membershipTiers.find((x) => x.id === m.tier);
  const daysLeft = (m: Membership) => Math.round((new Date(`${m.endsOn}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000);

  const columns: Column<Membership>[] = [
    { key: "name", header: t("label.name"), sortValue: (m) => m.riderName, cell: (m) => <div><p className="font-medium">{m.riderName} {m.isDemo && <DemoTag />}</p><p className="break-all text-xs text-silver-dim">{m.email}</p></div> },
    {
      key: "tier",
      header: t("admin.me.tier"),
      sortValue: (m) => m.tier,
      cell: (m) => {
        const tier = tierOf(m);
        return tier ? <span className="whitespace-nowrap">{l(tier.name)} · {money(tier.priceHKD)} <DemoTag /></span> : <span className="text-silver-dim">–</span>;
      },
    },
    {
      key: "status",
      header: t("label.status"),
      sortValue: (m) => m.status,
      cell: (m) => (
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge label={t(`admin.st.${m.status}`)} tone={m.status === "active" ? "green" : m.status === "pending" ? "amber" : "neutral"} />
          {expiringSoon(m) && <StatusBadge label={t("admin.me.expiresIn", { n: daysLeft(m) })} tone="amber" />}
        </div>
      ),
    },
    { key: "visits", header: t("admin.me.visits"), sortValue: (m) => m.visits, cell: (m) => m.visits, className: "tabular-nums" },
    { key: "ends", header: t("admin.me.ends"), sortValue: (m) => m.endsOn, cell: (m) => <span className="whitespace-nowrap">{date(m.endsOn)}</span> },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.me.title")}
        description={t("admin.me.sub")}
        actions={
          <>
            <Button
              variant="secondary"
              disabled={members.length === 0}
              onClick={() => {
                downloadFile(csvName("memberships"), toCsv(members.map((m) => ({ name: m.riderName, email: m.email, phone: m.phone, tier: m.tier, status: m.status, starts_on: m.startsOn, ends_on: m.endsOn, visits: m.visits }))), "text/csv");
                toast(t("admin.exported"), "success");
              }}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("btn.export")}
            </Button>
            <Button onClick={() => setEditing("new")}>
              <Plus className="h-4 w-4" aria-hidden />
              {t("admin.me.add")}
            </Button>
          </>
        }
      />
      <AdminDataTable
        rows={members}
        columns={columns}
        rowKey={(m) => m.id}
        caption={t("admin.me.title")}
        searchText={(m) => `${m.riderName} ${m.email} ${m.phone}`}
        defaultSort={{ key: "ends", dir: "asc" }}
        rowClassName={(m) => (expiringSoon(m) ? "bg-signal/5" : undefined)}
        empty={<EmptyState title={t("admin.me.empty")} action={<Button onClick={() => setEditing("new")}>{t("admin.me.add")}</Button>} />}
        actions={(m) => (
          <>
            <Button variant="ghost" size="icon" aria-label={`${t("btn.edit")}: ${m.riderName}`} onClick={() => setEditing(m)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`${t("btn.delete")}: ${m.riderName}`} onClick={() => setDeleting(m)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
      <Modal open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={t(editing === "new" ? "admin.me.add" : "admin.me.edit")} className="max-w-xl">
        {editing !== null && (
          <MembershipForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSave={(m) => {
              setMembers((prev) => (prev.some((x) => x.id === m.id) ? prev.map((x) => (x.id === m.id ? m : x)) : [m, ...prev]));
              setEditing(null);
              toast(t("state.saved"), "success");
            }}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.confirm.title")}
        body={deleting ? t("admin.confirm.body", { name: deleting.riderName }) : ""}
        onConfirm={() => {
          if (!deleting) return;
          setMembers((prev) => prev.filter((x) => x.id !== deleting.id));
          toast(t("admin.deleted"), "success");
        }}
      />
    </>
  );
}
