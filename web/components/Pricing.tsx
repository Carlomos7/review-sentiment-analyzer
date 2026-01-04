"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "49",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5,000 reviews/month",
      "Basic sentiment analysis",
      "Email support",
      "7-day data retention",
      "1 team member",
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "149",
    description: "For growing teams who need more power",
    features: [
      "Up to 50,000 reviews/month",
      "Advanced AI analysis",
      "Priority support",
      "90-day data retention",
      "10 team members",
      "Custom dashboards",
      "API access",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with custom needs",
    features: [
      "Unlimited reviews",
      "Custom AI models",
      "24/7 dedicated support",
      "Unlimited retention",
      "Unlimited team members",
      "SSO & SAML",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sentio-500 font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-midnight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Start free for 14 days. No credit card required.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-midnight text-white shadow-xl scale-105"
                  : "bg-white shadow-sm border border-gray-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-sentio-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? "text-white" : "text-midnight"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? "text-gray-300" : "text-gray-500"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.price !== "Custom" && (
                    <span className={`text-lg ${plan.popular ? "text-gray-300" : "text-gray-500"}`}>$</span>
                  )}
                  <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-midnight"}`}>
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className={`${plan.popular ? "text-gray-300" : "text-gray-500"}`}>/mo</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-sentio-400" : "text-sentio-500"}`} />
                    <span className={plan.popular ? "text-gray-200" : "text-gray-600"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? "bg-sentio-500 text-white hover:bg-sentio-600"
                    : "bg-slate-100 text-midnight hover:bg-slate-200"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

