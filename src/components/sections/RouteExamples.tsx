import { ArrowRight, MapPin } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { commuteRoutes } from "../../data/routes";
import { formatPoints, formatZar } from "../../lib/calculations";
import { SectionHeading } from "../ui/SectionHeading";

export function RouteExamples() {
  const [active, setActive] = useState(1);
  const route = commuteRoutes[active];

  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % commuteRoutes.length;
    else if (event.key === "ArrowLeft") {
      next = (index - 1 + commuteRoutes.length) % commuteRoutes.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = commuteRoutes.length - 1;
    else return;

    event.preventDefault();
    setActive(next);
    const tabButtons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]',
      );
    tabButtons?.[next]?.focus();
  };

  return (
    <section className="section route-examples" aria-labelledby="route-examples-heading">
      <div className="container">
        <div className="routes-heading-row">
          <SectionHeading
            id="route-examples-heading"
            eyebrow="Real-world commute examples"
            title="See the cost-sharing model on familiar Gauteng corridors."
            body={<p>Choose a route to update the distance, points, and monthly weekday illustration. These are not live navigation quotes.</p>}
          />
          <span className="illustrative-badge">Illustrative routes</span>
        </div>
        <div className="route-selector" role="tablist" aria-label="Commute route examples">
          {commuteRoutes.map((item, index) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={active === index}
              aria-controls="route-example-panel"
              tabIndex={active === index ? 0 : -1}
              className={active === index ? "active" : ""}
              onClick={() => setActive(index)}
              onKeyDown={(event) => moveTab(event, index)}
            >
              <span className="mono">0{index + 1}</span>
              <span><strong>{item.from}</strong><small>to {item.to}</small></span>
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
        <div id="route-example-panel" className="route-example-panel" role="tabpanel" aria-live="polite">
          <div className="example-map">
            <div className="example-grid" aria-hidden="true" />
            <svg viewBox="0 0 760 280" preserveAspectRatio="none" aria-hidden="true">
              <path key={route.id} d="M44 220 C168 220 155 60 300 60 S410 228 530 180 S620 60 718 60" />
            </svg>
            <div className="example-place place-start"><MapPin size={16} /><span><small>START</small><strong>{route.from}</strong></span></div>
            <div className="example-place place-end"><MapPin size={16} /><span><small>DESTINATION</small><strong>{route.to}</strong></span></div>
          </div>
          <div className="example-metrics">
            <div><span>Approximate distance</span><strong>{route.distance} km</strong></div>
            <div><span>Starting cost per seat</span><strong>{formatPoints(route.points)} Points</strong></div>
            <div><span>Rand equivalent</span><strong>{formatZar(route.points)}</strong></div>
            <div className="metric-highlight"><span>40-trip monthly illustration</span><strong>{formatPoints(route.monthly)} Points</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
