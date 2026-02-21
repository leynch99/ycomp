import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { buildFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Доставка",
  description: "Доставка по Україні Новою Поштою. Терміни 1–3 дні. Відправка після підтвердження замовлення.",
};

const DELIVERY_FAQ = [
  { question: "Яким способом доставляєте?", answer: "Доставка по Україні Новою Поштою. Терміни: 1–3 дні залежно від регіону." },
  { question: "Коли відправляється замовлення?", answer: "Відправка після підтвердження замовлення та отримання оплати. Деталі узгоджуються з менеджером." },
  { question: "Скільки коштує доставка?", answer: "Вартість доставки залежить від ваги та відстані. Розраховується при оформленні замовлення." },
];

export default function DeliveryPage() {
  const faqSchema = buildFaqSchema(DELIVERY_FAQ);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <InfoPage slug="delivery" title="Доставка">
        <p>Доставляємо по Україні Новою Поштою. Терміни: 1–3 дні.</p>
        <p>Відправка після підтвердження замовлення та отримання оплати.</p>
      </InfoPage>
    </>
  );
}
