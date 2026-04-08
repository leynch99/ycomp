import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    // Overall stats
    ordersCount,
    revenue,
    margin,
    pendingPayouts,
    // Today stats
    todayOrders,
    todayRevenue,
    // Week stats
    weekOrders,
    weekRevenue,
    // Month stats
    monthOrders,
    monthRevenue,
    // Top products
    topProducts,
    // Recent orders
    recentOrders,
    // Low stock products
    lowStockProducts,
    // Order status breakdown
    ordersByStatus,
  ] = await Promise.all([
    // Overall
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.orderItem.aggregate({ _sum: { margin: true } }),
    prisma.supplierPayout.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    }),
    // Today
    prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { total: true },
    }),
    // Week
    prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfWeek } },
      _sum: { total: true },
    }),
    // Month
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    // Top products by revenue
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { price: true, qty: true },
      orderBy: { _sum: { price: "desc" } },
      take: 5,
    }),
    // Recent orders
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        number: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    // Low stock
    prisma.product.findMany({
      where: {
        AND: [
          { stockQty: { not: null } },
          { stockQty: { lte: 5 } },
          { inStock: true },
        ],
      },
      take: 10,
      orderBy: { stockQty: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQty: true,
      },
    }),
    // Orders by status
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const avgOrderValue = ordersCount > 0 ? (revenue._sum.total ?? 0) / ordersCount : 0;
  const marginPercent = revenue._sum.total ? ((margin._sum.margin ?? 0) / (revenue._sum.total ?? 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
          Панель керування
        </h1>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Оновлено: {now.toLocaleString("uk-UA")}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Всього замовлень"
          value={ordersCount.toString()}
          trend={`+${todayOrders} сьогодні`}
          icon="📦"
        />
        <StatCard
          label="Загальна виручка"
          value={formatPrice(revenue._sum.total ?? 0)}
          trend={`+${formatPrice(todayRevenue._sum.total ?? 0)} сьогодні`}
          icon="💰"
        />
        <StatCard
          label="Маржа"
          value={formatPrice(margin._sum.margin ?? 0)}
          trend={`${marginPercent.toFixed(1)}% від виручки`}
          icon="📈"
        />
        <StatCard
          label="Середній чек"
          value={formatPrice(avgOrderValue)}
          trend={`${ordersCount} замовлень`}
          icon="🧾"
        />
      </div>

      {/* Period Stats */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <PeriodCard
          label="Сьогодні"
          orders={todayOrders}
          revenue={todayRevenue._sum.total ?? 0}
        />
        <PeriodCard
          label="Цього тижня"
          orders={weekOrders}
          revenue={weekRevenue._sum.total ?? 0}
        />
        <PeriodCard
          label="Цього місяця"
          orders={monthOrders}
          revenue={monthRevenue._sum.total ?? 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
            Топ товарів
          </h2>
          <div className="space-y-3">
            {topProducts.map((item: any, idx: number) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lilac-100 dark:bg-lilac-900/30 text-sm font-semibold text-lilac-700 dark:text-lilac-300">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Продано: {item._sum.qty} шт
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatPrice((item._sum.price ?? 0) * (item._sum.qty ?? 0))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
            Статуси замовлень
          </h2>
          <div className="space-y-3">
            {ordersByStatus.map((item) => {
              const statusLabels: Record<string, string> = {
                NEW: "Нові",
                CONFIRMED: "Підтверджені",
                PROCESSING: "В обробці",
                SHIPPED: "Відправлені",
                DELIVERED: "Доставлені",
                CANCELLED: "Скасовані",
              };
              const statusColors: Record<string, string> = {
                NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                PROCESSING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
                SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
              };

              return (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusColors[item.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {statusLabels[item.status] || item.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item._count.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 p-4 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
            Останні замовлення
          </h2>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <a
                key={order.id}
                href={`/admin/orders`}
                className="block rounded-lg border border-slate-100 dark:border-white/5 p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {order.number}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {order.customerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPrice(order.total)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="rounded-xl border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-orange-900 dark:text-orange-300 sm:text-lg">
            <span>⚠️</span>
            Низький залишок
          </h2>
          <div className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <div className="text-sm text-orange-700 dark:text-orange-400">
                Всі товари в наявності
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <a
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="block rounded-lg border border-orange-200 dark:border-orange-900/30 bg-white dark:bg-slate-900 p-3 transition hover:bg-orange-100 dark:hover:bg-orange-900/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        SKU: {product.sku}
                      </div>
                    </div>
                    <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
                      {product.stockQty} шт
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending Payouts */}
      {(pendingPayouts._sum.amount ?? 0) > 0 && (
        <div className="rounded-xl border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-300">
                Виплати постачальникам (очікування)
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                Необхідно обробити виплати
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                {formatPrice(pendingPayouts._sum.amount ?? 0)}
              </div>
              <a
                href="/admin/payouts"
                className="mt-2 inline-block text-sm text-yellow-700 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200"
              >
                Переглянути →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:text-[11px]">
            {label}
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
            {value}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{trend}</div>
        </div>
        <div className="text-2xl sm:text-3xl">{icon}</div>
      </div>
    </div>
  );
}

function PeriodCard({
  label,
  orders,
  revenue,
}: {
  label: string;
  orders: number;
  revenue: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-gradient-to-br from-lilac-50 to-white dark:from-slate-900 dark:to-slate-800 p-4 sm:p-6">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-3 space-y-2">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Замовлень</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">{orders}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Виручка</div>
          <div className="text-lg font-bold text-lilac-700 dark:text-lilac-300">
            {formatPrice(revenue)}
          </div>
        </div>
      </div>
    </div>
  );
}
