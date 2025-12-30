import React, { useEffect, useState } from 'react';
import { ZLDScenario, WaterAnalysis } from '../types';
import { generateReport } from '../services/geminiService';
import { FileText, Cpu } from './Icons';

interface ReportViewProps {
  scenario: ZLDScenario | null;
  analysis: WaterAnalysis | null;
}

const ReportView: React.FC<ReportViewProps> = ({ scenario, analysis }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scenario && analysis && !report) {
      setLoading(true);
      generateReport(scenario, analysis)
        .then(setReport)
        .catch(err => setReport("خطا در تولید گزارش"))
        .finally(() => setLoading(false));
    }
  }, [scenario, analysis]);

  if (!scenario || !analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
        <FileText className="w-16 h-16 opacity-50" />
        <p>لطفا ابتدا یک سناریو را از بخش "طراحی سناریو" انتخاب کنید.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-white">گزارش فنی مهندسی</h2>
         <button className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition">
            Export PDF
         </button>
       </div>

       {loading ? (
         <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Cpu className="w-12 h-12 text-zld-primary animate-spin" />
            <p className="text-slate-400 animate-pulse">در حال نگارش گزارش نهایی...</p>
         </div>
       ) : (
         <div className="flex-1 bg-white text-slate-900 rounded-xl p-8 overflow-y-auto shadow-2xl">
            {/* Simple Markdown Rendering simulation for this demo */}
            <div className="prose max-w-none dir-rtl">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed" style={{ fontFamily: 'Vazirmatn' }}>
                {report}
              </pre>
            </div>
         </div>
       )}
    </div>
  );
};

export default ReportView;