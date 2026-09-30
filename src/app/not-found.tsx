import Link from "next/link";
import { getServerT } from "@/i18n/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const { t } = await getServerT();
  return (
    <main className="container flex min-h-[70vh] flex-col items-start justify-center gap-5 py-20">
      <p className="eyebrow">404</p>
      <h1 className="h-display text-5xl md:text-7xl">{t("state.notFoundTitle")}</h1>
      <p className="max-w-md text-silver">{t("state.notFoundBody")}</p>
      <Link href="/" className={cn(buttonVariants())}>{t("nav.home")}</Link>
    </main>
  );
}
