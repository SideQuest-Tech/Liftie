import { ArrowRight } from "lucide-react";
import { AppPhone } from "../product/AppPhone";
import { SectionHeading } from "../ui/SectionHeading";

const walletSteps = [
  {
    number: "01",
    title: "Top up",
    body: "Riders add points through supported South African payment methods.",
  },
  {
    number: "02",
    title: "Points reserved",
    body: "When a journey is accepted, the required ride balance is reserved for that journey.",
  },
  {
    number: "03",
    title: "Journey completed",
    body: "After the journey is completed, the relevant points move to the driver's cost-recovery balance.",
  },
  {
    number: "04",
    title: "Driver credited",
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
          <div className="wallet-product">
            <AppPhone screen="wallet" />
            <p>Liftie wallet preview. Payment integrations are planned.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
