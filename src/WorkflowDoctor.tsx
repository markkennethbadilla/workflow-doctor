"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FileJson,
    Activity,
    Zap,
    AlertTriangle,
    CheckCircle2,
    Play,
    Download,
    Share2
} from "lucide-react"
// Note: In the standalone repo, simpler imports or mock service might be needed.
import { generateAIResponse } from "@/lib/ai-service"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Node {
    name: string
    type: string
    position: [number, number]
}

interface Workflow {
    name: string
    nodes: Node[]
    connections: Record<string, unknown>
}

export default function WorkflowDoctor() {
    const [activeTab, setActiveTab] = useState<"visual" | "json">("visual")
    const [workflow, setWorkflow] = useState<Workflow | null>(null)
    const [loading, setLoading] = useState(false)
    const [analysis, setAnalysis] = useState<{ text: string, model: string } | null>(null)
    const [healthScore, setHealthScore] = useState(0)

    // Load demo data on mount
    useEffect(() => {
        // In the standalone repo, ensure these files exist in /public/demo-workflows
        fetch("/demo-workflows/email-classifier.json")
            .then(res => res.json())
            .then(data => setWorkflow(data))
    }, [])

    const handleAnalyze = async () => {
        if (!workflow) return
        setLoading(true)
        setAnalysis(null)

        const prompt = `Analyze this n8n workflow: ${JSON.stringify(workflow.nodes.map(n => ({ name: n.name, type: n.type })))}. 
    Provide exactly 3 short bullet points (~10 words each) on improvements.
    CRITICAL: You MUST start every line with a hyphen (-).
    
    Example:
    - Add error handling node.
    - Remove redundant webhooks.
    - Optimize HTTP request batching.
    
    Your Output (Exactly 3 bullets):`

        const res = await generateAIResponse(prompt, "You are an expert n8n workflow engineer. Be concise.")

        setAnalysis({ text: res.text, model: res.model || "AI Model" })

        // Deterministic Health Score Calculation
        // Base score starts at 100 and deducts for patterns
        let score = 100
        const nodes = workflow.nodes

        // 1. Error Handling Check (+10 if present, -20 if missing for complex workflows)
        const hasErrorNodes = nodes.some(n => n.type.toLowerCase().includes("error") || n.type.includes("catch"))
        if (!hasErrorNodes && nodes.length > 5) score -= 20

        // 2. Loop Detection (HTTP requests inside loops are risky)
        // Simple heuristic: if we have MANY nodes, assume risk increases
        if (nodes.length > 10) score -= 5
        if (nodes.length > 20) score -= 10

        // 3. Trigger Hygiene
        const triggers = nodes.filter(n => n.type.toLowerCase().includes("trigger") || n.type.toLowerCase().includes("webhook"))
        if (triggers.length === 0) score -= 10 // A workflow usually needs a trigger
        if (triggers.length > 2) score -= 5  // Multiple triggers can be confusing

        // 4. Node Type Specifics
        const heavyNodes = nodes.filter(n => n.type.includes("Code") || n.type.includes("Function"))
        if (heavyNodes.length > 3) score -= 5 // Too much custom code reduces maintainability

        // 5. Naming Convention (Mock check)
        // If many nodes allow "Node 1", "Node 21" etc
        const defaultNamed = nodes.filter(n => n.name.match(/Node \d+/))
        if (defaultNamed.length > 0) score -= (defaultNamed.length * 2)

        // Clamp score between 0 and 100
        setHealthScore(Math.max(0, Math.min(100, score)))

        setLoading(false)
    }

    const loadDemo = (type: "email" | "lead") => {
        setLoading(false)
        setAnalysis(null)
        setHealthScore(0)
        fetch(`/demo-workflows/${type === "email" ? "email-classifier" : "lead-enrichment"}.json`)
            .then(res => res.json())
            .then(data => setWorkflow(data))
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Workflow Doctor</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered n8n Diagnostic Tool</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => loadDemo("email")}
                        className="text-xs px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Load Email Classifier
                    </button>
                    <button
                        onClick={() => loadDemo("lead")}
                        className="text-xs px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Load Enrichment
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Preview */}
                <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab("visual")}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "visual" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"}`}
                            >
                                Visual Graph
                            </button>
                            <button
                                onClick={() => setActiveTab("json")}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === "json" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"}`}
                            >
                                Raw JSON
                            </button>
                        </div>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !workflow}
                            className="flex items-center gap-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>Analyzing...</>
                            ) : (
                                <>
                                    <Zap className="w-3.5 h-3.5" />
                                    Run Diagnostics
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-8 relative">
                        <AnimatePresence mode="wait">
                            {activeTab === "visual" && workflow ? (
                                // ... (Visual graph code remains same)
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative min-h-[400px] flex items-center justify-center"
                                >
                                    {/* Simplified Node Graph Visualization */}
                                    <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-md">
                                        {workflow.nodes.map((node, i) => (
                                            <div key={i} className="relative group w-full flex flex-col items-center">
                                                {/* Connection Line */}
                                                {i > 0 && (
                                                    <div className="absolute -top-8 w-px h-8 bg-slate-300 dark:bg-slate-700" />
                                                )}

                                                <motion.div
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-md group-hover:border-orange-500/50 transition-all cursor-default"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${node.type.includes("trigger") || node.type.includes("webhook") ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                            node.type.includes("google") || node.type.includes("ai") ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                                                                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                            }`}>
                                                            <Activity className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">{node.name}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono">{node.type.split(".").pop()}</div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Background Grid Pattern */}
                                    <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
                                        style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "20px 20px" }}
                                    />
                                </motion.div>
                            ) : activeTab === "json" && workflow ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-pre"
                                >
                                    {JSON.stringify(workflow, null, 2)}
                                </motion.div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                    Select a workflow to begin
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Panel: Diagnostics */}
                {/* ... existing diagnostics panel ... */}
                <AnimatePresence>
                    {analysis && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex flex-col"
                        >
                            <div className="p-6 space-y-6 overflow-y-auto">
                                {/* Health Score */}
                                <div className="text-center">
                                    <div className="text-sm text-slate-500 mb-2">Health Score</div>
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="w-24 h-24 transform -rotate-90">
                                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - healthScore / 100)} className={`${healthScore > 80 ? 'text-emerald-500' : 'text-amber-500'} transition-all duration-1000 ease-out`} />
                                        </svg>
                                        <span className="absolute text-2xl font-bold text-slate-900 dark:text-slate-100">{healthScore}</span>
                                    </div>
                                </div>

                                {/* Analysis Results using local LLM output */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4 text-orange-500" />
                                        AI Optimization Tips
                                        <span className="text-[10px] font-normal text-slate-400 ml-auto">({analysis.model})</span>
                                    </h3>
                                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {analysis.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex gap-3">
                                        <div className="mt-0.5">
                                            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">Speed Optimization</h4>
                                            <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">Replacing HTTP nodes with direct SDK integrations where possible can reduce latency by ~150ms per call.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962l6.135-1.583A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0l1.583 6.135a2 2 0 0 0 1.437 1.437l6.135 1.583a.5.5 0 0 1 0 .962l-6.135 1.583a2 2 0 0 0-1.437 1.437l-1.583 6.135a.5.5 0 0 1-.962 0z" />
        </svg>
    )
}
