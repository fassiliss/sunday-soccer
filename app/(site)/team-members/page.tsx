import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { TeamGrid } from "@/components/TeamGrid";

export default function TeamMembersPage() {
  return (
    <>
      <PageHero
        title="Team Members"
        text="Meet the players and leaders representing Ethio Unity on and off the field."
      />
      <section className="section-container">
        <SectionHeading
          eyebrow="Roster"
          title="United by work rate, trust, and club pride."
          text="These profiles are ready for your official team names, roles, jersey numbers, and photos."
        />
        <TeamGrid />
      </section>
    </>
  );
}
