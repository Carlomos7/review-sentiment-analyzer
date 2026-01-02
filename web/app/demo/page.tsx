"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ArrowUp } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    sentiment: "positive" | "neutral" | "negative";
    confidence: number;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sentiments = ["positive", "neutral", "negative"] as const;
    const randomSentiment = sentiments[Math.floor(Math.random() * 3)];
    setResult({
      sentiment: randomSentiment,
      confidence: Math.floor(Math.random() * 20) + 80,
    });
    setIsAnalyzing(false);
  };

  const sentimentColors = {
    positive: "from-emerald-400 to-emerald-500",
    neutral: "from-slate-400 to-slate-500",
    negative: "from-rose-400 to-rose-500",
  };

  const sentimentBg = {
    positive: "bg-emerald-50 border-emerald-200",
    neutral: "bg-slate-50 border-slate-200",
    negative: "bg-rose-50 border-rose-200",
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-sentio-100/60 via-sentio-50/30 to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sentio-200/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sentio-400 to-sentio-600 rounded-lg" />
            <span className="font-semibold text-slate-800">Sentio</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Analyze Sentiment
            </h1>
            <p className="text-slate-500">
              Enter text below to instantly analyze its sentiment
            </p>
          </div>

          {/* Input card - Lovable style */}
          <div className="bg-[#faf9f7] rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your review, feedback, or any text here..."
              className="w-full h-24 bg-transparent px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
            />
            
            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/50">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400 px-2">
                  {text.length} characters
                </span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || isAnalyzing}
                className="w-9 h-9 bg-sentio-500 hover:bg-sentio-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`mt-6 rounded-2xl border p-6 ${sentimentBg[result.sentiment]}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Detected Sentiment</p>
                  <p className="text-2xl font-bold capitalize text-slate-800">
                    {result.sentiment}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${sentimentColors[result.sentiment]} flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-lg">
                    {result.confidence}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

