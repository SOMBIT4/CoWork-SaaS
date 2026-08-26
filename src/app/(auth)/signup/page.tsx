import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/onboarding");
  }

  return (
    <main className="flex min-h-screen bg-[#09090B]">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        {/* Back to home */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center space-x-2 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-2xl font-bold text-white">CoWork</span>
            </Link>

            <h1 className="text-3xl font-bold text-white">
              Create your account
            </h1>

            <p className="mt-2 text-[#A1A1AA]">
              Start managing your coworking workspace with conflict-free bookings.
            </p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-[#A1A1AA]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Everything you need to run a modern workspace
          </h2>
          <p className="text-lg text-[#A1A1AA] mb-8">
            Built for coworking teams who need reliable resource management and conflict-free scheduling.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20">
                <Check className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-white">Multi-tenant architecture</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20">
                <Check className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-white">Database-enforced booking protection</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20">
                <Check className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-white">Comprehensive audit logging</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}