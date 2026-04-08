/** Homepage advantages — used in Переваги section */
export const ADVANTAGES = [
  { title: "Гарантія та повернення", text: "Офіційна гарантія та 14 днів на повернення." },
  { title: "Перевірка сумісності", text: "Контролюємо сумісність у конфігураторі." },
  { title: "Швидка підтримка", text: "Консультації по телефону та в чаті." },
] as const;

/** Popular search suggestions shown in search dropdown */
export const POPULAR_QUERIES = [
  "RTX 5070",
  "Ryzen 7 9800X3D",
  "DDR5 32GB",
  "Samsung 990 Pro",
  "Corsair RM850x",
  "Fractal Pop",
] as const;

/** Order status labels for UI display */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Очікує",
  CONFIRMED: "Підтверджено",
  PROCESSING: "В обробці",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELLED: "Скасовано",
  RETURNED: "Повернено",
} as const;
