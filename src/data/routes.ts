export type CommuteRoute = {
  id: string;
  from: string;
  to: string;
  distance: number;
  points: number;
  monthly: number;
};

export const commuteRoutes: CommuteRoute[] = [
  {
    id: "midrand-pretoria",
    from: "Midrand",
    to: "Pretoria Central",
    distance: 35,
    points: 52.5,
    monthly: 2100,
  },
  {
    id: "sandton-hatfield",
    from: "Sandton",
    to: "Hatfield Campus",
    distance: 45,
    points: 67.5,
    monthly: 2700,
  },
  {
    id: "johannesburg-pretoria",
    from: "Johannesburg CBD",
    to: "Pretoria Central",
    distance: 60,
    points: 90,
    monthly: 3600,
  },
];
