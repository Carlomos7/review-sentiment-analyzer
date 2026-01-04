import { Github, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press", "Partners"],
  Resources: ["Documentation", "API Reference", "Guides", "Community", "Support"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/sentio-logo.png"
                alt="Sentio"
                width={36}
                height={36}
                className="h-9 w-9"
              />
              <span className="text-xl font-semibold text-midnight">Sentio</span>
            </div>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              AI-powered sentiment analytics to help you understand and grow with your customers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-midnight transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-midnight transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-midnight transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-midnight mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 hover:text-midnight text-sm transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Sentio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-midnight transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-midnight transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
