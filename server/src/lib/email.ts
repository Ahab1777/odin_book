import validator from "validator";

export function normalizeAppEmail(raw: string): string {
  const result = validator.normalizeEmail(raw);
  return (result || raw).trim();
}