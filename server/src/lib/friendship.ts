export function normalizeUserPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}