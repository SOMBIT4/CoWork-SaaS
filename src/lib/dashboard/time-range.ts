import {
  formatInTimeZone,
  fromZonedTime,
} from "date-fns-tz";

export interface DashboardTimeRange {
  localDate: string;

  todayStart: Date;

  todayEnd: Date;

  nextSevenDaysEnd: Date;
}

function addCalendarDays(
  dateString: string,
  days: number,
): string {
  const [
    year,
    month,
    day,
  ] = dateString
    .split("-")
    .map(Number);

  const result = new Date(
    Date.UTC(
      year,
      month - 1,
      day + days,
    ),
  );

  return result
    .toISOString()
    .slice(0, 10);
}

export function createDashboardTimeRange(
  timezone: string,
  now: Date,
): DashboardTimeRange {
  const localDate =
    formatInTimeZone(
      now,
      timezone,
      "yyyy-MM-dd",
    );

  const tomorrow =
    addCalendarDays(
      localDate,
      1,
    );

  const sevenDaysLater =
    addCalendarDays(
      localDate,
      7,
    );

  const todayStart =
    fromZonedTime(
      `${localDate}T00:00:00`,
      timezone,
    );

  const todayEnd =
    fromZonedTime(
      `${tomorrow}T00:00:00`,
      timezone,
    );

  const nextSevenDaysEnd =
    fromZonedTime(
      `${sevenDaysLater}T00:00:00`,
      timezone,
    );

  return {
    localDate,
    todayStart,
    todayEnd,
    nextSevenDaysEnd,
  };
}