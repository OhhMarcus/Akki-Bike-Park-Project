"use client";

import { useState } from "react";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { usePromos } from "@/lib/store";
import { hkToday } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { DemoTag } from "@/components/common/DemoTag";
import { EmptyState } from "@/components/common/States";
import type { PromotionCode } from "@/types";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { PromoForm } from "./PromoForm";
import { StatusBadge } from "./StatusBadge";

export function PromosAdmin() {
  const { t, date, money } = useI18n();
  const toast = useToast();
  const [promos, setPromos] = usePromos();
  const [editing, setEditing] = useState<PromotionCode | "new" | null>(null);
  const [deleting, setDeleting] = useState<PromotionCode | null>(null);
  const today = hkToday();

  const columns: Column<PromotionCode>[] = [
    {
      key: "code",
      header: t("admin.pr.code"),
      sortValue: (p) => p.code,
      cell: (p) => (
        <div>
          <span className="font-mono font-medium">{p.code}</span> {p.referral && <StatusBadge label={t("admin.pr.referralTag")} tone="blue" />}
          {p.description && <p className="text-xs text-silver-dim">{p.description}</p>}
        </div>
      ),
    },
    { key: "value", header: t("admin.pr.discount"), sortValue: (p) => p.value, cell: (p) => (p.kind === "percent" ? `${p.value}%` : money(p.value)) },
    { key: "used", header: t("admin.pr.used"), sortValue: (p) => p.used, cell: (p) => <span className="tabular-nums">{p.used}{p.usageLimit !== null ? ` / ${p.usageLimit}` : ` / ${t("admin.pr.unlimited")}`}</span> },
    { key: "expires", header: t("admin.pr.expires"), sortValue: (p) => p.expiresOn ?? "9999", cell: (p) => (p.expiresOn ? <span className="whitespace-nowrap">{date(p.expiresOn)}</span> : <span className="text-silver-dim">–</span>) },
    {
      key: "status",
      header: t("label.status"),
      sortValue: (p) => (p.active ? 1 : 0),
      cell: (p) => {
        const expired = !!p.expiresOn && p.expiresOn < today;
        return (
          <div className="flex flex-wrap items-center gap-1">
            <StatusBadge label={t(expired ? "admin.pr.expired" : p.active ? "admin.pr.activeTag" : "admin.pr.inactive")} tone={expired ? "red" : p.active ? "green" : "neutral"} />
            <DemoTag />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.pr.title")}
        description={t("admin.pr.sub")}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("admin.pr.create")}
          </Button>
        }
      />
      <AdminDataTable
        rows={promos}
        columns={columns}
        rowKey={(p) => p.id}
        caption={t("admin.pr.title")}
        searchText={(p) => `${p.code} ${p.description}`}
        empty={<EmptyState title={t("admin.pr.empty")} action={<Button onClick={() => setEditing("new")}>{t("admin.pr.create")}</Button>} />}
        actions={(p) => (
          <>
            <Button variant="ghost" size="icon" aria-label={`${t(p.active ? "admin.pr.deactivate" : "admin.pr.activate")}: ${p.code}`} onClick={() => { setPromos((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x))); toast(t(p.active ? "admin.pr.deactivated" : "admin.pr.activated"), "success"); }}>
              <Power className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`${t("btn.edit")}: ${p.code}`} onClick={() => setEditing(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`${t("btn.delete")}: ${p.code}`} onClick={() => setDeleting(p)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
      <Modal open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={t(editing === "new" ? "admin.pr.create" : "admin.pr.edit")}>
        {editing !== null && (
          <PromoForm
            key={editing === "new" ? "new" : editing.id}
            initial={editing === "new" ? null : editing}
            existing={promos}
            onCancel={() => setEditing(null)}
            onSave={(p) => {
              setPromos((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [p, ...prev]));
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
        body={deleting ? t("admin.confirm.body", { name: deleting.code }) : ""}
        onConfirm={() => {
          if (!deleting) return;
          setPromos((prev) => prev.filter((x) => x.id !== deleting.id));
          toast(t("admin.deleted"), "success");
        }}
      />
    </>
  );
}
