/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      url: process.env.PERF_URL || "http://localhost:3000",
      numberOfRuns: 2,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "categories:performance": ["warn", { minScore: 0.7 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
