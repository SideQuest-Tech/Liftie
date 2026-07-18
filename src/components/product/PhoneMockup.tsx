import {
  ArrowDownLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Route,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";

type PhoneMockupProps = {
  label: string;
  children: ReactNode;
};

export function PhoneMockup({ label, children }: PhoneMockupProps) {
  return (
    <div className="phone-shell" aria-label={`${label} product preview`}>
      <div className="phone-hardware">
        <span className="phone-speaker" />
      </div>
      <div className="phone-status">
        <span>07:42</span>
        <span>liftie preview</span>
      </div>
      <div className="phone-content">{children}</div>
    </div>
  );
}

export function OnboardingScreen() {
  return (
    <>
      <div className="phone-brand"><span>l</span> liftie</div>
      <div className="phone-copy">
        <span className="phone-step">ORGANISATION ACCESS</span>
        <h3>Start with where you belong.</h3>
        <p>Use your work or university email to check network eligibility.</p>
      </div>
      <div className="mock-field">
        <span>Official email</span>
        <strong>name@organisation...</strong>
        <Check size={16} aria-hidden="true" />
      </div>
      <div className="recognised-row">
        <Building2 size={18} aria-hidden="true" />
        <div><strong>Domain recognised</strong><span>Organisation access available</span></div>
        <ShieldCheck size={17} aria-hidden="true" />
      </div>
      <div className="phone-options" aria-label="Commute role selection preview">
        <span className="selected">Rider</span>
        <span>Driver</span>
        <span>Both</span>
      </div>
      <div className="mock-action">Continue <ChevronRight size={15} /></div>
    </>
  );
}

export function RoutineScreen() {
  return (
    <>
      <div className="phone-topline">
        <div><span>GOOD MORNING</span><strong>Your routine</strong></div>
        <CalendarDays size={20} aria-hidden="true" />
      </div>
      <div className="mini-route">
        <div className="mini-route-line" />
        <div className="mini-place">
          <MapPin size={16} /><span><small>From</small><strong>Sandton area</strong></span>
        </div>
        <div className="mini-place">
          <BriefcaseBusiness size={16} /><span><small>To</small><strong>Hatfield campus</strong></span>
        </div>
      </div>
      <div className="time-grid">
        <div><Clock3 size={15} /><span><small>Morning</small><strong>07:00</strong></span></div>
        <div><Clock3 size={15} /><span><small>Afternoon</small><strong>17:15</strong></span></div>
      </div>
      <div className="day-picker">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={`${day}-${index}`} className={index < 5 ? "active" : ""}>{day}</span>
        ))}
      </div>
      <div className="route-preview">
        <Route size={18} aria-hidden="true" />
        <div><strong>45 km corridor</strong><span>Recurring weekday route</span></div>
      </div>
    </>
  );
}

export function MatchScreen() {
  return (
    <>
      <div className="phone-topline">
        <div><span>SMART MATCH</span><strong>Corridor found</strong></div>
        <span className="mini-count">01</span>
      </div>
      <div className="phone-profile">
        <span className="profile-avatar">KM</span>
        <div><strong>K. Mokoena</strong><span><ShieldCheck size={13} /> Organisation verified</span></div>
        <span className="match-score">83%</span>
      </div>
      <div className="phone-route-card">
        <div><span className="start-dot" /><small>Start area</small><strong>Sandton</strong></div>
        <div><span className="end-dot" /><small>Destination</small><strong>Hatfield</strong></div>
      </div>
      <div className="phone-stat-grid">
        <div><small>Pickup detour</small><strong>2.4 km</strong></div>
        <div><small>Ride distance</small><strong>45 km</strong></div>
        <div><small>Points required</small><strong>67.5</strong></div>
        <div><small>Organisation</small><strong>Same</strong></div>
      </div>
      <div className="pending-banner"><Clock3 size={15} /> Driver reviewing match</div>
    </>
  );
}

export function WalletScreen() {
  return (
    <>
      <div className="phone-topline">
        <div><span>LIFTIE POINTS</span><strong>Your wallet</strong></div>
        <WalletCards size={20} aria-hidden="true" />
      </div>
      <div className="wallet-balance">
        <span>Available points</span>
        <strong>1,248.50</strong>
        <small>1 Point = R1.00</small>
      </div>
      <div className="reserved-row">
        <span className="reserved-icon"><Clock3 size={16} /></span>
        <div><strong>Reserved ride balance</strong><span>Next accepted journey</span></div>
        <strong>67.5</strong>
      </div>
      <div className="wallet-heading"><span>Recent activity</span><small>View all</small></div>
      <div className="transaction">
        <span className="transaction-icon"><ArrowDownLeft size={15} /></span>
        <div><strong>Completed journey</strong><span>Sandton to Hatfield</span></div>
        <strong>+67.5</strong>
      </div>
      <div className="recovery-row">
        <div><span>Driver cost-recovery balance</span><strong>540.00 Points</strong></div>
        <span>Withdrawal planned</span>
      </div>
    </>
  );
}
