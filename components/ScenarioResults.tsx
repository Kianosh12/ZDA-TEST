import React from 'react';
import { ZLDScenario } from '../types';
import { CheckCircle, AlertTriangle, Zap, DollarSign, Layers } from './Icons';

interface ScenarioResultsProps {
  scenarios: ZLDScenario[];
  onSelectReport: (scenario: ZLDScenario) => void;
}

const ScenarioResults: React.FC<ScenarioResultsProps> = ({ scenarios, onSelectReport }) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-white mb-2">سناریوهای پیشنهادی</h2>
        <p className="text-slate-400">بر اساس آنالیز شما، Agent راهکارهای زیر را مهندسی کرده است.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="bg-zld-card rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800/50">
              <div>
                <div className="text-xs font-bold text-zld-primary uppercase tracking-wider mb-1">OPTION {idx + 1}</div>
                <h3 className="text-xl font-bold text-white">{scenario.name}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{scenario.description}</p>
              </div>
              <div className="flex flex-col items-end">
                 <div className="text-3xl font-black text-green-400">{scenario.recoveryRate}%</div>
                 <div className="text-xs text-slate-500 uppercase">نرخ بازیابی</div>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <DollarSign className="w-3 h-3" /> CAPEX
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{scenario.capexEstimate}</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <ActivityIcon className="w-3 h-3" /> OPEX
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{scenario.opexEstimate}</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Zap className="w-3 h-3" /> Energy
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{scenario.energyConsumption} kWh/m³</div>
                </div>
              </div>

              {/* Process Flow */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-zld-secondary" /> جریان فرآیند
                </h4>
                <div className="relative pl-4 border-r-2 border-slate-700 space-y-6" dir="ltr">
                  {scenario.steps.map((step, sIdx) => (
                    <div key={sIdx} className="relative">
                      <div className="absolute -right-[21px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-zld-secondary z-10"></div>
                      <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-center mb-1">
                           <span className="font-bold text-zld-secondary text-sm">{step.name}</span>
                           <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{step.type}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              {scenario.risks && scenario.risks.length > 0 && (
                <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> ریسک‌های عملیاتی
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {scenario.risks.map((risk, rIdx) => (
                      <li key={rIdx} className="text-xs text-red-300/80">{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-700 mt-auto">
              <button 
                onClick={() => onSelectReport(scenario)}
                className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition shadow-lg shadow-white/5"
              >
                تولید گزارش تفصیلی برای این گزینه
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
)

export default ScenarioResults;