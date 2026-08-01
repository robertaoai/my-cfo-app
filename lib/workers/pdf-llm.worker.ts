/// <reference lib="webworker" />

import { CreateMLCEngine, MLCEngine, InitProgressReport } from "@mlc-ai/web-llm";
import * as pdfjsLib from "pdfjs-dist";

// Explicitly tell PDF.js where to find its worker to avoid bundler issues
// We use the exact version we installed via CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

let engine: MLCEngine | null = null;

const SYSTEM_PROMPT = `You are a financial data extraction assistant. 
You will be provided with raw text parsed from a Moomoo monthly statement PDF.
Extract all dividend payments and their corresponding withholding taxes.
Return the result STRICTLY as a JSON array of objects with keys: "ticker" (string, e.g. "ARMW"), "dividend_total" (number), "withholding_tax" (number).
Do not include any markdown formatting, explanations, or other text. Just the JSON array.
If no dividends are found, return [].`;

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  if (type === "INIT") {
    const { modelId, contextWindowSize, prefillChunkSize } = payload;
    try {
      // Destroy existing engine if any
      if (engine) {
        // engine.destroy() might not exist or be necessary, but we recreate it
        engine = null;
      }

      const initProgressCallback = (report: InitProgressReport) => {
        self.postMessage({ type: "PROGRESS", payload: report });
      };

      engine = await CreateMLCEngine(
        modelId,
        { initProgressCallback },
        { 
          context_window_size: contextWindowSize,
          model_config: { prefill_chunk_size: prefillChunkSize }
        }
      );

      self.postMessage({ type: "INIT_SUCCESS" });
    } catch (error: any) {
      engine = null;
      console.error("WebLLM Init Error:", error);
      self.postMessage({ type: "INIT_FAILED", error: error?.message || String(error) });
    }
  }

  if (type === "PROCESS_PDF") {
    if (!engine) {
      self.postMessage({ type: "PROCESS_ERROR", error: "Engine not initialized" });
      return;
    }

    try {
      const { fileBlob } = payload; // ArrayBuffer
      
      self.postMessage({ type: "PROGRESS", payload: { text: "Parsing PDF..." } });
      
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(fileBlob) }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      self.postMessage({ type: "PROGRESS", payload: { text: "Running LLM Extraction..." } });

      const reply = await engine.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: fullText }
        ],
        temperature: 0.1,
        // Optional JSON mode if supported by WebLLM, but usually manual is fine for instruct models
      });

      const extractedRaw = reply.choices[0]?.message.content || "[]";
      
      // Attempt to parse the JSON
      try {
        // Sometimes LLMs wrap in ```json ... ```
        const cleanJson = extractedRaw.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        self.postMessage({ type: "PROCESS_SUCCESS", payload: parsed });
      } catch (e) {
        self.postMessage({ type: "PROCESS_ERROR", error: "Failed to parse JSON from LLM: " + extractedRaw });
      }

    } catch (error: any) {
      console.error("Process Error:", error);
      self.postMessage({ type: "PROCESS_ERROR", error: error?.message || String(error) });
    }
  }
};
