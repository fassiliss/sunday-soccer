import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ShieldCheck, Trophy, Users } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { TeamGrid } from "@/components/TeamGrid";
import { site, values } from "@/lib/site";

const stats = [
  { label: "Community First", value: "100%" },
  { label: "Training Focus", value: "Weekly" },
  { label: "Open Tryouts", value: "All Levels" },
  { label: "Club Spirit", value: "United" },
];

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span>Official club site</span>
          <h1>{site.name} Soccer Club</h1>
          <p>
            A competitive and welcoming soccer home for players, families, and
            supporters connected by Ethiopian pride and the love of the game.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/join-us">
              Join Us
            </Link>
            <Link className="secondary-button" href="/team-members">
              Meet the Team
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-band">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="section-container split-section">
        <div className="image-stack">
          <Image
            src="/ethio-unity-about-club.jpeg"
            alt="Ethio Unity player and coach holding a soccer trophy"
            fill
            sizes="(max-width: 900px) 100vw, 42vw"
          />
        </div>
        <div className="content-block">
          <SectionHeading
            eyebrow="About the club"
            title="Built for players who want more than a match day."
            text="Ethio Unity brings players together through organized training, strong leadership, and a culture that values commitment as much as talent."
          />
          <div className="feature-list">
            <p>
              <ShieldCheck size={21} />
              Player development with standards, structure, and accountability.
            </p>
            <p>
              <Users size={21} />
              A club environment where families and supporters belong.
            </p>
            <p>
              <Trophy size={21} />
              Competitive ambition rooted in respect and teamwork.
            </p>
          </div>
          <Link className="text-link" href="/about">
            Learn about Ethio Unity
          </Link>
        </div>
      </section>

      <section className="dark-section">
        <div className="section-container">
          <SectionHeading
            eyebrow="Our values"
            title="The badge means unity, discipline, and pride."
            text="Every player represents the club on the field, at training, and in the community."
          />
          <div className="value-grid">
            {values.map((value) => (
              <div key={value}>
                <ShieldCheck size={24} />
                <h3>{value}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container">
        <SectionHeading
          eyebrow="Team members"
          title="Players and leaders carrying the club forward."
          text="Replace these sample names and roles with your official roster when ready."
        />
        <TeamGrid />
      </section>

      <section className="match-cta">
        <div>
          <span>
            <CalendarDays size={20} />
            Training and tryout inquiries
          </span>
          <h2>Ready to play for Ethio Unity?</h2>
        </div>
        <Link className="primary-button" href="/join-us">
          Start Application
        </Link>
      </section>
    </>
  );
}
