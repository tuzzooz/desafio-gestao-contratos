import type { EmployeeStatus } from "@/types/employee";

/**
 * Converts a local Date to a UTC ISO string.
 */
export function toUTC(date: Date): string {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  ).toISOString();
}

/**
 * Returns employee status based on expiration date.
 * - "Expired" if expirationDate is in the past
 * - "Expiring Soon" if expirationDate is within 5 days
 * - "Active" otherwise
 */
export function getEmployeeStatus(expirationDate: string): EmployeeStatus {
  const now = new Date();
  const expiration = new Date(expirationDate);

  if (expiration <= now) {
    return "Expired";
  }

  const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
  if (expiration.getTime() - now.getTime() <= fiveDaysMs) {
    return "Expiring Soon";
  }

  return "Active";
}
