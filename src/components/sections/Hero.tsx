import { ChevronRight, ShieldCheck } from "lucide-react";
import { AppPhone } from "../product/AppPhone";
import { Button } from "../ui/Button";

type HeroProps = {
  onJoin: () => void;
};

export function Hero({ onJoin }: HeroProps) {
  return (
    <section id="top" className="commute-hero" aria-labelledby="hero-heading">
      <div className="commute-hero-inner">
        <div className="commute-hero-copy">
          <p className="eyebrow">Commute better, together</p>
          <h1 id="hero-heading">Your daily<br />commute,<br /><span>co-funded.</span></h1>
          <p className="commute-hero-lede">Share the journey with verified colleagues and campus peers already heading your way, from R1.50 per kilometre.</p>
          <div className="hero-actions">
            <Button onClick={onJoin} arrow>Find my route</Button>
            <a className="hero-how-link" href="#how-it-works">How Liftie works <ChevronRight size={20} aria-hidden="true" /></a>
          </div>
          <div className="commute-hero-trust">
            <ShieldCheck size={28} strokeWidth={1.4} aria-hidden="true" />
            <p>Verified with your organisation email.<br />No ID upload required.</p>
          </div>
        </div>
        <div className="commute-scene">
          <svg className="road-arch" viewBox="0 0 900 650" aria-hidden="true">
            <path className="road-surface" d="M45 650V450a405 405 0 0 1 810 0v200" />
            <path className="road-markings" d="M45 650V450a405 405 0 0 1 810 0v200" />
          </svg>
          <div className="commuter-window">
            <img src="/liftie-hero-commute.jpg" width={1536} height={1024} fetchPriority="high" alt="Four colleagues sharing a morning commute, with a woman driving on the right-hand side." />
          </div>
          <div className="hero-phone-wrap"><AppPhone screen="daily-request" priority /></div>
          <span className="verification-capsule"><ShieldCheck size={18} strokeWidth={1.5} aria-hidden="true" />Organisation verified</span>
        </div>
        <svg className="commute-route" viewBox="0 0 1440 210" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M280 20C400 105 466 64 604 104S780 113 900 166S1040 165 1120 100S1220 60 1290 40" />
          <circle cx="1290" cy="40" r="12" />
        </svg>
      </div>
      <div className="commute-ticker" aria-label="Work, campus, home. Same route.">
        <span>Work</span><i aria-hidden="true" /><span>Campus</span><i aria-hidden="true" /><span>Home</span><i aria-hidden="true" /><span>Same route</span>
      </div>
    </section>
  );
}
