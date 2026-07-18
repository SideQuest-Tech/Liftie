import { CarFront, Fuel, Route, TrendingDown } from "lucide-react";
import {
  calculateSavingPercentage,
  formatPoints,
  formatZar,
} from "../../lib/calculations";
import { SectionHeading } from "../ui/SectionHeading";

const liftieRider = 2700;
const drivingAlone = 3800;
const ehailing = 11000;
const driverRecovery = 5400;

export function MonthlyComparison() {
  const ehalingSaving = calculateSavingPercentage(ehailing, liftieRider);
  const drivingSaving = calculateSavingPercentage(drivingAlone, liftieRider);

  return (
    <section className="section monthly-section" aria-labelledby="monthly-heading">
      <div className="container">
        <div className="monthly-heading-row">
          <SectionHeading
            id="monthly-heading"
            eyebrow="Monthly comparison"
            title="What one recurring commute could look like"
            body={<p>Illustrative 45 km weekday commute based on the Liftie project model.</p>}
          />
          <div className="monthly-route mono">
            <span>SANDTON</span><Route size={17} /><span>PRETORIA</span>
          </div>
        </div>
        <div className="comparison-bars">
          <div className="comparison-item driving">
            <div className="comparison-name"><Fuel size={19} /><div><span>Driving alone</span><small>Fuel and toll illustration</small></div></div>
            <div className="bar-track"><span style={{ width: `${(drivingAlone / ehailing) * 100}%` }} /></div>
            <strong>About {formatZar(drivingAlone)}</strong>
          </div>
          <div className="comparison-item ehailing">
            <div className="comparison-name"><CarFront size={19} /><div><span>Daily e-hailing</span><small>Illustrative monthly total</small></div></div>
            <div className="bar-track"><span style={{ width: "100%" }} /></div>
            <strong>About {formatZar(ehailing)}</strong>
          </div>
          <div className="comparison-item liftie">
            <div className="comparison-name"><Route size={19} /><div><span>Liftie rider</span><small>40 one-way trips</small></div></div>
            <div className="bar-track"><span style={{ width: `${(liftieRider / ehailing) * 100}%` }} /></div>
            <strong>{formatPoints(liftieRider)} Points</strong>
          </div>
        </div>
        <div className="comparison-summary">
          <div><TrendingDown size={22} /><span><strong>{ehalingSaving}% below</strong> the displayed e-hailing illustration</span></div>
          <div><TrendingDown size={22} /><span><strong>{drivingSaving}% below</strong> the displayed driving-alone illustration</span></div>
          <div className="driver-recovery-summary"><span>Driver with two passengers</span><strong>About {formatPoints(driverRecovery)} Points</strong><small>in monthly running-cost recovery</small></div>
        </div>
        <p className="comparison-footnote">
          Actual fuel use, tolls, e-hailing fares, working days, vehicle costs,
          and cost-sharing rates will vary.
        </p>
      </div>
    </section>
  );
}
