import "server-only";

import { env } from "@/lib/env";
import { resend } from "@/lib/email/client";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailDeliveryResult {
  delivered: boolean;
  skipped: boolean;
  providerId?: string;
}

function getFromAddress():
  | string
  | null {
  const from =
    env.EMAIL_FROM?.trim();

  if (!from) {
    return null;
  }

  return from;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<EmailDeliveryResult> {
  /*
   * Development fallback.
   *
   * The application must continue working
   * even when Resend is not configured.
   *
   * Never log raw invitation/reset/
   * verification tokens here.
   */
  if (!resend) {
    if (
      env.NODE_ENV ===
      "development"
    ) {
      console.info(
        `[email:development] skipped email to ${to}: ${subject}`,
      );
    }

    return {
      delivered: false,
      skipped: true,
    };
  }

  const from =
    getFromAddress();

  if (!from) {
    console.error(
      "Email delivery skipped because EMAIL_FROM is not configured.",
    );

    return {
      delivered: false,
      skipped: true,
    };
  }

  try {
    const {
      data,
      error,
    } =
      await resend.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });

    if (error) {
      console.error(
        "Email provider rejected an email.",
        {
          recipient: to,
          message:
            error.message,
        },
      );

      return {
        delivered: false,
        skipped: false,
      };
    }

    return {
      delivered: true,
      skipped: false,
      providerId:
        data?.id,
    };
  } catch (error) {
    console.error(
      "Email delivery failed.",
      {
        recipient: to,
        message:
          error instanceof Error
            ? error.message
            : "Unknown email error",
      },
    );

    /*
     * Important:
     *
     * Do not throw here and undo an otherwise
     * successful booking/invitation operation.
     */
    return {
      delivered: false,
      skipped: false,
    };
  }
}