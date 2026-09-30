import { buildMetadata } from "@/lib/seo";
import { getServerT } from "@/i18n/server";
import { GroupsExperience } from "@/components/groups/GroupsExperience";
import { buttonVariants } from "@/components/ui/button";

export async function generateMetadata() {
  return buildMetadata({
    title: { en: "Groups & Private Events", zh: "團體及私人活動" },
    description: { en: "Schools, youth organisations, teams, birthdays and brand events at AKKI Bike Park. Plan your group and request a quote.", zh: "學校、青少年機構、企業團隊、生日派對及品牌活動。規劃你的團體並索取報價。" },
    path: "/groups",
  });
}

export default async function GroupsPage() {
  const { t } = await getServerT();
  return (
    <>
      <section className="topo border-b border-graphite-800">
        <div className="container py-16 md:py-24">
          <p className="eyebrow">{t("groups.eyebrow")}</p>
          <h1 className="h-display mt-3">{t("groups.title")}</h1>
          <p className="mt-4 max-w-xl text-lg text-silver">{t("groups.lead")}</p>
          <a href="#plan" className={`${buttonVariants()} mt-8`}>{t("groups.heroPlan")}</a>
        </div>
      </section>
      <GroupsExperience />
    </>
  );
}
