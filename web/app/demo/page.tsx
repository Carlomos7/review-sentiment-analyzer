"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ArrowUp, History, Trash2, Plus, Clock, Paperclip, BarChart3, ThumbsUp, ThumbsDown, ClipboardCheck, ScrollText, Download, Tag, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import sentioLogo from "@/assets/sentio-logo-blue.png";
import { AreaChart, BarChart } from "@tremor/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface AnalysisResult {
  id: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  timestamp: number;
  humanReview?: "agree" | "disagree";
  reviewedAt?: number;
  productId?: number;
}

const PRODUCT_CATEGORIES: Record<number, string> = {
  1: "Balenciaga Triple S Sneakers",
  2: "Tassel Ankle Boots",
  3: "Chanel Classic Flap Bag",
  4: "Reformation Floral Midi Dress",
  5: "Zara Oversized Blazer",
  6: "Gucci GG Marmont Shoulder Bag",
  7: "Dr. Martens 1460 Platform Boots",
};

const STORAGE_KEY = "sentio_analysis_history";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DemoPage() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [activeTab, setActiveTab] = useState<"analyze" | "analytics" | "review" | "logs">("analyze");
  const [selectedProduct, setSelectedProduct] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveToHistory = (newResult: AnalysisResult) => {
    setHistory((prev) => {
      const updated = [newResult, ...prev].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const saveBatchToHistory = (results: AnalysisResult[]) => {
    setHistory((prev) => {
      const updated = [...results, ...prev].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const parseCSV = (content: string): { review: string; productId?: number }[] => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return [];
    
    const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
    const reviewIndex = header.findIndex((h) => h === "review");
    const idIndex = header.findIndex((h) => h === "id");
    
    if (reviewIndex === -1) {
      alert('CSV must have a "review" column');
      return [];
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const review = values[reviewIndex]?.trim().replace(/^"|"$/g, "") || "";
      const rawId = idIndex !== -1 ? parseInt(values[idIndex]?.trim().replace(/^"|"$/g, ""), 10) : undefined;
      const productId = rawId && rawId >= 1 && rawId <= 7 ? rawId : undefined;
      return { review, productId };
    }).filter((item) => item.review.length > 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    const reviewItems = parseCSV(content);
    
    if (reviewItems.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsAnalyzing(true);
    setBatchProgress({ current: 0, total: reviewItems.length });
    setResult(null);

    const results: AnalysisResult[] = [];

    for (let i = 0; i < reviewItems.length; i++) {
      setBatchProgress({ current: i + 1, total: reviewItems.length });
      
      try {
        const response = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: reviewItems[i].review }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        results.push({
          id: crypto.randomUUID(),
          text: reviewItems[i].review.slice(0, 200),
          sentiment: data.label as "positive" | "neutral" | "negative",
          confidence: Math.floor(data.confidence * 100),
          timestamp: Date.now() - (reviewItems.length - i),
          productId: reviewItems[i].productId,
        });
      } catch {
        console.error(`Failed to analyze review ${i + 1}`);
      }
    }

    saveBatchToHistory(results);
    if (results.length > 0) setResult(results[0]);
    
    setIsAnalyzing(false);
    setBatchProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const deleteFromHistory = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (result?.id === id) setResult(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
  };

  const handleHumanReview = (id: string, review: "agree" | "disagree") => {
    setHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, humanReview: review, reviewedAt: Date.now() } : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    if (result?.id === id) {
      setResult((prev) => prev ? { ...prev, humanReview: review, reviewedAt: Date.now() } : null);
    }
  };

  const unreviewedItems = useMemo(() => history.filter((item) => !item.humanReview), [history]);
  const reviewedItems = useMemo(() => history.filter((item) => item.humanReview), [history]);

  const downloadLogsCSV = () => {
    const headers = ["Text", "Product", "Prediction", "Confidence", "Human Review", "Timestamp"];
    const rows = history.map((item) => [
      `"${item.text.replace(/"/g, '""')}"`,
      item.productId ? PRODUCT_CATEGORIES[item.productId] : "N/A",
      item.sentiment,
      `${item.confidence}%`,
      item.humanReview ? (item.humanReview === "agree" ? "Agreed" : "Disagreed") : "Pending",
      new Date(item.timestamp).toISOString(),
    ]);
    
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleDateString("en-US", { month: "long" });
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "p.m." : "a.m.";
    const hour12 = hours % 12 || 12;
    const timeStr = `${hour12}:${minutes} ${period}`;
    const filename = `Prediction Logs - ${day}, ${month}, ${year}, ${timeStr}.csv`;
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const newResult: AnalysisResult = {
        id: crypto.randomUUID(),
        text: text.slice(0, 200),
        sentiment: data.label as "positive" | "neutral" | "negative",
        confidence: Math.floor(data.confidence * 100),
        timestamp: Date.now(),
        productId: selectedProduct,
      };

      setResult(newResult);
      saveToHistory(newResult);
      setText("");
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to analyze. Make sure the API server is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectFromHistory = (item: AnalysisResult) => {
    setResult(item);
  };

  const sentimentColors = {
    positive: "bg-emerald-500",
    neutral: "bg-slate-500",
    negative: "bg-rose-500",
  };

  const sentimentBg = {
    positive: "bg-emerald-50 border-emerald-200",
    neutral: "bg-slate-50 border-slate-200",
    negative: "bg-rose-50 border-rose-200",
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const analyticsData = useMemo(() => {
    if (history.length === 0) return null;

    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    history.forEach((item) => sentimentCounts[item.sentiment]++);

    const donutData = [
      { name: "Positive", value: sentimentCounts.positive, fill: "#10b981" },
      { name: "Neutral", value: sentimentCounts.neutral, fill: "#f59e0b" },
      { name: "Negative", value: sentimentCounts.negative, fill: "#f43f5e" },
    ].filter((d) => d.value > 0);

    const avgConfidence = Math.round(
      history.reduce((sum, item) => sum + item.confidence, 0) / history.length
    );

    const sortedHistory = [...history].sort((a, b) => a.timestamp - b.timestamp);
    const timelineMap = new Map<string, { positive: number; neutral: number; negative: number }>();
    
    sortedHistory.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!timelineMap.has(date)) {
        timelineMap.set(date, { positive: 0, neutral: 0, negative: 0 });
      }
      const counts = timelineMap.get(date)!;
      counts[item.sentiment]++;
    });

    const timelineData = Array.from(timelineMap.entries()).map(([date, counts]) => ({
      date,
      Positive: counts.positive,
      Neutral: counts.neutral,
      Negative: counts.negative,
    }));

    const confidenceByDay = new Map<string, { sum: number; count: number }>();
    sortedHistory.forEach((item) => {
      const date = new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!confidenceByDay.has(date)) {
        confidenceByDay.set(date, { sum: 0, count: 0 });
      }
      const data = confidenceByDay.get(date)!;
      data.sum += item.confidence;
      data.count++;
    });

    const confidenceData = Array.from(confidenceByDay.entries()).map(([date, data]) => ({
      date,
      Confidence: Math.round(data.sum / data.count),
    }));

    // Human-in-the-loop validation metrics
    const reviewed = history.filter((item) => item.humanReview);
    const agreed = reviewed.filter((item) => item.humanReview === "agree");
    const disagreed = reviewed.filter((item) => item.humanReview === "disagree");
    
    const agreementRate = reviewed.length > 0 ? Math.round((agreed.length / reviewed.length) * 100) : 0;
    const reviewCoverage = history.length > 0 ? Math.round((reviewed.length / history.length) * 100) : 0;

    // Agreement rate by sentiment
    const agreementBySentiment = (["positive", "neutral", "negative"] as const).map((sentiment) => {
      const sentimentItems = reviewed.filter((item) => item.sentiment === sentiment);
      const sentimentAgreed = sentimentItems.filter((item) => item.humanReview === "agree");
      return {
        sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
        "Agreement Rate": sentimentItems.length > 0 ? Math.round((sentimentAgreed.length / sentimentItems.length) * 100) : 0,
        total: sentimentItems.length,
      };
    }).filter((d) => d.total > 0);

    // Confidence vs accuracy (binned)
    const confidenceBins = [
      { range: "50-60%", min: 50, max: 60 },
      { range: "60-70%", min: 60, max: 70 },
      { range: "70-80%", min: 70, max: 80 },
      { range: "80-90%", min: 80, max: 90 },
      { range: "90-100%", min: 90, max: 100 },
    ];
    
    const confidenceAccuracy = confidenceBins.map(({ range, min, max }) => {
      const binItems = reviewed.filter((item) => item.confidence >= min && item.confidence < max);
      const binAgreed = binItems.filter((item) => item.humanReview === "agree");
      return {
        range,
        "Accuracy": binItems.length > 0 ? Math.round((binAgreed.length / binItems.length) * 100) : 0,
        count: binItems.length,
      };
    }).filter((d) => d.count > 0);

    // Review status breakdown for donut
    const reviewStatusData = [
      { name: "Agreed", value: agreed.length, fill: "#10b981" },
      { name: "Disagreed", value: disagreed.length, fill: "#f43f5e" },
      { name: "Pending", value: history.length - reviewed.length, fill: "#94a3b8" },
    ].filter((d) => d.value > 0);

    // Average confidence for agreed vs disagreed
    const avgConfidenceAgreed = agreed.length > 0 
      ? Math.round(agreed.reduce((sum, item) => sum + item.confidence, 0) / agreed.length) 
      : 0;
    const avgConfidenceDisagreed = disagreed.length > 0 
      ? Math.round(disagreed.reduce((sum, item) => sum + item.confidence, 0) / disagreed.length) 
      : 0;

    return { 
      sentimentCounts, 
      donutData, 
      avgConfidence, 
      timelineData, 
      confidenceData,
      agreementRate,
      reviewCoverage,
      agreementBySentiment,
      confidenceAccuracy,
      reviewStatusData,
      avgConfidenceAgreed,
      avgConfidenceDisagreed,
      reviewedCount: reviewed.length,
      agreedCount: agreed.length,
      disagreedCount: disagreed.length,
    };
  }, [history]);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <Image src={sentioLogo} alt="Sentio" width={36} height={36} />
            </div>
            <span className="font-semibold text-slate-800 text-lg">Sentio</span>
          </Link>
        </div>

        <div className="p-3 space-y-1">
          <button
            onClick={() => { setActiveTab("analyze"); setResult(null); setText(""); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === "analyze"
                ? "bg-sentio-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Reviews
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === "analytics"
                ? "bg-sentio-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === "review"
                ? "bg-sentio-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Review
            </span>
            {unreviewedItems.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === "review" ? "bg-white/20" : "bg-amber-100 text-amber-700"
              }`}>
                {unreviewedItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === "logs"
                ? "bg-sentio-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <ScrollText className="w-4 h-4" />
            Logs
          </button>
        </div>

        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 text-slate-500">
            <History className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">History</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8 px-4">
              No analyses yet. Start by entering some text!
            </p>
          ) : (
            <div className="space-y-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectFromHistory(item)}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                    result?.id === item.id
                      ? "bg-sentio-50 border border-sentio-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{item.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${sentimentColors[item.sentiment]}`}
                        />
                        <span className="text-xs text-slate-500 capitalize">
                          {item.sentiment}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{item.confidence}%</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatTime(item.timestamp)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFromHistory(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-slate-800">
            {activeTab === "analyze" && "Sentiment Analysis"}
            {activeTab === "analytics" && "Analytics Dashboard"}
            {activeTab === "review" && "Human Review"}
            {activeTab === "logs" && "Prediction Logs"}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "analyze" && (
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to analyze sentiment..."
                  className="w-full h-32 bg-transparent px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white rounded-lg text-slate-600 hover:text-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach
                    </button>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(Number(e.target.value))}
                        className="appearance-none pl-9 pr-8 py-1.5 border border-slate-200 hover:border-slate-300 bg-white rounded-lg text-slate-600 hover:text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sentio-500/50 transition-all cursor-pointer"
                      >
                        {Object.entries(PRODUCT_CATEGORIES).map(([id, name]) => (
                          <option key={id} value={id}>{name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <span className="text-xs text-slate-400">{text.length} chars</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {batchProgress && (
                      <span className="text-xs text-sentio-600 font-medium">
                        {batchProgress.current}/{batchProgress.total} reviews
                      </span>
                    )}
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
              </motion.div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-6 rounded-xl border p-6 ${sentimentBg[result.sentiment]}`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 mb-1">Analyzed Text</p>
                      <p className="text-slate-700 mb-4">{result.text}</p>
                      {result.productId && (
                        <>
                          <p className="text-sm text-slate-500 mb-1">Product</p>
                          <p className="text-slate-700 mb-4">{PRODUCT_CATEGORIES[result.productId]}</p>
                        </>
                      )}
                      <p className="text-sm text-slate-500 mb-1">Detected Sentiment</p>
                      <p className="text-2xl font-bold capitalize text-slate-800">
                        {result.sentiment}
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`w-20 h-20 rounded-full ${sentimentColors[result.sentiment]} flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-xl">
                          {result.confidence}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Confidence</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200/50">
                    <p className="text-sm text-slate-500 mb-2">Is this prediction correct?</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleHumanReview(result.id, "agree")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          result.humanReview === "agree"
                            ? "bg-emerald-500 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Agree
                      </button>
                      <button
                        onClick={() => handleHumanReview(result.id, "disagree")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          result.humanReview === "disagree"
                            ? "bg-rose-500 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        Disagree
                      </button>
                      {result.humanReview && (
                        <span className="text-xs text-slate-400 ml-2">Reviewed ✓</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {!result && !isAnalyzing && (
                <div className="mt-12 text-center text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Enter text or attach a CSV to analyze sentiment</p>
                  <p className="text-sm mt-1">CSV should have &quot;review&quot; column (required) and &quot;id&quot; column (optional, 1-7)</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="max-w-5xl mx-auto space-y-6">
              {!analyticsData ? (
                <div className="text-center text-slate-400 py-16">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No data to display yet</p>
                  <p className="text-sm mt-1">Analyze some text to see your analytics</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl p-5 border border-slate-200"
                    >
                      <p className="text-sm text-slate-500">Total Analyses</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">{history.length}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="bg-emerald-50 rounded-xl p-5 border border-emerald-200"
                    >
                      <p className="text-sm text-emerald-600">Positive</p>
                      <p className="text-3xl font-bold text-emerald-700 mt-1">{analyticsData.sentimentCounts.positive}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-amber-50 rounded-xl p-5 border border-amber-200"
                    >
                      <p className="text-sm text-amber-600">Neutral</p>
                      <p className="text-3xl font-bold text-amber-700 mt-1">{analyticsData.sentimentCounts.neutral}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-rose-50 rounded-xl p-5 border border-rose-200"
                    >
                      <p className="text-sm text-rose-600">Negative</p>
                      <p className="text-3xl font-bold text-rose-700 mt-1">{analyticsData.sentimentCounts.negative}</p>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl p-6 border border-slate-200"
                    >
                      <h3 className="text-sm font-medium text-slate-700 mb-4">Sentiment Distribution</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={analyticsData.donutData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            strokeWidth={2}
                            stroke="#fff"
                          >
                            {analyticsData.donutData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [value, name]}
                            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-white rounded-xl p-6 border border-slate-200"
                    >
                      <h3 className="text-sm font-medium text-slate-700 mb-4">Average Confidence</h3>
                      <div className="flex items-center justify-center h-52">
                        <div className="text-center">
                          <p className="text-6xl font-bold text-sentio-500">{analyticsData.avgConfidence}%</p>
                          <p className="text-slate-500 mt-2">model confidence</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {analyticsData.timelineData.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl p-6 border border-slate-200"
                    >
                      <h3 className="text-sm font-medium text-slate-700 mb-4">Sentiment Over Time</h3>
                      <AreaChart
                        data={analyticsData.timelineData}
                        index="date"
                        categories={["Positive", "Neutral", "Negative"]}
                        colors={["emerald", "amber", "rose"]}
                        className="h-64"
                        showAnimation
                      />
                    </motion.div>
                  )}

                  {analyticsData.confidenceData.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-white rounded-xl p-6 border border-slate-200"
                    >
                      <h3 className="text-sm font-medium text-slate-700 mb-4">Confidence Trend</h3>
                      <BarChart
                        data={analyticsData.confidenceData}
                        index="date"
                        categories={["Confidence"]}
                        colors={["blue"]}
                        className="h-64"
                        showAnimation
                      />
                    </motion.div>
                  )}

                  {/* Human-in-the-Loop Validation Section */}
                  {analyticsData.reviewedCount > 0 && (
                    <>
                      <div className="pt-6 border-t border-slate-200 mt-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <ClipboardCheck className="w-5 h-5 text-sentio-500" />
                          Human-in-the-Loop Validation
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-white rounded-xl p-5 border border-slate-200"
                        >
                          <p className="text-sm text-slate-500">Review Coverage</p>
                          <p className="text-3xl font-bold text-slate-800 mt-1">{analyticsData.reviewCoverage}%</p>
                          <p className="text-xs text-slate-400 mt-1">{analyticsData.reviewedCount} of {history.length} reviewed</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                          className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200"
                        >
                          <p className="text-sm text-emerald-600">Agreement Rate</p>
                          <p className="text-3xl font-bold text-emerald-700 mt-1">{analyticsData.agreementRate}%</p>
                          <p className="text-xs text-emerald-500 mt-1">Model accuracy</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-white rounded-xl p-5 border border-slate-200"
                        >
                          <p className="text-sm text-slate-500">Avg Confidence (Agreed)</p>
                          <p className="text-3xl font-bold text-emerald-600 mt-1">{analyticsData.avgConfidenceAgreed}%</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.55 }}
                          className="bg-white rounded-xl p-5 border border-slate-200"
                        >
                          <p className="text-sm text-slate-500">Avg Confidence (Disagreed)</p>
                          <p className="text-3xl font-bold text-rose-600 mt-1">{analyticsData.avgConfidenceDisagreed}%</p>
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bg-white rounded-xl p-6 border border-slate-200"
                        >
                          <h3 className="text-sm font-medium text-slate-700 mb-4">Review Status</h3>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={analyticsData.reviewStatusData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                strokeWidth={2}
                                stroke="#fff"
                              >
                                {analyticsData.reviewStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number, name: string) => [value, name]}
                                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex justify-center gap-4 mt-2">
                            <span className="flex items-center gap-1.5 text-xs text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Agreed
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Disagreed
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-slate-600">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Pending
                            </span>
                          </div>
                        </motion.div>

                        {analyticsData.agreementBySentiment.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            className="bg-white rounded-xl p-6 border border-slate-200"
                          >
                            <h3 className="text-sm font-medium text-slate-700 mb-4">Accuracy by Sentiment</h3>
                            <ResponsiveContainer width="100%" height={200}>
                              <RechartsBarChart data={analyticsData.agreementBySentiment}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="sentiment" tick={{ fontSize: 12 }} stroke="#64748b" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip formatter={(value: number) => [`${value}%`, "Agreement Rate"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                                <Bar dataKey="Agreement Rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                              </RechartsBarChart>
                            </ResponsiveContainer>
                          </motion.div>
                        )}
                      </div>

                      {analyticsData.confidenceAccuracy.length > 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                          className="bg-white rounded-xl p-6 border border-slate-200"
                        >
                          <h3 className="text-sm font-medium text-slate-700 mb-2">Confidence vs Accuracy</h3>
                          <p className="text-xs text-slate-400 mb-4">Does higher model confidence correlate with human agreement?</p>
                          <ResponsiveContainer width="100%" height={250}>
                            <RechartsBarChart data={analyticsData.confidenceAccuracy}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#64748b" />
                              <YAxis tick={{ fontSize: 12 }} stroke="#64748b" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                              <Tooltip formatter={(value: number) => [`${value}%`, "Accuracy"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                              <Bar dataKey="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </motion.div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "review" && (
            <div className="max-w-4xl mx-auto">
              {unreviewedItems.length === 0 ? (
                <div className="text-center text-slate-400 py-16">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>All caught up!</p>
                  <p className="text-sm mt-1">No predictions waiting for review</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unreviewedItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className={`bg-white rounded-xl border p-5 ${sentimentBg[item.sentiment]}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700">{item.text}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" :
                              item.sentiment === "negative" ? "bg-rose-100 text-rose-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {item.sentiment}
                            </span>
                            <span className="text-xs text-slate-400">{item.confidence}% confidence</span>
                            <span className="text-xs text-slate-400">{formatTime(item.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleHumanReview(item.id, "agree")}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                            title="Agree with prediction"
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleHumanReview(item.id, "disagree")}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Disagree with prediction"
                          >
                            <ThumbsDown className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="max-w-5xl mx-auto">
              {history.length === 0 ? (
                <div className="text-center text-slate-400 py-16">
                  <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No logs yet</p>
                  <p className="text-sm mt-1">Analyze some text to see prediction logs</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <p className="text-sm text-slate-500">Total Predictions</p>
                      <p className="text-2xl font-bold text-slate-800">{history.length}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <p className="text-sm text-emerald-600">Agreed</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {reviewedItems.filter((i) => i.humanReview === "agree").length}
                      </p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                      <p className="text-sm text-rose-600">Disagreed</p>
                      <p className="text-2xl font-bold text-rose-700">
                        {reviewedItems.filter((i) => i.humanReview === "disagree").length}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden max-h-[500px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 bg-slate-50">Text</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 bg-slate-50">Product</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 bg-slate-50">Prediction</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 bg-slate-50">Confidence</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 bg-slate-50">Human Review</th>
                          <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3 bg-slate-50">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {history.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{item.text}</td>
                            <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">
                              {item.productId ? PRODUCT_CATEGORIES[item.productId] : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" :
                                item.sentiment === "negative" ? "bg-rose-100 text-rose-700" :
                                "bg-amber-100 text-amber-700"
                              }`}>
                                {item.sentiment}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{item.confidence}%</td>
                            <td className="px-4 py-3">
                              {item.humanReview ? (
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                                  item.humanReview === "agree" ? "text-emerald-600" : "text-rose-600"
                                }`}>
                                  {item.humanReview === "agree" ? (
                                    <><ThumbsUp className="w-3 h-3" /> Agreed</>
                                  ) : (
                                    <><ThumbsDown className="w-3 h-3" /> Disagreed</>
                                  )}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Pending</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">{formatTime(item.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={downloadLogsCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-sentio-500 hover:bg-sentio-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download CSV
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

