import { journeySteps } from "../../data/content";
import { SectionHeading } from "../ui/SectionHeading";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section how-section" aria-labelledby="how-heading">
      <div className="container">
        <SectionHeading
          id="how-heading"
          eyebrow="How Liftie works"
          title="One routine. One verified corridor. Better daily travel."
          body={<p>Five clear decisions turn a repeated route into a controlled lift-club arrangement.</p>}
        />
        <div className="journey">
          <div className="journey-route" aria-hidden="true">
            <svg viewBox="0 0 240 720" preserveAspectRatio="none">
              <path d="M120 10 C30 100 210 185 120 280 C30 370 210 470 120 560 C60 625 145 665 120 710" />
            </svg>
          </div>
          <div className="journey-visual" aria-hidden="true">
            <span className="journey-kicker mono">THE VERIFIED CORRIDOR</span>
            <div className="journey-core">
              <span className="core-ring ring-one" />
              <span className="core-ring ring-two" />
              <span className="core-ring ring-three" />
              <div><strong>5</strong><span>controlled stages</span></div>
            </div>
            <div className="journey-coordinates">
              <span>26.1076° S</span>
              <span>28.0567° E</span>
            </div>
          </div>
          <ol className="journey-steps">
            {journeySteps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.number}>
                  <span className="step-node"><Icon size={18} /></span>
                  <div className="step-copy">
                    <span className="mono">STAGE {step.number}</span>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
