export function toArray(value?: string | string[]) {
  if (!value) return [];
  return Array.isArray(value) ? value : value.split(",").filter(Boolean);
}

export function toNumberArray(value?: string | string[]) {
  return toArray(value)
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));
}
