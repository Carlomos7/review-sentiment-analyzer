"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import dashboardScreenshot from "@/assets/dashboard.png";

export default function Hero() {
  return (
    <section className="relative pt-32 lg:pt-40 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-sentio-50/50 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-sentio-50 text-sentio-600 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-sentio-500 rounded-full animate-pulse" />
              Built for Women&apos;s Fashion Brands
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-midnight leading-tight tracking-tight"
          >
            Decode what shoppers really think about{" "}
            <span className="text-gradient">your clothing</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            AI-powered sentiment analysis built specifically for women&apos;s fashion. 
            Understand fit, style, and quality feedback at scale.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/demo"
              className="group w-full sm:w-auto px-8 py-4 bg-sentio-500 text-white rounded-xl font-semibold hover:bg-sentio-600 transition-all shadow-lg shadow-sentio-500/25 hover:shadow-xl hover:shadow-sentio-500/30 flex items-center justify-center"
            >
              Try Sentio
            </Link>
          </motion.div>
        </div>

        {/* Product Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 lg:mt-24"
        >
          <div className="relative max-w-5xl mx-auto">
            {/* Browser frame */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-1 shadow-2xl shadow-slate-900/20">
              <div className="bg-slate-800 rounded-t-xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-700 rounded-md px-4 py-1.5 text-slate-400 text-sm">
                    app.sentio.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="bg-slate-50 rounded-b-xl overflow-hidden">
                <Image
                  src={dashboardScreenshot}
                  alt="Sentio Analytics Dashboard"
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-slate-200/50 to-transparent blur-xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
