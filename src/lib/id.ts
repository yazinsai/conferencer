import { nanoid } from "nanoid";

export function id(prefix?: string) {
  const n = nanoid(12);
  return prefix ? `${prefix}_${n}` : n;
}
