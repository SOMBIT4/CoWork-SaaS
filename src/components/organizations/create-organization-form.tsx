"use client";

import {
  useActionState,
  useState,
} from "react";

import {
  createOrganizationAction,
  type OrganizationActionState,
} from "@/server/actions/organization.actions";

const initialState: OrganizationActionState = {
  status: "idle",
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function CreateOrganizationForm() {
  const [state, formAction, pending] =
    useActionState(
      createOrganizationAction,
      initialState,
    );

  const [
    slugWasManuallyEdited,
    setSlugWasManuallyEdited,
  ] = useState(false);

  const [slug, setSlug] =
    useState("");

  function handleNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!slugWasManuallyEdited) {
      setSlug(
        slugify(event.target.value),
      );
    }
  }

  function handleSlugChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSlugWasManuallyEdited(true);

    setSlug(
      slugify(event.target.value),
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      {state.message ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {state.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium"
        >
          Organization name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          onChange={handleNameChange}
          placeholder="Acme Coworking"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          aria-invalid={
            Boolean(
              state.fieldErrors?.name,
            )
          }
        />

        {state.fieldErrors?.name?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="slug"
          className="text-sm font-medium"
        >
          Organization URL
        </label>

        <div className="flex rounded-md border focus-within:ring-2 focus-within:ring-black">
          <span className="flex items-center border-r bg-neutral-50 px-3 text-sm text-neutral-500">
            /
          </span>

          <input
            id="slug"
            name="slug"
            type="text"
            required
            minLength={3}
            maxLength={60}
            value={slug}
            onChange={
              handleSlugChange
            }
            placeholder="acme-coworking"
            className="min-w-0 flex-1 rounded-r-md px-3 py-2 outline-none"
            aria-invalid={
              Boolean(
                state.fieldErrors?.slug,
              )
            }
          />
        </div>

        <p className="text-xs text-neutral-500">
          Example: /acme-coworking
        </p>

        {state.fieldErrors?.slug?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="timezone"
          className="text-sm font-medium"
        >
          Organization timezone
        </label>

        <input
          id="timezone"
          name="timezone"
          type="text"
          required
          maxLength={100}
          placeholder="Asia/Dhaka"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          aria-invalid={
            Boolean(
              state.fieldErrors
                ?.timezone,
            )
          }
        />

        <p className="text-xs text-neutral-500">
          Use an IANA timezone such
          as Asia/Dhaka,
          America/New_York, or
          Europe/London.
        </p>

        {state.fieldErrors?.timezone?.map(
          (error) => (
            <p
              key={error}
              className="text-sm text-red-600"
            >
              {error}
            </p>
          ),
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-black px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Creating organization..."
          : "Create organization"}
      </button>
    </form>
  );
}