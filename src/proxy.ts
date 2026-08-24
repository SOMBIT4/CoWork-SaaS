import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";

const { auth } =
  NextAuth(authConfig);

const publicRoutes =
  new Set([
    "/",
    "/login",
    "/signup",
  ]);

function isPublicPath(
  pathname: string,
): boolean {
  if (
    publicRoutes.has(
      pathname,
    )
  ) {
    return true;
  }

  /*
   * Invitation pages must remain
   * accessible before organization
   * membership exists.
   */
  if (
    pathname === "/invite" ||
    pathname.startsWith(
      "/invite/",
    )
  ) {
    return true;
  }

  /*
   * Allow files served from public/,
   * such as:
   *
   * /logo.svg
   * /images/office.png
   */
  return /\.[^/]+$/.test(
    pathname,
  );
}

export const proxy =
  auth((request) => {
    const {
      pathname,
      search,
    } = request.nextUrl;

    if (
      isPublicPath(
        pathname,
      ) ||
      request.auth?.user
    ) {
      return NextResponse.next();
    }

    const loginUrl =
      new URL(
        "/login",
        request.url,
      );

    /*
     * After logging in, return the
     * user to the originally
     * requested page.
     */
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${search}`,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  });

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};