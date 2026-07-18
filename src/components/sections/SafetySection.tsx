import { LockKeyhole, ShieldCheck } from "lucide-react";
import { safetyLayers } from "../../data/content";
import { PreferenceDemo } from "../product/PreferenceDemo";
import { SectionHeading } from "../ui/SectionHeading";

export function SafetySection() {
  return (
    <>
      <section id="safety" className="section safety-section" aria-labelledby="safety-heading">
        <div className="container">
          <SectionHeading
            id="safety-heading"
            eyebrow="Safety and control architecture"
            title="Safety is not one feature. It is the structure of the product."
            body={<p>Liftie is planned as a sequence of boundaries, decisions, and records. Organisation affiliation is the starting layer, not a claim of complete identity or safety.</p>}
          />
          <div className="safety-architecture">
            <div className="safety-core" aria-hidden="true">
              <div className="safety-orbit orbit-a"><span>01</span></div>
              <div className="safety-orbit orbit-b"><span>03</span></div>
              <div className="safety-orbit orbit-c"><span>06</span></div>
              <div className="safety-lock">
                <ShieldCheck />
                <strong>Controlled<br />corridor</strong>
              </div>
            </div>
            <ol className="safety-layers">
              {safetyLayers.map((layer) => (
                <li key={layer.number}>
                  <span className="mono">{layer.number}</span>
                  <div><h3>{layer.title}</h3><p>{layer.body}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="safety-note">
            <LockKeyhole size={20} aria-hidden="true" />
            <p>
              Organisation verification is one layer of trust. Additional driver,
              vehicle, insurance, and safety requirements will depend on Liftie's
              final operating policies and applicable law.
            </p>
          </div>
        </div>
      </section>

      <section className="section matching-section" aria-labelledby="matching-heading">
        <div className="container">
          <SectionHeading
            id="matching-heading"
            eyebrow="Matching controls"
            title="Compatibility should respect personal boundaries."
            body={<p>Adjust the fictional controls below to see how route, organisation, safety, schedule, and seat preferences narrow a planned match set.</p>}
          />
          <PreferenceDemo />
        </div>
      </section>
    </>
  );
}
