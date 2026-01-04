"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Sentio helped us identify a critical product issue within hours of launch. The real-time sentiment analysis is a game-changer.",
    author: "Sarah Chen",
    role: "VP of Product",
    company: "TechFlow",
    avatar: "SC",
  },
  {
    quote: "We went from manually reading thousands of reviews to having instant insights. Our response time dropped by 80%.",
    author: "Marcus Johnson",
    role: "Customer Success Lead",
    company: "RetailBox",
    avatar: "MJ",
  },
  {
    quote: "The multi-language support is incredible. We can now understand our global customers without translation delays.",
    author: "Elena Rodriguez",
    role: "Head of CX",
    company: "GlobalShop",
    avatar: "ER",
  },
];

const logos = [
  "TechCorp", "DataFlow", "CloudBase", "ScaleUp", "GrowthLabs", "NextGen"
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Trusted by */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-8">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {logos.map((logo) => (
              <div key={logo} className="text-2xl font-bold text-gray-300 hover:text-gray-400 transition-colors">
                {logo}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sentio-400 to-sentio-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-midnight">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

