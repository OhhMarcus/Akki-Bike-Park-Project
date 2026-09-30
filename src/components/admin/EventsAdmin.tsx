"use client";

import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useEvents } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { DemoTag } from "@/components/common/DemoTag";
import { EmptyState } from "@/components/common/States";
import type { ParkEvent } from "@/types";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { EventForm } from "./EventForm";
import { StatusBadge } from "./StatusBadge";

export function EventsAdmin() {
  const { t, l, date, money } = useI18n();
  const toast = useToast();
  const [events, setEvents] = useEvents();
  const [editing, setEditing] = useState<ParkEvent | "new" | null>(null);
  const [deleting, setDeleting] = useState<ParkEvent | null>(null);

  const save = (e: ParkEvent) => {
    setEvents((prev) => (prev.some((x) => x.id === e.id) ? prev.map((x) => (x.id === e.id ? e : x)) : [e, ...prev]));
    setEditing(null);
    toast(t("state.saved"), "success");
  };

  const columns: Column<ParkEvent>[] = [
    {
      key: "title",
      header: t("admin.ev.fTitle"),
      sortValue: (e) => l(e.title),
      cell: (e) => (
        <div className="min-w-[10rem]">
          <p className="font-medium">{l(e.title)}</p>
          <p className="text-xs text-silver-dim">{t(`evtype.${e.type}`)}</p>
        </div>
      ),
    },
    { key: "date", header: t("label.date"), sortValue: (e) => e.date, cell: (e) => <span className="whitespace-nowrap">{date(e.date)} · {e.startTime}</span> },
    { key: "reg", header: t("admin.ev.registeredCol"), sortValue: (e) => e.registered, cell: (e) => <span className="tabular-nums">{e.registered}/{e.capacity}</span> },
    { key: "price", header: t("label.price"), sortValue: (e) => e.priceHKD ?? -1, cell: (e) => <span className="whitespace-nowrap">{e.priceHKD === null ? t("label.tbc") : e.priceHKD === 0 ? t("admin.ev.free") : money(e.priceHKD)}</span> },
    {
      key: "status",
      header: t("label.status"),
      sortValue: (e) => (e.published ? 1 : 0),
      cell: (e) => (
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge label={t(e.published ? "admin.ev.published" : "admin.ev.draft")} tone={e.published ? "green" : "neutral"} />
          {e.isDemo && <DemoTag />}
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.ev.title")}
        description={t("admin.ev.sub")}
        actions={
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("admin.ev.create")}
          </Button>
        }
      />
      <AdminDataTable
        rows={events}
        columns={columns}
        rowKey={(e) => e.id}
        caption={t("admin.ev.title")}
        searchText={(e) => `${e.title.en} ${e.title.zh} ${e.type}`}
        defaultSort={{ key: "date", dir: "asc" }}
        empty={<EmptyState title={t("admin.ev.empty")} action={<Button onClick={() => setEditing("new")}>{t("admin.ev.create")}</Button>} />}
        actions={(e) => (
          <>
            <Button variant="ghost" size="icon" aria-label={`${t(e.published ? "admin.ev.unpublish" : "admin.ev.publish")}: ${l(e.title)}`} onClick={() => { setEvents((prev) => prev.map((x) => (x.id === e.id ? { ...x, published: !x.published } : x))); toast(t(e.published ? "admin.ev.unpublished" : "admin.ev.publishedToast"), "success"); }}>
              {e.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label={`${t("btn.edit")}: ${l(e.title)}`} onClick={() => setEditing(e)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label={`${t("btn.delete")}: ${l(e.title)}`} onClick={() => setDeleting(e)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      />
      <Modal open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={t(editing === "new" ? "admin.ev.create" : "admin.ev.edit")} className="max-w-2xl">
        {editing !== null && <EventForm key={editing === "new" ? "new" : editing.id} initial={editing === "new" ? null : editing} onSave={save} onCancel={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t("admin.confirm.title")}
        body={deleting ? t("admin.confirm.body", { name: l(deleting.title) }) : ""}
        onConfirm={() => {
          if (!deleting) return;
          setEvents((prev) => prev.filter((x) => x.id !== deleting.id));
          toast(t("admin.deleted"), "success");
        }}
      />
    </>
  );
}
