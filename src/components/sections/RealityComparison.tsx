import { Check, Minus } from "lucide-react";
import { comparisonRows } from "../../data/content";
import { SectionHeading } from "../ui/SectionHeading";

export function RealityComparison() {
  return (
    <section className="section reality-section" aria-labelledby="reality-heading">
      <div className="container">
        <div className="reality-intro">
          <SectionHeading
            id="reality-heading"
            eyebrow="From public group to private corridor"
            title="Your lift should not begin with a risky group chat."
            body={
              <>
                <p>
                  Many commuters use public WhatsApp groups, Facebook posts, and
                  TikTok comments to find lifts. The convenience is understandable,
                  but public contact details, unknown profiles, cash payments, and
                  unstructured arrangements create unnecessary risk.
                </p>
                <p>
                  Liftie brings those arrangements into a private, organisation-based
                  system with controlled matching, cashless cost sharing, and clear
                  driver decisions.
                </p>
              </>
            }
          />
          <div className="comparison-key" aria-hidden="true">
            <span><Minus /> Informal arrangement</span>
            <span><Check /> Liftie product design</span>
          </div>
        </div>

        <div className="comparison-table" role="table" aria-label="Informal social media lifts compared with Liftie">
          <div className="comparison-header" role="row">
            <div role="columnheader">Control point</div>
            <div role="columnheader"><Minus size={16} /> Informal social media lifts</div>
            <div role="columnheader"><Check size={16} /> Liftie</div>
          </div>
          {comparisonRows.map((row, index) => (
            <div className="comparison-row" role="row" key={row.label}>
              <div role="rowheader"><span className="mono">0{index + 1}</span>{row.label}</div>
              <div role="cell"><span className="mobile-comparison-label">Informal lift</span>{row.informal}</div>
              <div role="cell"><span className="mobile-comparison-label">Liftie</span>{row.liftie}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
