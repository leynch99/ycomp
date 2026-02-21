"use client";

import { useReportWebVitals } from "next/web-vitals";

function sendToAnalytics(metric: {
  name: string;
  value: number;
  id: string;
  rating?: string;
  navigationType?: string;
}) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: metric.rating,
    page: window.location.pathname,
    href: window.location.href,
    device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/web-vitals", body);
  } else {
    fetch("/api/web-vitals", { body, method: "POST", keepalive: true });
  }

  if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

export function WebVitalsReporter() {
  useReportWebVitals(sendToAnalytics);
  return null;
}
