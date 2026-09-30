"use client";

import { useMemo } from "react";
import { Download, Mail } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { useBookings } from "@/lib/store";
import { downloadFile, toCsv } from "@/lib/dates";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/common/States";
import { DemoTag } from "@/components/common/DemoTag";
import { cn } from "@/lib/utils";
import { AdminDataTable, type Column } from "./AdminDataTable";
import { AdminPageHeader } from "./AdminPageHeader";
import { csvName } from "./helpers";

type Rider = { email: string; name: string; phone: string; count: number; spent: number; last: string };

export function CustomersAdmin() {
  const { t, date, money } = useI18n();
  const toast = useToast();
  const [bookings] = useBookings();

  const riders = useMemo<Rider[]>(() => {
    const map = new Map<string, Rider>();
    for (const b of [...bookings].sort((a, c) => a.date.localeCompare(c.date))) {
      const key = b.contactEmail.trim().toLowerCase();
      const prev = map.get(key);
      map.set(key, {
        email: key,
        name: b.contactName,
        phone: b.contactPhone,
        count: (prev?.count ?? 0) + 1,
        spent: (prev?.spent ?? 0) + (b.status === "cancelled" ? 0 : b.total),
        last: b.date,
      });
    }
    return [...map.values()];
  }, [bookings]);

  const columns: Column<Rider>[] = [
    { key: "name", header: t("label.name"), sortValue: (r) => r.name, cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", header: t("label.email"), sortValue: (r) => r.email, cell: (r) => <span className="break-all text-silver">{r.email}</span> },
    { key: "phone", header: t("label.phone"), cell: (r) => <span className="whitespace-nowrap">{r.phone}</span> },
    { key: "count", header: t("admin.cu.bookings"), sortValue: (r) => r.count, cell: (r) => r.count, className: "tabular-nums" },
    {
      key: "spent",
      header: t("admin.cu.spent"),
      sortValue: (r) => r.spent,
      cell: (r) => (
        <span className="whitespace-nowrap tabular-nums">
          {money(r.spent)} <DemoTag />
        </span>
      ),
    },
    { key: "last", header: t("admin.cu.last"), sortValue: (r) => r.last, cell: (r) => <span className="whitespace-nowrap">{date(r.last)}</span> },
  ];

  return (
    <>
      <AdminPageHeader
        title={t("admin.cu.title")}
        description={t("admin.cu.sub")}
        actions={
          <Button
            variant="secondary"
            disabled={riders.length === 0}
            onClick={() => {
              downloadFile(csvName("riders"), toCsv(riders.map((r) => ({ name: r.name, email: r.email, phone: r.phone, bookings: r.count, total_spent_demo: r.spent, last_booking: r.last }))), "text/csv");
              toast(t("admin.exported"), "success");
            }}
          >
            <Download className="h-4 w-4" aria-hidden />
            {t("btn.export")}
          </Button>
        }
      />
      <AdminDataTable
        rows={riders}
        columns={columns}
        rowKey={(r) => r.email}
        caption={t("admin.cu.title")}
        searchText={(r) => `${r.name} ${r.email} ${r.phone}`}
        defaultSort={{ key: "last", dir: "desc" }}
        empty={<EmptyState title={t("admin.cu.empty")} />}
        actions={(r) => (
          <a href={`mailto:${r.email}`} aria-label={`${t("label.email")}: ${r.name}`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
            <Mail className="h-4 w-4" />
          </a>
        )}
      />
    </>
  );
}
