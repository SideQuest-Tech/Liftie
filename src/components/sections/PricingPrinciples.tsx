import { CloudRain, Eye, Gauge } from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";

const principles = [
  {
    icon: Gauge,
    number: "01",
    title: "No peak-demand increase",
    body: "The cost-sharing rate should not rise simply because more people need transport.",
  },
  {
    icon: CloudRain,
    number: "02",
    title: "No weather premium",
    body: "A sudden downpour should not double the cost of getting home.",
  },
  {
    icon: Eye,
    number: "03",
    title: "Clear before confirmation",
    body: "Riders should see the expected points requirement before accepting a journey.",
  },
] as const;

export function PricingPrinciples() {
  return (
    <section id="pricing" className="section pricing-principles" aria-labelledby="pricing-heading">
      <div className="container">
        <div className="pricing-heading-row">
          <SectionHeading
            id="pricing-heading"
            eyebrow="Fair and fixed cost sharing"
            title="Fixed cost sharing. No surge."
            body={<p>Traffic, rain, and peak-hour demand do not change the distance between your home and destination. Liftie is designed around predictable journey-based cost sharing rather than demand-based price spikes.</p>}
          />
          <div className="rate-display">
            <span className="mono">STARTING ILLUSTRATION</span>
            <strong>R1.50</strong>
            <span>per kilometre</span>
          </div>
        </div>
        <div className="pricing-statements">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <article key={principle.number}>
                <div className="pricing-statement-top">
                  <span className="mono">{principle.number}</span>
                  <Icon aria-hidden="true" />
                </div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            );
          })}
        </div>
        <p className="pricing-caveat">
          Rates may be updated when pricing rules, vehicle costs, legal
          requirements, or product terms change. They should not surge during a
          particular commute merely because demand rises.
        </p>
      </div>
    </section>
  );
}
