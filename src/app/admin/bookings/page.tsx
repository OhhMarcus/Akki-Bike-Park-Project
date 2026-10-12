import { dictionary } from "@/i18n/dictionary";
import { buildMetadata } from "@/lib/seo";
import { BookingsScreen, type BookingsQuery } from "@/components/admin/ops/BookingsScreen";

export async function generateMetadata() {
  return buildMetadata({ title: dictionary["admin.nav.bookings"], description: dictionary["adminOps.bookings.meta"], path: "/admin/bookings", noindex: true });
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const one = (k: keyof BookingsQuery) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };
  const initial: BookingsQuery = { q: one("q"), range: one("range"), kind: one("kind"), source: one("source"), status: one("status") };
  // Remount when the URL changes so links like ?q=AK-7F3K2 always apply.
  return <BookingsScreen key={JSON.stringify(initial)} initial={initial} />;
}
