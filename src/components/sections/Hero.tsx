import { ArrowDown, MailCheck } from "lucide-react";
import { Button } from "../ui/Button";

type HeroProps = {
  onJoin: () => void;
};

export function Hero({ onJoin }: HeroProps) {
  return (
    <section id="top" className="hero">
      <div className="hero-photo" aria-hidden="true" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>Your daily commute, <span>co-funded.</span></h1>
          <p className="hero-lede">
            Match with organisation-verified colleagues and campus peers already
            travelling your corridor. Share the cost of a comfortable daily
            journey from as little as R1.50 per kilometre, with predictable
            pricing and no public phone numbers.
          </p>
          <div className="hero-actions">
            <Button onClick={onJoin} arrow>Join the network</Button>
            <a className="button button-secondary" href="#how-it-works">
              <span>See how Liftie works</span>
              <ArrowDown size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-trust">
            <MailCheck size={18} aria-hidden="true" />
            <p>
              Verify your official organisation email to begin. No ID upload is
              required for initial organisation verification.
            </p>
          </div>
        </div>
      </div>
      <div className="hero-scroll-cue" aria-hidden="true">
        <span>Explore the corridor</span>
        <span className="scroll-line" />
      </div>
    </section>
  );
}
