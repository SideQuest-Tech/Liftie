import { Building2, Clock3, Route, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

export function PreferenceDemo() {
  const [sameOrganisation, setSameOrganisation] = useState(false);
  const [womenOnly, setWomenOnly] = useState(false);
  const [detour, setDetour] = useState(5);
  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(true);
  const [seats, setSeats] = useState(2);

  const matchCount = useMemo(() => {
    let count = 12;
    if (sameOrganisation) count = 4;
    if (womenOnly) count = Math.min(count, 3);
    if (detour <= 3) count = Math.min(count, 2);
    if (!morning && !afternoon) return 0;
    if (!morning || !afternoon) count = Math.max(1, count - 1);
    if (seats > 3) count = Math.max(1, count - 1);
    return count;
  }, [sameOrganisation, womenOnly, detour, morning, afternoon, seats]);

  const summary =
    matchCount === 0
      ? "Select a travel time to see possible matches"
      : detour <= 3
        ? `${matchCount} matches within a ${detour} km detour`
        : sameOrganisation
          ? `${matchCount} same-organisation matches`
          : `${matchCount} possible corridor matches`;

  return (
    <div className="preference-demo">
      <div className="preference-controls">
        <div className="control-heading">
          <span className="eyebrow">Interactive product preview</span>
          <h3>Set the boundaries before anyone is matched.</h3>
        </div>
        <Toggle
          label="Same organisation only"
          description="Limit discovery to your approved organisation."
          icon={<Building2 size={18} />}
          checked={sameOrganisation}
          onChange={setSameOrganisation}
        />
        <Toggle
          label="Women-only matching"
          description="Planned eligible safety preference for verified women."
          icon={<ShieldCheck size={18} />}
          checked={womenOnly}
          onChange={setWomenOnly}
        />
        <div className="range-control">
          <div>
            <span><Route size={18} /> Maximum pickup detour</span>
            <strong>{detour} km</strong>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={detour}
            aria-label="Maximum pickup detour in kilometres"
            onChange={(event) => setDetour(Number(event.target.value))}
          />
          <div className="range-labels"><span>1 km</span><span>10 km</span></div>
        </div>
        <fieldset className="availability-control">
          <legend><Clock3 size={18} /> Availability</legend>
          <label><input type="checkbox" checked={morning} onChange={(event) => setMorning(event.target.checked)} /> Morning</label>
          <label><input type="checkbox" checked={afternoon} onChange={(event) => setAfternoon(event.target.checked)} /> Afternoon</label>
        </fieldset>
        <div className="stepper-control">
          <span><Users size={18} /> Available seats</span>
          <div>
            <button type="button" onClick={() => setSeats((value) => Math.max(1, value - 1))} aria-label="Remove an available seat">−</button>
            <strong>{seats}</strong>
            <button type="button" onClick={() => setSeats((value) => Math.min(6, value + 1))} aria-label="Add an available seat">+</button>
          </div>
        </div>
      </div>
      <div className="preference-result" aria-live="polite">
        <div className="result-orbit" aria-hidden="true">
          <span /><span /><span /><span /><span />
          <div className="orbit-core"><Route /></div>
        </div>
        <div className="result-copy">
          <span className="mono">MATCH PREVIEW</span>
          <strong>{summary}</strong>
          <p>
            {sameOrganisation ? "Organisation boundary applied. " : ""}
            {womenOnly ? "Eligible safety preference applied. " : ""}
            Results remain fictional and are not connected to live commuters.
          </p>
        </div>
        <div className="result-tags">
          <span>{detour} km maximum detour</span>
          <span>{seats} {seats === 1 ? "seat" : "seats"}</span>
          <span>{morning && afternoon ? "Morning and afternoon" : morning ? "Morning" : afternoon ? "Afternoon" : "No time selected"}</span>
        </div>
      </div>
    </div>
  );
}

type ToggleProps = {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function Toggle({ label, description, icon, checked, onChange }: ToggleProps) {
  return (
    <label className="toggle-control">
      <span className="toggle-icon" aria-hidden="true">{icon}</span>
      <span className="toggle-copy"><strong>{label}</strong><small>{description}</small></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="switch" aria-hidden="true"><span /></span>
    </label>
  );
}
