import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  ),
});

const categories = [
  { name: "CPU", slug: "cpu" },
  { name: "GPU", slug: "gpu" },
  { name: "Motherboards", slug: "motherboards" },
  { name: "RAM", slug: "ram" },
  { name: "SSD/HDD", slug: "ssd" },
  { name: "PSU", slug: "psu" },
  { name: "Cases", slug: "cases" },
  { name: "Cooling", slug: "cooling" },
  { name: "Peripherals", slug: "peripherals" },
  { name: "Accessories", slug: "accessories" },
];

const suppliers = [
  { name: "TechLine", slug: "techline", email: "supply@techline.ua", phone: "+380442221100" },
  { name: "ByteHub", slug: "bytehub", email: "partner@bytehub.ua", phone: "+380442221200" },
  { name: "CoreDrop", slug: "coredrop", email: "orders@coredrop.ua", phone: "+380442221300" },
];

const brands = {
  cpu: ["Intel", "AMD"],
  gpu: ["NVIDIA", "AMD"],
  motherboards: ["ASUS", "MSI", "Gigabyte"],
  ram: ["Kingston", "Corsair", "G.Skill"],
  ssd: ["Samsung", "Kingston", "WD"],
  psu: ["Seasonic", "Corsair", "be quiet!"],
  cases: ["NZXT", "Fractal", "Corsair"],
  cooling: ["Noctua", "Cooler Master"],
  peripherals: ["Logitech", "Razer"],
  accessories: ["CableMod", "Arctic"],
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  await prisma.blogPost.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.supplierPayout.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.npBranch.deleteMany();
  await prisma.npCity.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.tradeInRequest.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  const supplierRows = await prisma.supplier.createMany({ data: suppliers });
  const categoryRows = await prisma.category.createMany({ data: categories });

  const supplierList = await prisma.supplier.findMany();
  const categoryList = await prisma.category.findMany();

  const products = [];
  for (const category of categoryList) {
    const count = rand(8, 16);
    for (let i = 0; i < count; i += 1) {
      const brand = randomFrom(brands[category.slug] ?? ["Generic"]);
      const cost = rand(800, 20000);
      const sale = cost + rand(300, 4000);
      const socket = category.slug === "cpu" || category.slug === "motherboards" ? randomFrom(["AM5", "AM4", "LGA1700"]) : null;
      const ramType = category.slug === "ram" || category.slug === "motherboards" ? randomFrom(["DDR4", "DDR5"]) : null;
      const product = await prisma.product.create({
        data: {
          name: `${brand} ${category.name} ${rand(100, 999)}`,
          slug: `${category.slug}-${brand.toLowerCase()}-${Date.now()}-${i}`,
          sku: `${category.slug.toUpperCase()}-${rand(1000, 9999)}`,
          brand,
          description: "Опис буде додано пізніше.",
          categoryId: category.id,
          supplierId: randomFrom(supplierList).id,
          costPrice: cost,
          salePrice: sale,
          oldPrice: Math.random() > 0.7 ? sale + rand(500, 1500) : null,
          stockQty: Math.random() > 0.35 ? rand(3, 24) : null,
          inStock: Math.random() > 0.2,
          leadTimeMinDays: 1,
          leadTimeMaxDays: 7,
          isDeal: Math.random() > 0.85,
          isOutlet: Math.random() > 0.9,
          popularity: rand(1, 100),
          socket,
          cores: category.slug === "cpu" ? rand(4, 16) : null,
          threads: category.slug === "cpu" ? rand(8, 32) : null,
          chipset: category.slug === "motherboards" ? randomFrom(["B650", "X670", "Z790"]) : null,
          formFactor: category.slug === "motherboards" || category.slug === "cases" ? randomFrom(["ATX", "mATX", "ITX"]) : null,
          ramType,
          ramCapacity: category.slug === "ram" ? randomFrom([16, 32, 64]) : null,
          ramFrequency: category.slug === "ram" ? randomFrom([3200, 3600, 5600]) : null,
          storageType: category.slug === "ssd" ? randomFrom(["NVMe", "SATA"]) : null,
          storageCapacity: category.slug === "ssd" ? randomFrom([512, 1024, 2048]) : null,
          psuWattage: category.slug === "psu" ? randomFrom([650, 750, 850]) : null,
          psuCert: category.slug === "psu" ? randomFrom(["80+ Gold", "80+ Bronze"]) : null,
          powerW: category.slug === "cpu" || category.slug === "gpu" ? rand(65, 250) : null,
        },
      });
      await prisma.productImage.createMany({
        data: [
          { productId: product.id, url: "/images/placeholder.svg", position: 0 },
          { productId: product.id, url: "/images/placeholder.svg", position: 1 },
          { productId: product.id, url: "/images/placeholder.svg", position: 2 },
        ],
      });
      products.push(product);
    }
  }

  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: { email: "admin@ycomp.ua", name: "Admin", passwordHash: adminPassword, role: "ADMIN" },
  });

  const sampleItems = products.slice(0, 2);
  const order = await prisma.order.create({
    data: {
      number: `YC-${Date.now().toString().slice(-6)}`,
      status: "NEW",
      customerName: "Олексій К.",
      phone: "+380501112233",
      email: "alex@example.com",
      city: "Київ",
      npBranch: "Відділення №12",
      paymentMethod: "online",
      total: sampleItems.reduce((sum, p) => sum + p.salePrice, 0),
      items: {
        create: sampleItems.map((p) => ({
          productId: p.id,
          name: p.name,
          sku: p.sku,
          qty: 1,
          price: p.salePrice,
          costPrice: p.costPrice,
          margin: p.salePrice - p.costPrice,
        })),
      },
    },
  });

  await prisma.supplierPayout.create({
    data: {
      orderId: order.id,
      supplierId: sampleItems[0].supplierId,
      amount: sampleItems[0].salePrice - sampleItems[0].costPrice,
      status: "PENDING",
    },
  });

  await prisma.contactRequest.create({
    data: {
      phone: "+380501112200",
      question: "Порадьте відеокарту для 1440p.",
    },
  });

  const kyiv = await prisma.npCity.create({
    data: { name: "Київ", region: "Київська" },
  });
  const lviv = await prisma.npCity.create({
    data: { name: "Львів", region: "Львівська" },
  });
  const dnipro = await prisma.npCity.create({
    data: { name: "Дніпро", region: "Дніпропетровська" },
  });

  await prisma.npBranch.createMany({
    data: [
      { cityId: kyiv.id, name: "Відділення №12", address: "вул. Хрещатик, 22" },
      { cityId: kyiv.id, name: "Відділення №45", address: "просп. Перемоги, 67" },
      { cityId: lviv.id, name: "Відділення №3", address: "пл. Ринок, 1" },
      { cityId: lviv.id, name: "Відділення №18", address: "вул. Стрийська, 99" },
      { cityId: dnipro.id, name: "Відділення №7", address: "просп. Яворницького, 101" },
      { cityId: dnipro.id, name: "Відділення №22", address: "вул. Набережна Перемоги, 12" },
    ],
  });

  // --- Banners ---
  await prisma.banner.createMany({
    data: [
      {
        type: "hero",
        title: "Знижки до -40% на процесори",
        subtitle: "Тільки цього тижня",
        imageUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&h=600&fit=crop",
        linkUrl: "/catalog?deal=true",
        position: 0,
        isActive: true,
      },
      {
        type: "tile",
        title: "Компʼютери",
        subtitle: "Готові збірки",
        imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=400&fit=crop",
        linkUrl: "/c/cases",
        position: 0,
        isActive: true,
      },
      {
        type: "tile",
        title: "Ноутбуки",
        subtitle: "Для роботи та ігор",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
        linkUrl: "/catalog?q=laptop",
        position: 1,
        isActive: true,
      },
      {
        type: "tile",
        title: "Товари для блекауту",
        subtitle: "UPS та генератори",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
        linkUrl: "/c/psu",
        position: 2,
        isActive: true,
      },
      {
        type: "tile",
        title: "Послуги та сервіс",
        subtitle: "Діагностика, збірка",
        imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=600&h=400&fit=crop",
        linkUrl: "/service",
        position: 3,
        isActive: true,
      },
    ],
  });

  console.log("Seeded banners: 1 hero + 4 tiles");

  // --- Blog post ---
  await prisma.blogPost.create({
    data: {
      slug: "iak-zibraty-pk-vlasnoruch-2025",
      title: "Як зібрати ПК власноруч: гайд 2025",
      excerpt: "Покрокова інструкція по збірці компʼютера — від вибору комплектуючих до першого запуску.",
      body: `Збірка ПК власноруч дає змогу отримати саме ту конфігурацію, яка потрібна, і часто економити гроші. У цьому гайді розберемо основні кроки.

## 1. Вибір комплектуючих

Почніть із процесора та материнської плати — вони повинні бути сумісними (socket). Далі підберіть оперативну памʼять відповідного типу (DDR4 або DDR5), блок живлення достатньої потужності та корпус.

Використовуйте наш конфігуратор на сайті — він перевірить сумісність автоматично.

## 2. Підготовка робочого місця

Потрібна чиста, суха поверхня без статики. Рекомендуємо антистатичний браслет. Усі коробки та пакети тримайте поруч до завершення збірки.

## 3. Порядок збірки

Класичний варіант: спочатку процесор і охолодження на материнську плату, потім плата в корпус, далі оперативна памʼять, SSD, блок живлення та підключення всіх кабелів. Відеокарту встановлюють останньою.

## 4. Перший запуск

Після збірки підключіть монітор до материнської плати (якщо є вбудована графіка) або до відеокарти. Увімкніть живлення — BIOS має зʼявитися на екрані. Якщо ні — перевірте підключення та наявність живлення CPU.

Далі встановіть ОС, драйвери та базове ПЗ. Готово!`,
      imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&h=450&fit=crop",
      isPublished: true,
    },
  });

  console.log("Seeded blog: 1 post");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
