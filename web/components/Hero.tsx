"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";

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
              Now with GPT-4 Integration
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-midnight leading-tight tracking-tight"
          >
            The sentiment analytics platform for{" "}
            <span className="text-gradient">instant insights</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Transform customer feedback into actionable intelligence. 
            Understand sentiment at scale with AI-powered analysis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/demo"
              className="group w-full sm:w-auto px-8 py-4 bg-sentio-500 text-white rounded-xl font-semibold hover:bg-sentio-600 transition-all shadow-lg shadow-sentio-500/25 hover:shadow-xl hover:shadow-sentio-500/30 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Demo
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
              <div className="bg-slate-50 rounded-b-xl p-6 min-h-[400px]">
                <DashboardPreview />
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

function DashboardPreview() {
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sentio-500 rounded-lg" />
          <span className="font-semibold text-slate-800">Sentio Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-8 bg-slate-200 rounded-md" />
          <div className="w-8 h-8 bg-slate-200 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="col-span-3 space-y-2">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-600 mb-3">Sentiment Overview</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-500">Positive</span>
                <span className="text-xs font-medium ml-auto">68%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-500">Neutral</span>
                <span className="text-xs font-medium ml-auto">22%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-xs text-slate-500">Negative</span>
                <span className="text-xs font-medium ml-auto">10%</span>
              </div>
            </div>
          </div>
          <div className="bg-sentio-50 rounded-lg p-4">
            <div className="text-sm font-medium text-sentio-700">Trending Topics</div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-9 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Reviews", value: "12.4K", change: "+12%" },
              { label: "Avg. Sentiment", value: "76%", change: "+5.2%" },
              { label: "Response Rate", value: "3.2h", change: "-18%" },
              { label: "NPS Score", value: "67", change: "+8" },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-slate-500">{stat.label}</div>
                <div className="text-xl font-bold text-slate-800 mt-1">{stat.value}</div>
                <div className="text-xs text-emerald-500 font-medium">{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-slate-800">Sentiment Trend</div>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 bg-sentio-100 text-sentio-600 rounded-md font-medium">30d</span>
                <span className="text-xs px-2 py-1 text-slate-500 rounded-md">60d</span>
                <span className="text-xs px-2 py-1 text-slate-500 rounded-md">90d</span>
              </div>
            </div>
            {/* Chart visualization */}
            <div className="h-32 flex items-end gap-1">
              {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 70, 78, 82, 88, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-sentio-500 to-sentio-300 rounded-t-sm opacity-80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
