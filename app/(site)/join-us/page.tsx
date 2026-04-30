import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SecureClubForm } from "@/components/SecureClubForm";

const expectations = [
  "Players of all experience levels are welcome to reach out.",
  "Training commitment and respect for teammates are expected.",
  "Parents, volunteers, sponsors, and supporters can also connect here.",
];

export default function JoinUsPage() {
  return (
    <>
      <PageHero
        title="Join Us"
        text="Take the first step toward training, playing, volunteering, or supporting Ethio Unity."
      />

      <section className="section-container join-layout">
        <div className="join-panel">
          <span>Become part of the club</span>
          <h2>Send your interest to Ethio Unity.</h2>
          <p>
            Share a few details and the club can follow up about training,
            tryouts, volunteer roles, or sponsorship opportunities.
          </p>
          <div className="expectation-list">
            {expectations.map((item) => (
              <p key={item}>
                <CheckCircle2 size={20} />
                {item}
              </p>
            ))}
          </div>
        </div>

        <SecureClubForm kind="join" />
      </section>
    </>
  );
}
