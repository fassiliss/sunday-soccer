import Image from "next/image";
import { Goal, HeartHandshake, Medal, Users } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";

const pillars = [
  {
    icon: <Users size={24} />,
    title: "Community",
    text: "A place where players, parents, coaches, and supporters can build lasting connections.",
  },
  {
    icon: <Goal size={24} />,
    title: "Development",
    text: "Training sessions shaped around fundamentals, decision-making, fitness, and confidence.",
  },
  {
    icon: <Medal size={24} />,
    title: "Competition",
    text: "A team culture that prepares players to compete with focus, courage, and respect.",
  },
  {
    icon: <HeartHandshake size={24} />,
    title: "Identity",
    text: "A club proud to carry Ethiopian heritage into every match and community event.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        text="Ethio Unity exists to create a strong, welcoming soccer home for players who want to grow together."
      />

      <section className="section-container split-section">
        <div className="content-block">
          <SectionHeading
            eyebrow="Our story"
            title="A club shaped by unity and ambition."
            text="Ethio Unity was created for players and families who believe soccer can connect culture, friendship, and competitive growth."
          />
          <p>
            The club welcomes players who are ready to train seriously, support
            one another, and represent the badge with pride. From new players
            learning the game to experienced athletes chasing the next level,
            the goal is the same: improve together.
          </p>
        </div>
        <div className="image-stack tall contain-photo">
          <Image
            src="/ethio-unity-about-us-trophy.jpeg"
            alt="Ethio Unity members celebrating with a soccer trophy"
            fill
            sizes="(max-width: 900px) 100vw, 42vw"
          />
        </div>
      </section>

      <section className="section-container">
        <SectionHeading
          eyebrow="What guides us"
          title="A clear standard for every session and every match."
        />
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article className="pillar-card" key={pillar.title}>
              {pillar.icon}
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
