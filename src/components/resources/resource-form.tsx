"use client";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Loader2,
  Save,
} from "lucide-react";
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

const initialState: ResourceActionState =
  {
    status: "idle",
  };

interface ResourceFormProps {
  organizationSlug: string;
  resource?: Resource;
}

interface FieldErrorProps {
  errors?: string[];
}

function FieldErrors({
  errors,
}: FieldErrorProps) {
  if (
    !errors ||
    errors.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-1">
      {errors.map(
        (error) => (
          <p
            key={error}
            className="text-xs font-medium text-rose-400"
          >
            {error}
          </p>
        ),
      )}
    </div>
  );
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

  const isEditing =
    Boolean(resource);

  const inputClasses =
    "w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form
      action={formAction}
      className="space-y-6"
    >
      {state.message ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="font-medium">{state.message}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-950/30">
        <div className="border-b border-slate-700/50 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-600/50 bg-gradient-to-br from-slate-700 to-slate-800 text-blue-400 shadow-lg shadow-blue-500/20">
              <Building2
                className="size-5"
                strokeWidth={2.5}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Resource details
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Add the basic information
                members will use when
                selecting this resource.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Name */}

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-bold text-white"
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
              disabled={pending}
              defaultValue={
                resource?.name ??
                ""
              }
              placeholder="Meeting Room A"
              className={
                inputClasses
              }
            />

            <p className="text-xs leading-5 text-slate-500">
              Use a clear name that
              members can recognize
              quickly.
            </p>

            <FieldErrors
              errors={
                state.fieldErrors
                  ?.name
              }
            />
          </div>

          {/* Type + capacity */}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-bold text-white"
              >
                Resource type
              </label>

              <select
                id="type"
                name="type"
                required
                disabled={pending}
                defaultValue={
                  resource?.type ??
                  "DESK"
                }
                className={
                  inputClasses
                }
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

              <FieldErrors
                errors={
                  state.fieldErrors
                    ?.type
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="capacity"
                className="text-sm font-bold text-white"
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
                disabled={pending}
                defaultValue={
                  resource
                    ?.capacity ??
                  1
                }
                className={
                  inputClasses
                }
              />

              <FieldErrors
                errors={
                  state.fieldErrors
                    ?.capacity
                }
              />
            </div>
          </div>

          {/* Floor */}

          <div className="space-y-2">
            <label
              htmlFor="floor"
              className="text-sm font-bold text-white"
            >
              Floor
              <span className="ml-1 font-normal text-slate-500">
                Optional
              </span>
            </label>

            <input
              id="floor"
              name="floor"
              type="text"
              maxLength={50}
              disabled={pending}
              defaultValue={
                resource?.floor ??
                ""
              }
              placeholder="1st Floor"
              className={
                inputClasses
              }
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  ?.floor
              }
            />
          </div>

          {/* Description */}

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-bold text-white"
            >
              Description
              <span className="ml-1 font-normal text-slate-500">
                Optional
              </span>
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={2000}
              disabled={pending}
              defaultValue={
                resource
                  ?.description ??
                ""
              }
              placeholder="Describe this resource, its location or any useful details..."
              className={`${inputClasses} resize-y`}
            />

            <FieldErrors
              errors={
                state.fieldErrors
                  ?.description
              }
            />
          </div>
        </div>
      </div>

      {/* Form actions */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/${organizationSlug}/resources`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/50 bg-slate-800/60 px-5 py-2.5 text-sm font-bold text-slate-200 transition-all hover:border-slate-500/60 hover:bg-slate-700/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          <ArrowLeft
            className="size-4"
            strokeWidth={2.5}
          />

          Back to resources
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2
              className="size-4 animate-spin"
            />
          ) : (
            <Save
              className="size-4"
              strokeWidth={2.5}
            />
          )}

          {pending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save changes"
              : "Create resource"}
        </button>
      </div>
    </form>
  );
}