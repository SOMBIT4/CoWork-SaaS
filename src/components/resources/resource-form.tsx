"use client";

import Link from "next/link";
import {
  useActionState,
} from "react";

import {
  createResourceAction,
  type ResourceActionState,
  updateResourceAction,
} from "@/server/actions/resource.actions";
import type {
  Resource,
} from "@/types/domain";

const initialState: ResourceActionState = {
  status: "idle",
};

interface ResourceFormProps {
  organizationSlug: string;

  resource?: Resource;
}

export function ResourceForm({
  organizationSlug,
  resource,
}: ResourceFormProps) {
  const action = resource
    ? updateResourceAction.bind(
        null,
        organizationSlug,
        resource.id,
      )
    : createResourceAction.bind(
        null,
        organizationSlug,
      );

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    initialState,
  );

  const mode =
    resource
      ? "edit"
      : "create";

  return (
    <form
      action={formAction}
      className="space-y-6"
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
          Resource name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          defaultValue={
            resource?.name ?? ""
          }
          placeholder="Meeting Room A"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="type"
            className="text-sm font-medium"
          >
            Resource type
          </label>

          <select
            id="type"
            name="type"
            required
            defaultValue={
              resource?.type ??
              "DESK"
            }
            className="w-full rounded-md border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          >
            <option value="DESK">
              Desk
            </option>

            <option value="ROOM">
              Room
            </option>

            <option value="CABIN">
              Cabin
            </option>
          </select>

          {state.fieldErrors?.type?.map(
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
            htmlFor="capacity"
            className="text-sm font-medium"
          >
            Capacity
          </label>

          <input
            id="capacity"
            name="capacity"
            type="number"
            required
            min={1}
            max={500}
            step={1}
            defaultValue={
              resource?.capacity ??
              1
            }
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
          />

          {state.fieldErrors?.capacity?.map(
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
      </div>

      <div className="space-y-2">
        <label
          htmlFor="floor"
          className="text-sm font-medium"
        >
          Floor
        </label>

        <input
          id="floor"
          name="floor"
          type="text"
          maxLength={50}
          defaultValue={
            resource?.floor ?? ""
          }
          placeholder="1st Floor"
          className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />

        {state.fieldErrors?.floor?.map(
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
          htmlFor="description"
          className="text-sm font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
          defaultValue={
            resource?.description ??
            ""
          }
          placeholder="Describe this resource..."
          className="w-full resize-y rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
        />

        {state.fieldErrors?.description?.map(
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

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create resource"
              : "Save changes"}
        </button>

        <Link
          href={`/${organizationSlug}/resources`}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}