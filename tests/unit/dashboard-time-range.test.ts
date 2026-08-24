import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createDashboardTimeRange,
} from "../../src/lib/dashboard/time-range";

describe(
  "dashboard timezone boundaries",
  () => {
    it(
      "creates Asia/Dhaka day boundaries in UTC",
      () => {
        const now =
          new Date(
            "2026-08-08T12:00:00.000Z",
          );

        const range =
          createDashboardTimeRange(
            "Asia/Dhaka",
            now,
          );

        expect(
          range.localDate,
        ).toBe(
          "2026-08-08",
        );

        expect(
          range.todayStart.toISOString(),
        ).toBe(
          "2026-08-07T18:00:00.000Z",
        );

        expect(
          range.todayEnd.toISOString(),
        ).toBe(
          "2026-08-08T18:00:00.000Z",
        );

        expect(
          range.nextSevenDaysEnd.toISOString(),
        ).toBe(
          "2026-08-14T18:00:00.000Z",
        );
      },
    );

    it(
      "creates UTC day boundaries correctly",
      () => {
        const now =
          new Date(
            "2026-08-08T12:00:00.000Z",
          );

        const range =
          createDashboardTimeRange(
            "UTC",
            now,
          );

        expect(
          range.todayStart.toISOString(),
        ).toBe(
          "2026-08-08T00:00:00.000Z",
        );

        expect(
          range.todayEnd.toISOString(),
        ).toBe(
          "2026-08-09T00:00:00.000Z",
        );

        expect(
          range.nextSevenDaysEnd.toISOString(),
        ).toBe(
          "2026-08-15T00:00:00.000Z",
        );
      },
    );
  },
);