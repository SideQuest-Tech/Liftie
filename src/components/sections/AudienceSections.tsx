import { ArrowDown, ArrowRight, CarFront, UserRound } from "lucide-react";
import { driverBenefits, riderBenefits } from "../../data/content";
import type { CommuteRole } from "../forms/JoinNetworkModal";
import { Button } from "../ui/Button";
import { AppPhone } from "../product/AppPhone";

type AudienceSectionsProps = {
  onJoin: (role: CommuteRole) => void;
};

export function AudienceSections({ onJoin }: AudienceSectionsProps) {
  return (
    <div className="audience-wrap">
      <section id="riders" className="section audience-section rider-section" aria-labelledby="rider-heading">
        <div className="container audience-grid">
          <div className="audience-intro">
            <span className="audience-icon"><UserRound /></span>
            <p className="eyebrow">For riders</p>
            <h2 id="rider-heading">A more dignified way to get to work or campus.</h2>
            <p>
              Daily transport should not force you to choose between an
              unaffordable e-hailing trip and an exhausting, unpredictable
              commute. Liftie helps you find organisation-verified people already
              travelling your corridor.
            </p>
            <Button onClick={() => onJoin("rider")} arrow>Join as a rider</Button>
            <a href="#drivers" className="audience-jump">
              Also drive your route? See the driver model <ArrowDown size={15} />
            </a>
          </div>
          <div className="audience-benefits">
            <div className="audience-product"><AppPhone screen="weekly-commute" /></div>
            {riderBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title}>
                  <span className="benefit-number mono">0{index + 1}</span>
                  <Icon size={20} aria-hidden="true" />
                  <div><h3>{benefit.title}</h3><p>{benefit.body}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="drivers" className="section audience-section driver-section" aria-labelledby="driver-heading">
        <div className="driver-route-motif" aria-hidden="true">
          <svg viewBox="0 0 1500 420" preserveAspectRatio="none">
            <path d="M0 315 C300 315 355 82 690 82 S1020 318 1500 220" />
          </svg>
        </div>
        <div className="container audience-grid">
          <div className="audience-intro">
            <span className="audience-icon"><CarFront /></span>
            <p className="eyebrow">For drivers</p>
            <h2 id="driver-heading">Turn empty seats into fuel money, on your terms.</h2>
            <p>
              You are already making the journey. Liftie helps you recover part
              of your legitimate running costs without turning your commute into
              a second job.
            </p>
            <Button onClick={() => onJoin("driver")} arrow>Join as a driver</Button>
            <div className="driver-control-note">
              <span className="control-line" />
              <p><strong>Driver decision:</strong> a route suggestion is never a confirmed journey until you accept it.</p>
            </div>
          </div>
          <div className="audience-benefits driver-benefits">
            <div className="audience-product"><AppPhone screen="driver-management" /></div>
            {driverBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.title}>
                  <span className="benefit-number mono">0{index + 1}</span>
                  <Icon size={20} aria-hidden="true" />
                  <div><h3>{benefit.title}</h3><p>{benefit.body}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="audience-switch container" aria-label="Audience section shortcuts">
        <a href="#riders"><UserRound size={16} /> Rider view</a>
        <span aria-hidden="true"><ArrowRight size={15} /></span>
        <a href="#drivers"><CarFront size={16} /> Driver view</a>
      </div>
    </div>
  );
}
