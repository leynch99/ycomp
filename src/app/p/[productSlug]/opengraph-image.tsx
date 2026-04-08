import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "nodejs";

export const alt = "YComp — Компʼютерні комплектуючі";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ productSlug: string }>;
};

export default async function Image({ params }: Props) {
  const { productSlug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    });

    if (!product) {
      return new ImageResponse(
        (
          <div
            style={{
              background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 600,
            }}
          >
            YComp
          </div>
        ),
        { ...size }
      );
    }

    const image = product.images[0]?.url;
    const imageUrl = image 
      ? (image.startsWith("http") ? image : absoluteUrl(image))
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            color: "white",
            padding: 60,
            gap: 60,
          }}
        >
          {/* Text Container */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 24,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                YComp.ua
              </div>
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.name}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {product.oldPrice && (
                  <div
                    style={{
                      fontSize: 32,
                      color: "#94a3b8",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatPrice(product.oldPrice)}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 64,
                    fontWeight: 800,
                    color: "#a78bfa", // lilac
                  }}
                >
                  {formatPrice(product.salePrice)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: product.inStock ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)",
                  color: product.inStock ? "#4ade80" : "#fde047",
                  padding: "8px 16px",
                  borderRadius: 16,
                  fontSize: 24,
                  fontWeight: 600,
                  width: "fit-content",
                }}
              >
                {product.inStock ? "В наявності" : `Під замовлення ${product.leadTimeMinDays}-${product.leadTimeMaxDays} дн`}
              </div>
            </div>
          </div>

          {/* Image Container */}
          <div
            style={{
              width: "40%",
              height: "100%",
              background: "white",
              borderRadius: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: 32,
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ color: "#94a3b8", fontSize: 32 }}>Без фото</div>
            )}
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (e) {
    return new ImageResponse(
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 48, background: '#0f172a', color: 'white' }}>YComp</div>,
      { ...size }
    );
  }
}
