import "server-only";

import {
  formatInTimeZone,
} from "date-fns-tz";

import {
  sendEmail,
  type EmailDeliveryResult,
} from "@/lib/email/send-email";

function escapeHtml(
  value: string,
): string {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

interface InvitationEmailInput {
  to: string;
  organizationName: string;
  role: string;
  invitationUrl: string;
  expiresInHours?: number;
}

export async function sendInvitationEmail({
  to,
  organizationName,
  role,
  invitationUrl,
  expiresInHours = 48,
}: InvitationEmailInput): Promise<EmailDeliveryResult> {
  const safeOrganizationName =
    escapeHtml(
      organizationName,
    );

  const safeRole =
    escapeHtml(role);

  const safeUrl =
    escapeHtml(
      invitationUrl,
    );

  return sendEmail({
    to,

    subject:
      `Invitation to join ${organizationName}`,

    text: [
      `You have been invited to join ${organizationName}.`,
      `Role: ${role}.`,
      `This invitation expires in ${expiresInHours} hours.`,
      `Accept invitation: ${invitationUrl}`,
    ].join("\n"),

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Join ${safeOrganizationName}</h2>

        <p>
          You have been invited to join
          <strong>${safeOrganizationName}</strong>
          as <strong>${safeRole}</strong>.
        </p>

        <p>
          This invitation expires in
          ${expiresInHours} hours.
        </p>

        <p>
          <a href="${safeUrl}">
            Accept invitation
          </a>
        </p>

        <p>
          If you were not expecting this invitation,
          you can ignore this email.
        </p>
      </div>
    `,
  });
}

interface BookingEmailInput {
  to: string;

  userName?: string;

  organizationName: string;

  organizationTimezone: string;

  bookingTitle: string;

  resourceName: string;

  startTime: Date;

  endTime: Date;
}

function formatBookingTime(
  value: Date,
  timezone: string,
): string {
  return formatInTimeZone(
    value,
    timezone,
    "EEEE, MMMM d, yyyy 'at' h:mm a",
  );
}

export async function sendBookingConfirmationEmail({
  to,
  userName,
  organizationName,
  organizationTimezone,
  bookingTitle,
  resourceName,
  startTime,
  endTime,
}: BookingEmailInput): Promise<EmailDeliveryResult> {
  const start =
    formatBookingTime(
      startTime,
      organizationTimezone,
    );

  const end =
    formatBookingTime(
      endTime,
      organizationTimezone,
    );

  const greeting =
    userName
      ? `Hi ${escapeHtml(
          userName,
        )},`
      : "Hello,";

  return sendEmail({
    to,

    subject:
      `Booking confirmed — ${bookingTitle}`,

    text: [
      userName
        ? `Hi ${userName},`
        : "Hello,",
      "",
      `Your booking has been confirmed.`,
      `Organization: ${organizationName}`,
      `Booking: ${bookingTitle}`,
      `Resource: ${resourceName}`,
      `Start: ${start}`,
      `End: ${end}`,
      `Timezone: ${organizationTimezone}`,
    ].join("\n"),

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <p>${greeting}</p>

        <h2>Booking confirmed</h2>

        <p>
          Your booking at
          <strong>${escapeHtml(
            organizationName,
          )}</strong>
          has been confirmed.
        </p>

        <p>
          <strong>Booking:</strong>
          ${escapeHtml(
            bookingTitle,
          )}
        </p>

        <p>
          <strong>Resource:</strong>
          ${escapeHtml(
            resourceName,
          )}
        </p>

        <p>
          <strong>Start:</strong>
          ${escapeHtml(start)}
        </p>

        <p>
          <strong>End:</strong>
          ${escapeHtml(end)}
        </p>

        <p>
          Timezone:
          ${escapeHtml(
            organizationTimezone,
          )}
        </p>
      </div>
    `,
  });
}

export async function sendBookingCancellationEmail({
  to,
  userName,
  organizationName,
  organizationTimezone,
  bookingTitle,
  resourceName,
  startTime,
  endTime,
}: BookingEmailInput): Promise<EmailDeliveryResult> {
  const start =
    formatBookingTime(
      startTime,
      organizationTimezone,
    );

  const end =
    formatBookingTime(
      endTime,
      organizationTimezone,
    );

  const greeting =
    userName
      ? `Hi ${escapeHtml(
          userName,
        )},`
      : "Hello,";

  return sendEmail({
    to,

    subject:
      `Booking cancelled — ${bookingTitle}`,

    text: [
      userName
        ? `Hi ${userName},`
        : "Hello,",
      "",
      `Your booking has been cancelled.`,
      `Organization: ${organizationName}`,
      `Booking: ${bookingTitle}`,
      `Resource: ${resourceName}`,
      `Original start: ${start}`,
      `Original end: ${end}`,
    ].join("\n"),

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <p>${greeting}</p>

        <h2>Booking cancelled</h2>

        <p>
          The following booking at
          <strong>${escapeHtml(
            organizationName,
          )}</strong>
          has been cancelled.
        </p>

        <p>
          <strong>Booking:</strong>
          ${escapeHtml(
            bookingTitle,
          )}
        </p>

        <p>
          <strong>Resource:</strong>
          ${escapeHtml(
            resourceName,
          )}
        </p>

        <p>
          <strong>Original start:</strong>
          ${escapeHtml(start)}
        </p>

        <p>
          <strong>Original end:</strong>
          ${escapeHtml(end)}
        </p>
      </div>
    `,
  });
}

interface SecurityEmailInput {
  to: string;
  userName?: string;
  url: string;
}

export async function sendPasswordResetEmail({
  to,
  userName,
  url,
}: SecurityEmailInput): Promise<EmailDeliveryResult> {
  return sendEmail({
    to,

    subject:
      "Reset your CoWork password",

    text: [
      userName
        ? `Hi ${userName},`
        : "Hello,",
      "",
      "Use the link below to reset your password.",
      url,
      "",
      "If you did not request this, ignore this email.",
    ].join("\n"),

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Reset your password</h2>

        <p>
          ${userName
            ? `Hi ${escapeHtml(
                userName,
              )},`
            : "Hello,"}
        </p>

        <p>
          Use the link below to reset your password.
        </p>

        <p>
          <a href="${escapeHtml(
            url,
          )}">
            Reset password
          </a>
        </p>

        <p>
          If you did not request this,
          ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendEmailVerificationEmail({
  to,
  userName,
  url,
}: SecurityEmailInput): Promise<EmailDeliveryResult> {
  return sendEmail({
    to,

    subject:
      "Verify your CoWork email",

    text: [
      userName
        ? `Hi ${userName},`
        : "Hello,",
      "",
      "Use the link below to verify your email.",
      url,
    ].join("\n"),

    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Verify your email</h2>

        <p>
          ${userName
            ? `Hi ${escapeHtml(
                userName,
              )},`
            : "Hello,"}
        </p>

        <p>
          Verify your email address to complete
          your CoWork account setup.
        </p>

        <p>
          <a href="${escapeHtml(
            url,
          )}">
            Verify email
          </a>
        </p>
      </div>
    `,
  });
}