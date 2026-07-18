import {
  Building2,
  CalendarClock,
  Coins,
  EyeOff,
  Fuel,
  Handshake,
  LockKeyhole,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  WalletCards,
} from "lucide-react";

export const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For riders", href: "#riders" },
  { label: "For drivers", href: "#drivers" },
  { label: "Safety", href: "#safety" },
  { label: "Pricing", href: "#pricing" },
  { label: "Organisations", href: "#organisations" },
  { label: "FAQ", href: "#faq" },
] as const;

export const distinctions = [
  {
    number: "01",
    title: "Not a taxi marketplace",
    body: "Liftie connects people around recurring journeys that are already happening. Drivers remain in control of their personal routes and schedules.",
  },
  {
    number: "02",
    title: "Not a public group chat",
    body: "Your phone number is not posted into an open social media group, and access begins with organisation email verification.",
  },
  {
    number: "03",
    title: "Not surge pricing",
    body: "Cost sharing is based on the journey and applicable pricing rules, not sudden demand spikes, rain, traffic, or peak-hour pressure.",
  },
] as const;

export const comparisonRows = [
  {
    label: "Access",
    informal: "Anyone with the group link can appear.",
    liftie: "Access begins with a recognised organisation email domain.",
  },
  {
    label: "Profile accountability",
    informal: "Names and profile details can be difficult to verify.",
    liftie: "Organisation affiliation is linked to a verified work or university email.",
  },
  {
    label: "Contact privacy",
    informal: "Personal phone numbers are commonly exposed in public groups.",
    liftie: "Matching happens inside the platform without publishing phone numbers.",
  },
  {
    label: "Payment",
    informal: "Cash and manual EFT arrangements create administration and risk.",
    liftie: "The product is designed around a cashless points wallet.",
  },
  {
    label: "Route control",
    informal: "Detours and collection arrangements are negotiated manually.",
    liftie: "Drivers define their detour limits before being matched.",
  },
  {
    label: "Driver consent",
    informal: "Group pressure can turn a request into an expectation.",
    liftie: "A journey is not confirmed until the driver accepts the match.",
  },
  {
    label: "Matching preferences",
    informal: "Limited privacy and filtering controls.",
    liftie: "Same-organisation and eligible women-only matching preferences are planned.",
  },
] as const;

export const journeySteps = [
  {
    number: "01",
    title: "Verify your organisation",
    body: "Sign up using your official employer or university email address. Liftie checks whether the domain belongs to an approved organisation.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Add your routine",
    body: "Tell Liftie where you usually start, where you are going, and when you normally travel.",
    icon: Route,
  },
  {
    number: "03",
    title: "Define your preferences",
    body: "Riders add their commute needs. Drivers set seat availability, detour limits, schedule, and matching preferences.",
    icon: SlidersHorizontal,
  },
  {
    number: "04",
    title: "Review the match",
    body: "When compatible routes overlap, both users receive a clear match summary. The driver reviews the pickup impact before making a decision.",
    icon: UserCheck,
  },
  {
    number: "05",
    title: "Confirm and travel",
    body: "After acceptance, the ride balance is reserved. The driver is credited only for the journey that is completed.",
    icon: Handshake,
  },
] as const;

export const riderBenefits = [
  {
    title: "Meaningful savings",
    body: "Share the cost of an existing journey from as little as R1.50 per kilometre, depending on the applicable vehicle and pricing method.",
    icon: Coins,
  },
  {
    title: "Organisation-based trust",
    body: "Begin with people connected to a recognised workplace or university domain.",
    icon: ShieldCheck,
  },
  {
    title: "Routine-based matching",
    body: "Add your normal commute once. Liftie searches for compatible recurring routes rather than making you negotiate a new lift every day.",
    icon: CalendarClock,
  },
  {
    title: "Clear cost before acceptance",
    body: "See the distance, points required, route, and pickup impact before a journey is confirmed.",
    icon: WalletCards,
  },
  {
    title: "Better privacy",
    body: "Do not publish your phone number into an open lift group.",
    icon: EyeOff,
  },
  {
    title: "Predictable commuting",
    body: "Build a repeatable routine around people travelling the same corridor.",
    icon: Route,
  },
] as const;

export const driverBenefits = [
  {
    title: "Driver accepts first",
    body: "A route match is only a suggestion until you review it and accept it.",
    icon: UserCheck,
  },
  {
    title: "Set your detour limit",
    body: "Choose how far you are willing to travel beyond your normal route. Matches outside that limit should never be presented as suitable.",
    icon: SlidersHorizontal,
  },
  {
    title: "Keep control of your schedule",
    body: "Mark yourself unavailable when plans change. Passengers receive an update without you coordinating an entire group chat.",
    icon: CalendarClock,
  },
  {
    title: "No manual payment administration",
    body: "The wallet records accepted and completed journeys, reducing manual EFT calculations and refund conversations.",
    icon: WalletCards,
  },
  {
    title: "Credit only completed journeys",
    body: "The driver should receive cost-recovery points based on journeys that were actually completed.",
    icon: Fuel,
  },
  {
    title: "Choose matching boundaries",
    body: "Use organisation and eligible safety preference controls to narrow who can discover or request a match.",
    icon: LockKeyhole,
  },
] as const;

export const safetyLayers = [
  {
    number: "01",
    title: "Organisation access",
    body: "Users begin with an approved employer or university email domain.",
  },
  {
    number: "02",
    title: "Private route matching",
    body: "Commute routines are used for compatibility without publishing personal routes into public group chats.",
  },
  {
    number: "03",
    title: "Driver consent",
    body: "The driver reviews the proposed match and keeps final acceptance control.",
  },
  {
    number: "04",
    title: "Preference controls",
    body: "Same-organisation matching, eligible women-only matching, detour limits, schedules, and seats shape each result.",
  },
  {
    number: "05",
    title: "Cashless design",
    body: "No physical cash needs to change hands inside the vehicle.",
  },
  {
    number: "06",
    title: "Recorded journey activity",
    body: "Accepted matches, points movements, and journey states are recorded inside the platform design.",
  },
] as const;
