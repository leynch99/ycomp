export type Lang = "ua" | "ru";

export const translations = {
  ua: {
    common: {
      catalog: "Каталог",
      deals: "Акції",
      outlet: "Уцінка",
      tradeIn: "Trade-in",
      service: "Сервіс",
      configurator: "Конфігуратор ПК",
      consultation: "Консультація",
      search: "Пошук",
      wishlist: "Обране",
      compare: "Порівняння",
      cart: "Кошик",
      account: "Профіль",
      addToCart: "В кошик",
      buyNow: "Купити в 1 клік",
      inStock: "В наявності",
      onOrder: "Під замовлення",
      price: "Ціна",
      filters: "Фільтри",
      sort: "Сортування",
    },
  },
  ru: {
    common: {
      catalog: "Каталог",
      deals: "Акции",
      outlet: "Уценка",
      tradeIn: "Trade-in",
      service: "Сервис",
      configurator: "Конфигуратор ПК",
      consultation: "Консультация",
      search: "Поиск",
      wishlist: "Избранное",
      compare: "Сравнение",
      cart: "Корзина",
      account: "Профиль",
      addToCart: "В корзину",
      buyNow: "Купить в 1 клик",
      inStock: "В наличии",
      onOrder: "Под заказ",
      price: "Цена",
      filters: "Фильтры",
      sort: "Сортировка",
    },
  },
};

export function t(lang: Lang, key: keyof (typeof translations)["ua"]["common"]) {
  return translations[lang].common[key];
}
