import {
  createHash,
  randomBytes,
} from "node:crypto";

export interface GeneratedInvitationToken {
  rawToken: string;
  tokenHash: string;
}

export function hashInvitationToken(
  rawToken: string,
): string {
  return createHash("sha256")
    .update(rawToken)
    .digest("hex");
}

export function generateInvitationToken(): GeneratedInvitationToken {
  const rawToken =
    randomBytes(32).toString(
      "base64url",
    );

  return {
    rawToken,
    tokenHash:
      hashInvitationToken(
        rawToken,
      ),
  };
}