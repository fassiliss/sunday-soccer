import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SecureClubForm } from "@/components/SecureClubForm";
import { site } from "@/lib/site";

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact"
        text="Reach Ethio Unity for team questions, player inquiries, partnerships, and community events."
      />

      <section className="section-container contact-layout">
        <div className="contact-panel">
          <h2>Get in touch</h2>
          <p>
            Use the club contact details below, or send a message through the
            form and the team will respond.
          </p>
          <ul className="contact-list large">
            <li>
              <Mail size={20} />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <Phone size={20} />
              <a href={`tel:${site.phone}`}>{site.phone}</a>
            </li>
            <li>
              <MapPin size={20} />
              <span>{site.location}</span>
            </li>
          </ul>
        </div>

        <SecureClubForm kind="contact" />
      </section>
    </>
  );
}
