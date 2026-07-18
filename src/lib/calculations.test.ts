import { describe, expect, it } from "vitest";
import {
  calculateMonthlyDriverRecovery,
  calculateMonthlyRiderPoints,
  calculateSavingPercentage,
  calculateTripPoints,
} from "./calculations";

describe("commute calculations", () => {
  it("calculates the default trip points without floating point artefacts", () => {
    expect(calculateTripPoints(45, 1.5)).toBe(67.5);
  });

  it("calculates the monthly rider illustration", () => {
    expect(calculateMonthlyRiderPoints(45, 40, 1.5)).toBe(2700);
  });

  it("calculates driver cost recovery for two passengers", () => {
    expect(calculateMonthlyDriverRecovery(45, 40, 2, 1.5)).toBe(5400);
  });

  it("rejects unrealistic passenger counts", () => {
    expect(() => calculateMonthlyDriverRecovery(45, 40, 8)).toThrow(RangeError);
  });

  it("derives comparison percentages from displayed values", () => {
    expect(calculateSavingPercentage(11000, 2700)).toBe(75);
  });
});
