type AppPreviewScreen = {
  alt: string;
  description: string;
  id: string;
  image: string;
  label: string;
  title: string;
};

export const appScreens = [
  {
    id: "daily-request",
    label: "Daily request",
    title: "Request a daily lift",
    description:
      "Choose your pickup, destination, travel window, and preferred vehicle tier.",
    image: "/images/liftie-app/request-daily.png",
    alt: "Liftie daily lift request screen",
  },
  {
    id: "weekly-commute",
    label: "Weekly commute",
    title: "Plan your weekly commute",
    description:
      "Set your recurring work or campus schedule once and let Liftie match your routine.",
    image: "/images/liftie-app/request-weekly.png",
    alt: "Liftie weekly commute setup screen",
  },
  {
    id: "driver-management",
    label: "Driver management",
    title: "Stay in control as a driver",
    description:
      "Review your route, available seats, and incoming rider requests before accepting anyone.",
    image: "/images/liftie-app/driver-lift-management.png",
    alt: "Liftie driver lift management screen",
  },
  {
    id: "commute-groups",
    label: "Commute groups",
    title: "Create trusted commute groups",
    description:
      "Create or join private groups for colleagues, classmates, and regular commute partners.",
    image: "/images/liftie-app/groups.png",
    alt: "Liftie private commute groups screen",
  },
  {
    id: "wallet",
    label: "Wallet",
    title: "Manage payments safely",
    description:
      "Top up, withdraw, request refunds, and follow every transaction without carrying cash.",
    image: "/images/liftie-app/wallet.png",
    alt: "Liftie cashless wallet screen",
  },
  {
    id: "profile-overview",
    label: "Profile overview",
    title: "Your verified Liftie identity",
    description:
      "Manage your account, rides, conversations, preferences, and driver application.",
    image: "/images/liftie-app/profile-overview.png",
    alt: "Liftie rider profile overview",
  },
  {
    id: "profile-options",
    label: "Profile options",
    title: "Everything in one place",
    description:
      "Access your rides, messages, privacy settings, personal details, and driver onboarding.",
    image: "/images/liftie-app/profile-options.png",
    alt: "Liftie profile management options",
  },
  {
    id: "vehicle-registered",
    label: "Vehicle registered",
    title: "Ready to offer lifts",
    description:
      "Once a vehicle is registered, verified drivers can start posting available lifts.",
    image: "/images/liftie-app/vehicle-registered.png",
    alt: "Liftie vehicle registration confirmation screen",
  },
 ] as const satisfies readonly AppPreviewScreen[];

