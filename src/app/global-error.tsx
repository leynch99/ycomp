"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="uk">
      <body>
        <div style={{ padding: "2rem", fontFamily: "system-ui", textAlign: "center" }}>
          <h1>Щось пішло не так</h1>
          <p>Ми вже отримали звіт про помилку.</p>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              marginTop: "1rem",
              cursor: "pointer",
              background: "var(--lilac, #8b5cf6)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
            }}
          >
            Спробувати знову
          </button>
        </div>
      </body>
    </html>
  );
}
