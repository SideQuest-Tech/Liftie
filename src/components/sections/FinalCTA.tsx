import { ArrowRight, Building2, Check } from "lucide-react";
import type { CommuteRole } from "../forms/JoinNetworkModal";
import { Button } from "../ui/Button";

type FinalCTAProps = {
  onJoin: (role: CommuteRole) => void;
};

export function FinalCTA({ onJoin }: FinalCTAProps) {
  return (
    <section className="final-cta" aria-labelledby="final-cta-heading">
      <div className="final-route" aria-hidden="true">
        <svg viewBox="0 0 1400 500" preserveAspectRatio="none">
          <path className="final-rider" d="M0 390 C240 390 310 110 600 215 S890 360 1120 180" />
          <path className="final-driver" d="M0 80 C250 80 310 310 600 215 S890 72 1120 180" />
          <path className="final-confirmed" d="M1120 180 C1220 150 1280 155 1400 155" />
        </svg>
        <span className="final-match-node"><Check /></span>
      </div>
      <div className="container final-cta-inner">
        <p className="eyebrow">The verified corridor</p>
        <h2 id="final-cta-heading">Your route is already happening. Find the people travelling it with you.</h2>
        <p>Join the Liftie network as a rider, driver, or both. Add your routine and help build a safer, more predictable way to commute.</p>
        <div className="final-actions">
          <Button onClick={() => onJoin("both")} arrow>Join the network</Button>
          <a className="button button-secondary" href="#organisations">
            <Building2 size={17} />
            <span>Request organisation access</span>
            <ArrowRight size={17} />
          </a>
        </div>
        <div className="final-labels mono">
          <span>RIDER ROUTE</span><span>DRIVER ROUTE</span><span>CONFIRMED CORRIDOR</span>
        </div>
      </div>
    </section>
  );
}
