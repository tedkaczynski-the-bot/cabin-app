"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

export const Header = () => {
  const pathname = usePathname();

  const navLinks = [
    { label: "Retreat", href: "/" },
    { label: "My Positions", href: "/retreats" },
  ];

  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-2xl">&#x1F6D6;</span>
          <div>
            <span className="font-mono font-bold text-lg tracking-tight text-neutral-100 group-hover:text-white transition-colors">
              CABIN
            </span>
            <span className="hidden sm:block text-xs text-neutral-500 font-mono">go off-grid</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <ul className="hidden sm:flex gap-1">
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`px-3 py-2 text-sm font-mono transition-colors ${
                    pathname === href ? "text-white bg-neutral-800 rounded" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <RainbowKitCustomConnectButton />
        </nav>
      </div>
    </header>
  );
};
