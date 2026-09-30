"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { demoAdmin } from "@/config/site";
import { useI18n } from "@/i18n/provider";
import { useAdminSession } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { DemoTag } from "@/components/common/DemoTag";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function AdminLogin() {
  const { t } = useI18n();
  const [, setSession] = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim()) next.email = t("admin.login.emailRequired");
    if (!password) next.password = t("admin.login.passwordRequired");
    if (!next.email && !next.password && (email.trim().toLowerCase() !== demoAdmin.email.toLowerCase() || password !== demoAdmin.password)) next.form = t("admin.login.error");
    setErrors(next);
    if (Object.keys(next).length) return;
    setSession({ email: email.trim().toLowerCase(), at: new Date().toISOString() });
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm text-silver hover:text-bone">
          {t("admin.login.back")}
        </Link>
        <LanguageSwitcher />
      </div>
      <main className="container flex flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-md space-y-5">
          <div>
            <p className="eyebrow">AKKI</p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-none">{t("admin.login.title")}</h1>
            <p className="mt-2 text-sm text-silver">{t("admin.login.intro")}</p>
          </div>

          <div className="rounded-lg border border-signal/40 bg-signal/5 p-4 text-sm">
            <div className="flex items-center gap-2">
              <DemoTag />
              <p className="font-semibold">{t("admin.login.demoTitle")}</p>
            </div>
            <dl className="mt-3 grid grid-cols-[5rem_1fr] gap-y-1 break-all text-silver">
              <dt>{t("label.email")}</dt>
              <dd className="font-mono text-bone">{demoAdmin.email}</dd>
              <dt>{t("admin.login.password")}</dt>
              <dd className="font-mono text-bone">{demoAdmin.password}</dd>
            </dl>
            <Button variant="secondary" className="mt-3" onClick={() => { setEmail(demoAdmin.email); setPassword(demoAdmin.password); setErrors({}); }}>
              {t("admin.login.fill")}
            </Button>
          </div>

          <form onSubmit={submit} noValidate className="surface space-y-4 p-5">
            {errors.form && (
              <p role="alert" className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {errors.form}
              </p>
            )}
            <Field label={t("label.email")} htmlFor="admin-email" error={errors.email}>
              <Input id="admin-email" type="email" autoComplete="username" value={email} aria-invalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label={t("admin.login.password")} htmlFor="admin-password" error={errors.password}>
              <Input id="admin-password" type="password" autoComplete="current-password" value={password} aria-invalid={!!errors.password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Button type="submit" className="w-full">
              {t("admin.login.submit")}
            </Button>
          </form>
          <p className="text-xs text-signal">{t("admin.login.demoNote")}</p>
        </div>
      </main>
    </div>
  );
}
