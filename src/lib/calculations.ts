export const BASE_RATE = 1.5;

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const assertFiniteNonNegative = (value: number, label: string) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite, non-negative number.`);
  }
};

export function calculateTripPoints(distanceKm: number, ratePerKm = BASE_RATE) {
  assertFiniteNonNegative(distanceKm, "Distance");
  assertFiniteNonNegative(ratePerKm, "Rate");
  return roundMoney(distanceKm * ratePerKm);
}

export function calculateMonthlyRiderPoints(
  distanceKm: number,
  tripsPerMonth: number,
  ratePerKm = BASE_RATE,
) {
  assertFiniteNonNegative(tripsPerMonth, "Trips");
  return roundMoney(calculateTripPoints(distanceKm, ratePerKm) * tripsPerMonth);
}

export function calculateMonthlyDriverRecovery(
  distanceKm: number,
  tripsPerMonth: number,
  passengers: number,
  ratePerKm = BASE_RATE,
) {
  assertFiniteNonNegative(tripsPerMonth, "Trips");
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 7) {
    throw new RangeError("Passengers must be a whole number between 1 and 7.");
  }
  return roundMoney(
    calculateTripPoints(distanceKm, ratePerKm) * tripsPerMonth * passengers,
  );
}

export function calculateSavingPercentage(comparison: number, liftie: number) {
  assertFiniteNonNegative(comparison, "Comparison amount");
  assertFiniteNonNegative(liftie, "Liftie amount");
  if (comparison === 0) return 0;
  return Math.max(0, Math.round(((comparison - liftie) / comparison) * 100));
}

export const formatPoints = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

export const formatZar = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 2,
  }).format(value);
