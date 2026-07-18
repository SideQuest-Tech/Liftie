import { faqs } from "../../data/faq";
import { Accordion } from "../ui/Accordion";
import { SectionHeading } from "../ui/SectionHeading";

export function FAQSection() {
  return (
    <section id="faq" className="section faq-section" aria-labelledby="faq-heading">
      <div className="container faq-grid">
        <div className="faq-intro">
          <SectionHeading
            id="faq-heading"
            eyebrow="Frequently asked questions"
            title="Clear answers before you add your route."
            body={<p>Liftie is building its initial network and finalising its operating policies. These answers distinguish the planned product from claims that have not yet been established.</p>}
          />
          <div className="faq-index mono">
            <span>13 QUESTIONS</span>
            <span>PRODUCT, SAFETY, PRICING</span>
          </div>
        </div>
        <Accordion items={faqs} />
      </div>
    </section>
  );
}
