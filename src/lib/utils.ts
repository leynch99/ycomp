export function formatPrice(value: number) {
  const safe = Math.round(value);
  const withSpaces = safe.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${withSpaces} грн`;
}

export function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
