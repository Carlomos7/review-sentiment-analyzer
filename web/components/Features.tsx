"use client";

import { motion } from "framer-motion";
import { Brain, Zap, BarChart3, Globe, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Fashion-Trained AI",
    description: "Models trained on millions of women's clothing reviews to understand fit, fabric, and style nuances.",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Analyze thousands of product reviews in seconds. Spot sizing issues before they become returns.",
  },
  {
    icon: BarChart3,
    title: "Style & Fit Analytics",
    description: "Dashboards built for apparel: track fit sentiment, fabric feedback, and trend patterns by category.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Understand your global shoppers—analyze reviews in 50+ languages with fashion-specific accuracy.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption. Your customer data stays protected.",
  },
  {
    icon: Sparkles,
    title: "Quality Alerts",
    description: "Get notified instantly when reviews flag quality issues, sizing problems, or trending complaints.",
  },
];

export default function Features() {
  return (
    <section id="platform" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sentio-500 font-semibold text-sm uppercase tracking-wider">
            Platform
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-midnight">
            Everything you need to understand your shoppers
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Powerful features built for women&apos;s fashion brands who want to turn reviews into product wins
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-sentio-100"
            >
              <div className="w-12 h-12 bg-sentio-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-sentio-100 transition-colors">
                <feature.icon className="w-6 h-6 text-sentio-500" />
              </div>
              <h3 className="text-lg font-semibold text-midnight mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

