"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export function ExportButton({ data, filename }: { data: any[]; filename: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      if (!data || data.length === 0) {
        alert("No data to export");
        return;
      }

      // Extract headers from the first object
      const headers = Object.keys(data[0]);
      
      // Convert data array to CSV string
      const csvRows = [];
      csvRows.push(headers.join(',')); // Add headers row
      
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          // Handle nulls and escape quotes/commas
          if (val === null || val === undefined) return '""';
          const strVal = String(val);
          if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
            return `"${strVal.replace(/"/g, '""')}"`;
          }
          return strVal;
        });
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export CSV.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
    >
      <Download className="w-3.5 h-3.5" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </button>
  );
}
