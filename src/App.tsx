import { useCallback, useState } from "react";
import {
  JoinNetworkModal,
  type CommuteRole,
} from "./components/forms/JoinNetworkModal";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { AudienceSections } from "./components/sections/AudienceSections";
import { CommuteCalculator } from "./components/sections/CommuteCalculator";
import { FAQSection } from "./components/sections/FAQSection";
import { FinalCTA } from "./components/sections/FinalCTA";
import { Hero } from "./components/sections/Hero";
import { HowItWorks } from "./components/sections/HowItWorks";
import { LegalSection } from "./components/sections/LegalSection";
import { MonthlyComparison } from "./components/sections/MonthlyComparison";
import { OrganisationsSection } from "./components/sections/OrganisationsSection";
import { PricingPrinciples } from "./components/sections/PricingPrinciples";
import { ProductDistinction } from "./components/sections/ProductDistinction";
import { ProductPreview } from "./components/sections/ProductPreview";
import { RealityComparison } from "./components/sections/RealityComparison";
import { RouteExamples } from "./components/sections/RouteExamples";
import { SafetySection } from "./components/sections/SafetySection";
import { WalletSection } from "./components/sections/WalletSection";

export default function App() {
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinRole, setJoinRole] = useState<CommuteRole>("both");
  const [joinSession, setJoinSession] = useState(0);

  const openJoin = useCallback((role: CommuteRole = "both") => {
    setJoinRole(role);
    setJoinSession((session) => session + 1);
    setJoinOpen(true);
  }, []);

  const closeJoin = useCallback(() => setJoinOpen(false), []);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header onJoin={() => openJoin("both")} />
      <main id="main-content">
        <Hero onJoin={() => openJoin("both")} />
        <ProductDistinction />
        <RealityComparison />
        <HowItWorks />
        <ProductPreview />
        <AudienceSections onJoin={openJoin} />
        <SafetySection />
        <PricingPrinciples />
        <CommuteCalculator />
        <RouteExamples />
        <MonthlyComparison />
        <WalletSection />
        <OrganisationsSection />
        <LegalSection />
        <FAQSection />
        <FinalCTA onJoin={openJoin} />
      </main>
      <Footer />
      <JoinNetworkModal
        key={joinSession}
        open={joinOpen}
        onClose={closeJoin}
        initialRole={joinRole}
      />
    </>
  );
}
