import Link from "next/link";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Security", href: "#security" },
      { label: "How it works", href: "#how-it-works" },
    ],
    company: [
      { label: "Login", href: "/login" },
      { label: "Get started", href: "/signup" },
    ],
  };

  return (
    <footer className="border-t border-[#27272A] bg-[#111113] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group w-fit">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white">CoWork</span>
            </Link>
            <p className="text-[#A1A1AA] text-sm max-w-xs">
              A multi-tenant workspace management platform for conflict-safe bookings and secure resource coordination.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[#A1A1AA] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Get Started</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A1A1AA] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#27272A] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#A1A1AA] text-sm">
            © {currentYear} CoWork. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[#A1A1AA] hover:text-white text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[#A1A1AA] hover:text-white text-sm transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
