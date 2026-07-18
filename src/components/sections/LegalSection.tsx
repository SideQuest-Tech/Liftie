import { ChevronDown, FileCheck2, Scale } from "lucide-react";
import { useState } from "react";

export function LegalSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className="section legal-section" aria-labelledby="legal-heading">
      <div className="container legal-grid">
        <div className="legal-heading">
          <span className="legal-icon"><Scale /></span>
          <p className="eyebrow">Legal and operating model</p>
          <h2 id="legal-heading">Built around responsible cost sharing.</h2>
        </div>
        <div className="legal-copy">
          <p>
            Liftie is being designed as a non-commercial commute-sharing network
            rather than an on-demand taxi marketplace. South African transport law
            recognises qualifying lift clubs and provides an operating-licence
            exemption subject to the conditions and requirements that apply to
            those arrangements.
          </p>
          <p>
            Liftie's final driver rules, participation model, insurance
            requirements, pricing method, documentation, payment structure, and
            operational policies must remain aligned with applicable South African
            law and professional legal advice.
          </p>
          <div className={`legal-disclosure ${open ? "is-open" : ""}`}>
            <h3>
              <button type="button" aria-expanded={open} aria-controls="lift-club-explanation" onClick={() => setOpen((value) => !value)}>
                <span><FileCheck2 size={18} /> Understanding the lift-club model</span>
                <ChevronDown aria-hidden="true" />
              </button>
            </h3>
            {open && (
              <div id="lift-club-explanation">
                <ul>
                  <li>Liftie connects recurring commuters.</li>
                  <li>Drivers retain control over their routes and acceptance decisions.</li>
                  <li>The intention is vehicle cost recovery rather than commercial driving profit.</li>
                  <li>Applicable requirements may include documentation, registration, insurance, passenger safeguards, and other regulatory conditions.</li>
                  <li>Product terms may change as legal and operational guidance is finalised.</li>
                </ul>
              </div>
            )}
          </div>
          <p className="legal-disclaimer">
            Website information is general product information and does not
            constitute legal, tax, insurance, or financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
