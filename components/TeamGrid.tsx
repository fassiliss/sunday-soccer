"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";
import { members } from "@/lib/site";

export function TeamGrid() {
  const [selectedImage, setSelectedImage] = useState<(typeof members)[number] | null>(null);

  return (
    <>
      <div className="team-grid">
        {members.map((member) => (
          <article className="player-card" key={member.name}>
            <button
              className="player-image"
              type="button"
              onClick={() => setSelectedImage(member)}
              aria-label={`View larger photo for ${member.name}`}
            >
              <Image src={member.image} alt={member.name} fill sizes="(max-width: 768px) 100vw, 33vw" />
              <span>{member.number}</span>
            </button>
            <div className="player-body">
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          </article>
        ))}
      </div>

      {selectedImage ? (
        <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={`${selectedImage.name} photo`}>
          <button className="photo-lightbox-backdrop" type="button" onClick={() => setSelectedImage(null)} aria-label="Close photo" />
          <div className="photo-lightbox-panel">
            <button className="icon-button photo-lightbox-close" type="button" onClick={() => setSelectedImage(null)} aria-label="Close photo">
              <X size={22} />
            </button>
            <div className="photo-lightbox-image">
              <Image src={selectedImage.image} alt={selectedImage.name} fill sizes="min(92vw, 980px)" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
