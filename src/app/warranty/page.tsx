import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";
import { buildFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Гарантія",
  description: "Офіційна гарантія від виробника. Повернення протягом 14 днів за умови збереження товарного вигляду.",
};

const WARRANTY_FAQ = [
  { question: "Яка гарантія на товари?", answer: "Офіційна гарантія від виробника. Термін залежить від категорії товару — зазвичай від 12 до 36 місяців." },
  { question: "Чи можна повернути товар?", answer: "Повернення протягом 14 днів за умови збереження товарного вигляду та комплектності. Звертайтесь до менеджера." },
  { question: "Як звернутися за гарантійним ремонтом?", answer: "Зверніться до сервісного центру або напишіть нам. Збережіть чек та гарантійний талон." },
];

export default function WarrantyPage() {
  const faqSchema = buildFaqSchema(WARRANTY_FAQ);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <InfoPage slug="warranty" title="Гарантія">
        <p>Офіційна гарантія від виробника. Термін залежить від категорії товару.</p>
        <p>Повернення протягом 14 днів за умови збереження товарного вигляду.</p>
      </InfoPage>
    </>
  );
}
