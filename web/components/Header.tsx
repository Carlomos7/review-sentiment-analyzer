"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/sentio-logo.png"
              alt="Sentio"
              width={36}
              height={36}
              className="h-9 w-9"
            />
            <span className="text-xl font-semibold text-midnight">Sentio</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-midnight font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a href="#login" className="text-gray-600 hover:text-midnight font-medium transition-colors">
              Login
            </a>
            <a
              href="#contact"
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 transition-colors font-medium"
            >
              Contact sales
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden py-4 border-t border-gray-100"
          >
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-600 hover:text-midnight font-medium py-2"
                >
                  {item.label}
                </a>
              ))}
              <hr className="border-gray-100" />
              <a href="#login" className="text-gray-600 font-medium py-2">
                Login
              </a>
              <a
                href="#contact"
                className="px-4 py-3 border border-gray-200 rounded-lg text-center font-medium"
              >
                Contact sales
              </a>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}
