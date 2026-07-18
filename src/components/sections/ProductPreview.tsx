import { RotateCcw } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import {
  MatchScreen,
  OnboardingScreen,
  PhoneMockup,
  RoutineScreen,
  WalletScreen,
} from "../product/PhoneMockup";
import { SectionHeading } from "../ui/SectionHeading";

const screens = [
  {
    id: "onboarding",
    label: "Organisation access",
    title: "Begin inside a recognised network.",
    body: "An official employer or university email starts the organisation affiliation check. It is not presented as complete identity verification.",
    screen: <OnboardingScreen />,
  },
  {
    id: "routine",
    label: "Commute routine",
    title: "Describe the route once.",
    body: "Recurring areas, times, and weekdays shape the corridor without publishing an exact home address.",
    screen: <RoutineScreen />,
  },
  {
    id: "match",
    label: "Smart match",
    title: "Review compatibility before commitment.",
    body: "Distance, shared corridor, detour impact, points, and organisation status are visible before a driver accepts.",
    screen: <MatchScreen />,
  },
  {
    id: "wallet",
    label: "Points wallet",
    title: "Keep the cost sharing clear.",
    body: "The planned wallet separates available points, reserved ride balance, completed journeys, and driver cost recovery.",
    screen: <WalletScreen />,
  },
] as const;

export function ProductPreview() {
  const [active, setActive] = useState(0);
  const current = screens[active];

  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % screens.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + screens.length) % screens.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = screens.length - 1;
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
    <section className="section product-preview-section" aria-labelledby="preview-heading">
      <div className="container">
        <SectionHeading
          id="preview-heading"
          eyebrow="Product interface preview"
          title="Designed for a routine, not a once-off booking."
          body={<p>Explore four planned interface states. These screens are illustrative and are not connected to live users or payments.</p>}
        />
        <div className="product-preview">
          <div className="preview-copy">
            <div className="preview-tabs" role="tablist" aria-label="Product preview screens">
              {screens.map((screen, index) => (
                <button
                  key={screen.id}
                  id={`tab-${screen.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active === index}
                  aria-controls="product-preview-panel"
                  tabIndex={active === index ? 0 : -1}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => moveTab(event, index)}
                >
                  <span className="mono">0{index + 1}</span>
                  {screen.label}
                </button>
              ))}
            </div>
            <div
              id="product-preview-panel"
              role="tabpanel"
              aria-labelledby={`tab-${current.id}`}
              className="preview-description"
            >
              <span className="mono">SCREEN 0{active + 1} / 04</span>
              <h3>{current.title}</h3>
              <p>{current.body}</p>
              <button type="button" className="text-button" onClick={() => setActive(0)}>
                <RotateCcw size={15} /> Reset product preview
              </button>
            </div>
          </div>
          <div className="phone-stage">
            <div className="phone-route-backdrop" aria-hidden="true">
              <span /><span /><span />
              <svg viewBox="0 0 620 620">
                <path d="M40 495 C145 455 92 200 250 220 S377 482 580 370" />
              </svg>
            </div>
            <PhoneMockup label={current.label}>{current.screen}</PhoneMockup>
            <div className="stage-caption mono">
              <span>PRODUCT PREVIEW</span>
              <span>STATE 0{active + 1}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
