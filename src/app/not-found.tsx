import Link from "next/link";
import { getServerT } from "@/i18n/server";
import { buttonVariants } from "@/components/ui/button";

export default async function NotFound() {
  const { t } = await getServerT();
  return (
    <main className="pattern-bg relative isolate grid min-h-screen place-items-center">
      <div className="absolute inset-0 -z-10 bg-ink/80" aria-hidden />
      <div className="container max-w-lg space-y-5 text-center">
        <p className="eyebrow">404</p>
        <h1 className="h1">{t("state.notFoundTitle")}</h1>
        <p className="text-muted">{t("state.notFoundBody")}</p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>{t("nav.home")}</Link>
      </div>
    </main>
  );
}
