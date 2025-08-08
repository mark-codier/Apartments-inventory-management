// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "🏠 Wohnungen", href: "/apartments" },
  { label: "📦 Lager", href: "stock" },
  { label: "📋 Protokoll", href: "/logs" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 shadow">
      <ul className="flex gap-6">
        {navItems.map(({ label, href }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`hover:underline ${
                  isActive ? "font-bold underline" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
