"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, AlertTriangle, Settings2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ExtractedData {
  ticker: string;
  dividend_total: number;
  withholding_tax: number;
}

export function WebLLMParser({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  
  // Worker State
  const workerRef = useRef<Worker | null>(null);
  const [status, setStatus] = useState<"idle" | "initializing" | "ready" | "failed" | "parsing" | "review">("idle");
  const [progressText, setProgressText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  
  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [modelId, setModelId] = useState("Llama-3.2-1B-Instruct-q4f16_1-MLC");
  const [contextWindow, setContextWindow] = useState(2048);
  const [prefillChunk, setPrefillChunk] = useState(1024);

  useEffect(() => {
    // Initialize Web Worker safely
    workerRef.current = new Worker(new URL("../../lib/workers/pdf-llm.worker.ts", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = (e) => {
      const { type, payload, error } = e.data;
      if (type === "PROGRESS") {
        setProgressText(payload.text);
      } else if (type === "INIT_SUCCESS") {
        setStatus("ready");
        toast.success("AI Model loaded securely in your browser!");
      } else if (type === "INIT_FAILED") {
        setStatus("failed");
        setErrorMsg(error || "WebGPU Initialization Failed");
        setShowConfig(true); // Force fallback panel open
      } else if (type === "PROCESS_SUCCESS") {
        setExtractedData(payload);
        setStatus("review");
      } else if (type === "PROCESS_ERROR") {
        setStatus("ready");
        toast.error("Failed to parse: " + error);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleInit = () => {
    if (!workerRef.current) return;
    setStatus("initializing");
    setErrorMsg("");
    workerRef.current.postMessage({
      type: "INIT",
      payload: { modelId, contextWindowSize: contextWindow, prefillChunkSize: prefillChunk },
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }

    if (status !== "ready") {
      toast.error("Please wait for the AI model to initialize first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      if (arrayBuffer) {
        setStatus("parsing");
        workerRef.current?.postMessage({
          type: "PROCESS_PDF",
          payload: { fileBlob: arrayBuffer },
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div>
            <h2 className="text-lg font-medium text-white">Import PDF Statements</h2>
            <p className="text-sm text-neutral-400">100% Local AI parsing. No data leaves your device.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-neutral-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* Status Banner */}
          {status === "idle" && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
              <span className="text-sm text-blue-400">AI Model not loaded yet.</span>
              <button 
                onClick={handleInit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Load Local Model
              </button>
            </div>
          )}

          {status === "initializing" && (
            <div className="mb-6 p-4 bg-neutral-800 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">Initializing WebGPU Engine...</p>
                <p className="text-xs text-neutral-400 mt-1">{progressText || "Downloading model chunks..."}</p>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
                <AlertTriangle className="w-5 h-5" />
                Initialization Failed
              </div>
              <p className="text-sm text-red-400/80 mb-3">{errorMsg}</p>
              <p className="text-xs text-neutral-400">Your device might not have enough VRAM for these settings. Try lowering the context size or chunk size below.</p>
            </div>
          )}

          {/* Config Panel */}
          {(showConfig || status === "idle" || status === "failed") && status !== "initializing" && status !== "parsing" && (
            <div className="mb-6 p-4 border border-white/10 rounded-xl bg-black/50">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-neutral-400" />
                <h3 className="text-sm font-medium text-white">Fallback Configuration</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Model Selection</label>
                  <select 
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full bg-neutral-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Llama-3.2-1B-Instruct-q4f16_1-MLC">Llama-3.2 1B (q4f16) - Recommended</option>
                    <option value="Llama-3.2-1B-Instruct-q4f32_1-MLC">Llama-3.2 1B (q4f32) - Higher Precision</option>
                    <option value="TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC">TinyLlama 1.1B - Ultra Light</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Context Window Size ({contextWindow})</label>
                    <input 
                      type="range" min="512" max="4096" step="512" 
                      value={contextWindow} 
                      onChange={(e) => setContextWindow(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Prefill Chunk Size ({prefillChunk})</label>
                    <input 
                      type="range" min="256" max="2048" step="256" 
                      value={prefillChunk} 
                      onChange={(e) => setPrefillChunk(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {status === "failed" && (
                  <button 
                    onClick={handleInit}
                    className="w-full mt-2 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Retry Initialization
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {(status === "ready" || status === "parsing") && (
            <div className="mb-6">
              <label className={`
                flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer
                transition-colors
                ${status === "parsing" ? "border-blue-500/50 bg-blue-500/5 cursor-wait" : "border-white/20 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.04]"}
              `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {status === "parsing" ? (
                    <>
                      <Loader2 className="w-8 h-8 text-blue-500 mb-2 animate-spin" />
                      <p className="text-sm text-blue-400">{progressText}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                      <p className="text-sm text-white font-medium mb-1">Click to upload statement</p>
                      <p className="text-xs text-neutral-500">PDF formats only</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  disabled={status === "parsing"}
                />
              </label>
            </div>
          )}

          {/* Review Step */}
          {status === "review" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Extracted Distributions</h3>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  Please verify before saving
                </span>
              </div>
              
              {extractedData.length === 0 ? (
                <div className="p-4 text-center text-sm text-neutral-400 bg-black/50 rounded-xl border border-white/5">
                  No dividends found in this document.
                </div>
              ) : (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-neutral-400">
                      <tr>
                        <th className="px-4 py-2 font-medium">Ticker</th>
                        <th className="px-4 py-2 font-medium text-right">Dividend Total</th>
                        <th className="px-4 py-2 font-medium text-right">Withholding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {extractedData.map((d, idx) => (
                        <tr key={idx} className="bg-black/20">
                          <td className="px-4 py-2 text-white font-medium">{d.ticker}</td>
                          <td className="px-4 py-2 text-right text-white tabular-nums">${d.dividend_total.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-red-400 tabular-nums">-${d.withholding_tax.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setStatus("ready")}
                  className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Discard & Try Another
                </button>
                <button 
                  onClick={() => {
                    toast.success("Feature coming soon: Save to DB");
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Save
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
