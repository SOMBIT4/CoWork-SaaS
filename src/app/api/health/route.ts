import {
  NextResponse,
} from "next/server";

import {
  query,
} from "@/lib/db/query";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    await query(
      "SELECT 1",
    );

    return NextResponse.json(
      {
        status: "ok",
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
      },
      {
        status: 503,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}