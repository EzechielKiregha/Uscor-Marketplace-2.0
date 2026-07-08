"use client";
import { useMutation } from "@apollo/client";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GENERATE_STORE_REPORT } from "@/graphql/store.gql";

export function ReportCard({ report, storeId, period }: any) {
  const [generating, setGenerating] = useState<string | null>(null);

  const IconComponent = report.icon;

  const [generateReport] = useMutation(GENERATE_STORE_REPORT);

  const handleGenerate = async () => {
    setGenerating(report.id);
    try {
      const { data } = await generateReport({
        variables: { input: { storeId, reportType: report.id, period } },
      });
      if (data.generateStoreReport?.reportUrl) {
        window.open(data.generateStoreReport.reportUrl, "_blank");
      }
    } catch (err) {
      console.error("Report generation failed", err);
      alert("Failed to generate report. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="p-4 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        {/* FIX: Render as a JSX element and apply the sizing/classes here */}
        <div className="p-3 rounded-lg text-orange-600">
          <IconComponent className="w-6 h-6" />
        </div>
        <span className="rounded-full bg-muted flex items-center justify-center text-sm font-bold p-2 text-foreground uppercase">
          {period}
        </span>
      </div>
      <h3 className="font-semibold text-lg">{report.name}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4 min-h-10">
        {report.desc}
      </p>
      <Button
        onClick={handleGenerate}
        variant="default"
        disabled={generating === report.id}
        className="w-full flex items-center justify-center cursor-pointer gap-2 py-2.5 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
      >
        {generating === report.id ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" /> Generate PDF
          </>
        )}
      </Button>
    </div>
  );
}
