"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-midnight via-slate-800 to-midnight p-12 lg:p-16"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sentio-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sentio-600/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to understand your customers better?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of companies using Sentio to transform customer feedback into growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#get-started"
                className="group w-full sm:w-auto px-8 py-4 bg-sentio-500 text-white rounded-xl font-semibold hover:bg-sentio-600 transition-all flex items-center justify-center gap-2"
              >
                Start free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Talk to sales
              </a>
            </div>
            <p className="mt-6 text-sm text-gray-400">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

