import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { buildFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Оплата",
  description: "Онлайн-оплата карткою, накладений платіж або безготівковий розрахунок. Безпечно та зручно.",
};

const PAYMENT_FAQ = [
  { question: "Які способи оплати приймаєте?", answer: "Онлайн-оплата карткою, накладений платіж при отриманні або безготівковий розрахунок для юридичних осіб." },
  { question: "Чи безпечна онлайн-оплата?", answer: "Так, оплата проходить через захищений платіжний шлюз. Дані картки не зберігаються на наших серверах." },
  { question: "Коли підтверджується замовлення після оплати?", answer: "Після оформлення замовлення менеджер звʼяжеться з вами та підтвердить деталі та спосіб оплати." },
];

export default function PaymentPage() {
  const faqSchema = buildFaqSchema(PAYMENT_FAQ);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <InfoPage slug="payment" title="Оплата">
        <p>Онлайн-оплата карткою, накладений платіж або безготівковий розрахунок.</p>
        <p>Після оформлення замовлення менеджер підтвердить деталі.</p>
      </InfoPage>
    </>
  );
}
