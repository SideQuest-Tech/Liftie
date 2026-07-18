import { Calculator, CarFront, RotateCcw, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import {
  BASE_RATE,
  calculateMonthlyDriverRecovery,
  calculateMonthlyRiderPoints,
  calculateTripPoints,
  formatPoints,
} from "../../lib/calculations";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

type CalculatorMode = "rider" | "driver";

const defaults = {
  distance: "45",
  trips: "40",
  passengers: "2",
  mode: "rider" as CalculatorMode,
};

export function CommuteCalculator() {
  const [distance, setDistance] = useState(defaults.distance);
  const [trips, setTrips] = useState(defaults.trips);
  const [passengers, setPassengers] = useState(defaults.passengers);
  const [mode, setMode] = useState<CalculatorMode>(defaults.mode);

  const result = useMemo(() => {
    const distanceValue = Number(distance);
    const tripsValue = Number(trips);
    const passengerValue = Number(passengers);

    if (!distance || !trips || (mode === "driver" && !passengers)) {
      return { error: "Enter the commute details to see an illustration." };
    }
    if (!Number.isFinite(distanceValue) || distanceValue < 1 || distanceValue > 250) {
      return { error: "Distance must be between 1 and 250 km." };
    }
    if (!Number.isInteger(tripsValue) || tripsValue < 1 || tripsValue > 62) {
      return { error: "Monthly trips must be a whole number between 1 and 62." };
    }
    if (
      mode === "driver" &&
      (!Number.isInteger(passengerValue) || passengerValue < 1 || passengerValue > 7)
    ) {
      return { error: "Passengers must be a whole number between 1 and 7." };
    }

    const perTrip = calculateTripPoints(distanceValue);
    const monthly =
      mode === "rider"
        ? calculateMonthlyRiderPoints(distanceValue, tripsValue)
        : calculateMonthlyDriverRecovery(
            distanceValue,
            tripsValue,
            passengerValue,
          );
    return { perTrip, monthly, distanceValue, tripsValue, passengerValue };
  }, [distance, mode, passengers, trips]);

  const reset = () => {
    setDistance(defaults.distance);
    setTrips(defaults.trips);
    setPassengers(defaults.passengers);
    setMode(defaults.mode);
  };

  return (
    <section className="section calculator-section" aria-labelledby="calculator-heading">
      <div className="container">
        <SectionHeading
          id="calculator-heading"
          eyebrow="Commute calculator"
          title="Put your routine into points."
          body={<p>Use your usual one-way distance and monthly trip count. The result updates from the same starting rate used throughout this product illustration.</p>}
        />
        <div className="calculator-shell">
          <div className="calculator-inputs">
            <div className="calculator-title">
              <Calculator size={20} aria-hidden="true" />
              <span>Illustrative calculator</span>
            </div>
            <fieldset className="mode-picker">
              <legend>Calculate as</legend>
              <button
                type="button"
                className={mode === "rider" ? "active" : ""}
                aria-pressed={mode === "rider"}
                onClick={() => setMode("rider")}
              >
                <UserRound size={17} /> Rider
              </button>
              <button
                type="button"
                className={mode === "driver" ? "active" : ""}
                aria-pressed={mode === "driver"}
                onClick={() => setMode("driver")}
              >
                <CarFront size={17} /> Driver
              </button>
            </fieldset>
            <label className="calculator-field">
              <span>One-way commute distance</span>
              <div><input type="number" min="1" max="250" step="0.5" value={distance} onChange={(event) => setDistance(event.target.value)} /><span>km</span></div>
            </label>
            <label className="calculator-field">
              <span>One-way trips per month</span>
              <div><input type="number" min="1" max="62" step="1" value={trips} onChange={(event) => setTrips(event.target.value)} /><span>trips</span></div>
            </label>
            {mode === "driver" && (
              <label className="calculator-field">
                <span>Passengers per journey</span>
                <div><input type="number" min="1" max="7" step="1" value={passengers} onChange={(event) => setPassengers(event.target.value)} /><span>people</span></div>
              </label>
            )}
            <Button variant="quiet" onClick={reset}><RotateCcw size={16} /> Reset calculator</Button>
          </div>

          <div className="calculator-result" aria-live="polite">
            <div className="result-grid-texture" aria-hidden="true" />
            {"error" in result ? (
              <div className="calculator-empty">
                <span className="result-icon"><Calculator /></span>
                <p>{result.error}</p>
              </div>
            ) : (
              <>
                <div className="calculation-label">
                  <span className="mono">{mode === "rider" ? "RIDER COST SHARING" : "DRIVER COST RECOVERY"}</span>
                  {mode === "driver" && <span><Users size={15} /> {result.passengerValue} passengers</span>}
                </div>
                <div className="per-trip">
                  <span>Per one-way journey</span>
                  <strong>{formatPoints(result.perTrip)} <small>Points</small></strong>
                  <p>{result.distanceValue} km × R{BASE_RATE.toFixed(2)}</p>
                </div>
                <div className="monthly-result">
                  <span>{mode === "rider" ? "Estimated monthly points required" : "Estimated monthly running-cost recovery"}</span>
                  <strong>{formatPoints(result.monthly)} <small>Points</small></strong>
                  <p>
                    {formatPoints(result.perTrip)} × {result.tripsValue}
                    {mode === "driver" ? ` × ${result.passengerValue}` : ""}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="calculator-disclaimer">
          Illustrative estimate based on a starting rate of R1.50 per kilometre.
          Actual cost-sharing rates may vary according to the final pricing method,
          vehicle information, route details, product terms, and applicable legal
          or tax requirements.
        </p>
      </div>
    </section>
  );
}
