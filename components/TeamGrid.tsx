import Image from "next/image";
import { members } from "@/lib/site";

export function TeamGrid() {
  return (
    <div className="team-grid">
      {members.map((member) => (
        <article className="player-card" key={member.name}>
          <div className="player-image">
            <Image src={member.image} alt={member.name} fill sizes="(max-width: 768px) 100vw, 33vw" />
            <span>{member.number}</span>
          </div>
          <div className="player-body">
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
