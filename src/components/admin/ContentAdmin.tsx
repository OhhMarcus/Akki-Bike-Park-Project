"use client";

import { Download, ImagePlus, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useNewsletter } from "@/lib/store";
import { downloadFile, toCsv } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DemoTag } from "@/components/common/DemoTag";
import { EmptyState } from "@/components/common/States";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { ContentOverridesEditor } from "./ContentOverridesEditor";
import { csvName } from "./helpers";

const slots = [
  { id: "hero", label: "admin.ct.slotHero" },
  { id: "gallery1", label: "admin.ct.slotGallery" },
  { id: "gallery2", label: "admin.ct.slotGallery" },
  { id: "gallery3", label: "admin.ct.slotGallery" },
  { id: "event1", label: "admin.ct.slotEvent" },
  { id: "event2", label: "admin.ct.slotEvent" },
] as const;

function ImageSlots() {
  const { t } = useI18n();
  const toast = useToast();
  return (
    <section aria-labelledby="ct-img" className="surface space-y-4 p-5">
      <div>
        <h2 id="ct-img" className="font-display text-2xl font-bold uppercase">
          {t("admin.ct.images")} <DemoTag label={t("demo.placeholder")} />
        </h2>
        <p className="mt-1 text-sm text-silver">{t("admin.ct.imagesNote")}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {slots.map((s) => {
          const name = `${t(s.label)}${s.id === "hero" ? "" : ` ${s.id.slice(-1)}`}`;
          return (
            <li key={s.id}>
              <label htmlFor={`slot-${s.id}`} className="topo flex min-h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-graphite-600 p-3 text-center text-sm text-silver hover:border-silver">
                <ImagePlus className="h-5 w-5" aria-hidden />
                <span className="font-medium text-bone">{name}</span>
                <span className="text-xs">{t("admin.ct.uploadInProd")}</span>
                <input
                  id={`slot-${s.id}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    e.target.value = "";
                    toast(t("admin.ct.imageToast"), "info");
                  }}
                />
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Subscribers() {
  const { t } = useI18n();
  const toast = useToast();
  const [emails, setEmails] = useNewsletter();
  const rows = emails.map((email, i) => ({ email, i }));
  const columns: Column<{ email: string; i: number }>[] = [
    { key: "email", header: t("label.email"), sortValue: (r) => r.email, cell: (r) => <span className="break-all">{r.email}</span> },
  ];
  return (
    <section aria-labelledby="ct-news" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ct-news" className="font-display text-2xl font-bold uppercase">{t("admin.ct.subscribers")} ({emails.length})</h2>
        <Button
          variant="secondary"
          disabled={emails.length === 0}
          onClick={() => {
            downloadFile(csvName("newsletter"), toCsv(emails.map((email) => ({ email }))), "text/csv");
            toast(t("admin.exported"), "success");
          }}
        >
          <Download className="h-4 w-4" aria-hidden />
          {t("btn.export")}
        </Button>
      </div>
      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => `${r.i}-${r.email}`}
        caption={t("admin.ct.subscribers")}
        searchText={(r) => r.email}
        pageSize={8}
        empty={<EmptyState title={t("admin.ct.noSubscribers")} />}
        actions={(r) => (
          <Button variant="ghost" size="icon" aria-label={`${t("btn.remove")}: ${r.email}`} onClick={() => { setEmails((prev) => prev.filter((_, idx) => idx !== r.i)); toast(t("admin.deleted"), "success"); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      />
    </section>
  );
}

export function ContentAdmin() {
  const { t } = useI18n();
  return (
    <>
      <AdminPageHeader title={t("admin.ct.title")} description={t("admin.ct.sub")} />
      <div className="space-y-6">
        <AnnouncementEditor />
        <ContentOverridesEditor />
        <ImageSlots />
        <Subscribers />
      </div>
    </>
  );
}
