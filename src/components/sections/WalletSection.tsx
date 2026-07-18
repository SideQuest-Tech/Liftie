import {
  ArrowDownLeft,
  ArrowRight,
  Check,
  Landmark,
  LockKeyhole,
  WalletCards,
} from "lucide-react";
import { SectionHeading } from "../ui/SectionHeading";

const walletSteps = [
  {
    number: "01",
    title: "Top up",
    body: "Riders add points through supported South African payment methods.",
  },
  {
    number: "02",
    title: "Reserve",
    body: "When a journey is accepted, the required ride balance is reserved for that journey.",
  },
  {
    number: "03",
    title: "Complete",
    body: "After the journey is completed, the relevant points move to the driver's cost-recovery balance.",
  },
  {
    number: "04",
    title: "Withdraw",
    body: "Drivers will be able to request withdrawal into a supported South African bank account, subject to product terms and verification requirements.",
  },
] as const;

export function WalletSection() {
  return (
    <section className="section wallet-section" aria-labelledby="wallet-heading">
      <div className="container">
        <div className="wallet-heading-row">
          <SectionHeading
            id="wallet-heading"
            eyebrow="Cashless points wallet"
            title="No cash in the car. No payment calculations in the group chat."
            body={<p>The planned wallet gives every accepted journey a visible balance state, from rider top-up through completed driver cost recovery.</p>}
          />
          <div className="point-value">
            <span className="mono">PLANNED UNIT OF ACCOUNT</span>
            <strong>1 Point = R1.00</strong>
            <small>Liftie Points are not cryptocurrency or an investment.</small>
          </div>
        </div>
        <div className="wallet-experience">
          <ol className="wallet-steps">
            {walletSteps.map((step, index) => (
              <li key={step.number}>
                <span className="wallet-step-number">{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.body}</p></div>
                {index < walletSteps.length - 1 && <ArrowRight aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <div className="wallet-interface">
            <div className="wallet-interface-top">
              <div><span className="mono">WALLET PREVIEW</span><strong>Reserved ride balance</strong></div>
              <WalletCards aria-hidden="true" />
            </div>
            <div className="wallet-total">
              <span>Available points</span>
              <strong>1,248.50</strong>
              <small>Planned point balance</small>
            </div>
            <div className="wallet-reserved">
              <LockKeyhole size={18} />
              <div><strong>67.5 Points reserved</strong><span>Sandton to Hatfield, next weekday journey</span></div>
              <span>Reserved</span>
            </div>
            <div className="wallet-ledger">
              <div>
                <span className="ledger-icon complete"><Check size={15} /></span>
                <div><strong>Journey completed</strong><span>Previous corridor trip</span></div>
                <strong>-67.5</strong>
              </div>
              <div>
                <span className="ledger-icon"><ArrowDownLeft size={15} /></span>
                <div><strong>Driver cost recovery</strong><span>Completed journey credit</span></div>
                <strong>+67.5</strong>
              </div>
            </div>
            <div className="wallet-local-options">
              <Landmark size={18} />
              <p><strong>Planned support for local payment options</strong><span>Card, Instant EFT, and Capitec Pay are examples under consideration, not active integrations.</span></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
