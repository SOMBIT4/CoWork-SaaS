import "server-only";

export interface PostgresErrorLike extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

export function isPostgresError(
  error: unknown,
): error is PostgresErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  );
}

export function isUniqueViolation(
  error: unknown,
  constraint?: string,
): boolean {
  if (!isPostgresError(error) || error.code !== "23505") {
    return false;
  }

  return (
    constraint === undefined ||
    error.constraint === constraint
  );
}