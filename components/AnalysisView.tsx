import React, { useState } from 'react';
import { WaterAnalysis, ZLDArticle, ZLDScenario } from '../types';
import { generateScenarios } from '../services/geminiService';
import { Droplets, Play, Zap, DollarSign, AlertTriangle, CheckCircle, Cpu } from './Icons';

interface AnalysisViewProps {
  knowledgeBase: ZLDArticle[];
  onScenarioGenerated: (scenarios: ZLDScenario[], analysis: WaterAnalysis) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ knowledgeBase, onScenarioGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WaterAnalysis>({
    flowRate: 10,
    tds: 35000,
    ph: 7.5,
    cod: 200,
    chlorides: 15000,
    sulfates: 2000,
    hardness: 500,
    temp: 25
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAnalysis(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const scenarios = await generateScenarios(analysis, knowledgeBase);
      onScenarioGenerated(scenarios, analysis);
    } catch (error) {
      console.error(error);
      alert("خطا در تولید سناریو. لطفا مجددا تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-white mb-2">طراحی و شبیه‌سازی فرآیند</h2>
        <p className="text-slate-400">پارامترهای آنالیز آب ورودی را وارد کنید تا Agent بهترین سناریوهای ZLD را پیشنهاد دهد.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 bg-zld-card rounded-2xl p-6 border border-slate-700 h-fit">
          <div className="flex items-center gap-2 mb-6 text-zld-primary">
            <Droplets className="w-5 h-5" />
            <h3 className="font-bold">آنالیز آب ورودی</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">دبی ورودی (m³/hr)</label>
              <input 
                type="number" name="flowRate" value={analysis.flowRate} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zld-primary outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">TDS (mg/L)</label>
              <input 
                type="number" name="tds" value={analysis.tds} onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zld-primary outline-none transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">pH</label>
                <input 
                  type="number" name="ph" value={analysis.ph} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zld-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">COD (mg/L)</label>
                <input 
                  type="number" name="cod" value={analysis.cod} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zld-primary outline-none transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Chlorides</label>
                <input 
                  type="number" name="chlorides" value={analysis.chlorides} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zld-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Sulfates</label>
                <input 
                  type="number" name="sulfates" value={analysis.sulfates} onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-zld-primary outline-none transition"
                />
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className={`
                w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-zld-secondary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'}
              `}
            >
              {loading ? (
                <>
                  <Cpu className="w-5 h-5 animate-spin" />
                  در حال تحلیل...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  تولید سناریو
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Highlight */}
        <div className="lg:col-span-2 flex flex-col justify-center items-center text-center space-y-6 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/50">
           <Cpu className="w-20 h-20 text-slate-700" />
           <div>
             <h3 className="text-xl font-semibold text-slate-300">منتظر ورودی اطلاعات</h3>
             <p className="max-w-md mx-auto mt-2">
               موتور هوشمند Agent با استفاده از مدل Gemini Pro، بهترین ترکیب تکنولوژی‌های غشایی و حرارتی را برای رسیدن به تخلیه مایع صفر پیشنهاد خواهد داد.
             </p>
           </div>
           
           <div className="grid grid-cols-3 gap-4 w-full max-w-lg mt-4">
             <div className="p-4 bg-slate-800 rounded-xl">
               <div className="text-zld-primary font-bold mb-1">High Recovery</div>
               <div className="text-xs">تلاش برای بازیابی حداکثری آب</div>
             </div>
             <div className="p-4 bg-slate-800 rounded-xl">
               <div className="text-zld-accent font-bold mb-1">Energy Opt</div>
               <div className="text-xs">بهینه‌سازی مصرف انرژی</div>
             </div>
             <div className="p-4 bg-slate-800 rounded-xl">
               <div className="text-zld-secondary font-bold mb-1">Tech Select</div>
               <div className="text-xs">انتخاب هوشمند متریال</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;