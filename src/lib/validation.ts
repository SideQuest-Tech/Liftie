export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const DOMAIN_PATTERN = /^(?!-)(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;

export const personalEmailDomains = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "yahoo.com",
  "proton.me",
  "protonmail.com",
]);

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());
export const isValidDomain = (value: string) =>
  DOMAIN_PATTERN.test(value.trim().replace(/^https?:\/\//, "").replace(/^www\./, ""));

export const isPersonalEmail = (value: string) => {
  const domain = value.trim().toLowerCase().split("@")[1];
  return domain ? personalEmailDomains.has(domain) : false;
};

export const required = (value: string, label: string) =>
  value.trim() ? "" : `${label} is required.`;
