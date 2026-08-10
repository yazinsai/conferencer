export function nowIso() {
  return new Date().toISOString();
}

export function daysUntil(isoDate: string) {
  const target = new Date(isoDate);
  const today = new Date();
  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
