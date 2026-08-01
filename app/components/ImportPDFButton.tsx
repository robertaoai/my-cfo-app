"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { WebLLMParser } from "./WebLLMParser";

export function ImportPDFButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
      >
        <FileText className="w-4 h-4" />
        Import PDF
      </button>

      {isOpen && <WebLLMParser onClose={() => setIsOpen(false)} />}
    </>
  );
}
