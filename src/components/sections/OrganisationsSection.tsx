import { Building2, Check, ShieldCheck, UsersRound } from "lucide-react";
import { WhitelistForm } from "../forms/WhitelistForm";
import { SectionHeading } from "../ui/SectionHeading";

const organisationBenefits = [
  "More affordable employee and student commuting",
  "Reduced dependence on unsafe public lift groups",
  "Better transport coordination",
  "Potential reduction in single-occupancy commuting",
  "Privacy-conscious organisation-based access",
  "No need to publish employee contact details",
] as const;

export function OrganisationsSection() {
  return (
    <section id="organisations" className="section organisations-section" aria-labelledby="organisations-heading">
      <div className="container">
        <div className="organisation-intro">
          <SectionHeading
            id="organisations-heading"
            eyebrow="For organisations"
            title="Bring Liftie to your organisation."
            body={<p>Liftie begins with recognised company and university email domains. If your organisation is not yet available, request a domain review.</p>}
          />
          <div className="organisation-visual" aria-hidden="true">
            <div className="org-node org-centre"><Building2 /><span>Approved domain</span></div>
            <div className="org-node org-person-a"><UsersRound /></div>
            <div className="org-node org-person-b"><UsersRound /></div>
            <div className="org-node org-shield"><ShieldCheck /></div>
            <svg viewBox="0 0 500 300"><path d="M72 232 C150 232 150 82 250 82 S352 232 430 232" /><path d="M250 82v142" /></svg>
          </div>
        </div>
        <div className="organisation-layout">
          <div className="organisation-value">
            <span className="mono">WHY ORGANISATIONS REQUEST ACCESS</span>
            <ul>
              {organisationBenefits.map((benefit) => (
                <li key={benefit}><Check size={16} aria-hidden="true" />{benefit}</li>
              ))}
            </ul>
            <div className="domain-note">
              <ShieldCheck size={20} />
              <p>
                <strong>Recognition is not endorsement.</strong> Domain recognition
                confirms eligibility for the network. It does not automatically
                represent a formal partnership or endorsement by the organisation.
              </p>
            </div>
          </div>
          <WhitelistForm />
        </div>
      </div>
    </section>
  );
}
