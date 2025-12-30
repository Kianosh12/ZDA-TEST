import React, { useState, useEffect } from 'react';
import { AgentReport } from '../types';
import { runAutonomousResearch } from '../services/geminiService';
import { sendTelegramReport, testTelegramConnection } from '../services/telegramService';
import { Radio, Clock, RefreshCw, Search, CheckCircle, AlertTriangle, Copy, Download, Share2, MessageCircle, Settings, X, FileText, Layers, Zap } from './Icons';

interface LiveMonitorProps {
  reports: AgentReport[];
  addReport: (report: AgentReport) => void;
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ reports, addReport }) => {
  // Timer set to 300 seconds (5 minutes)
  const [nextRun, setNextRun] = useState<number>(300); 
  const [isRunning, setIsRunning] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Telegram State
  const [chatId, setChatId] = useState(() => localStorage.getItem('telegram_chat_id') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [lastTelegramStatus, setLastTelegramStatus] = useState<'sent' | 'error' | null>(null);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  // Auto-select the newest report when a new one arrives
  useEffect(() => {
    if (reports.length > 0) {
      // Assuming reports[0] is the newest (prepended in App.tsx)
      setSelectedReportId(reports[0].id);
    }
  }, [reports.length]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRun((prev) => {
        if (prev <= 1) {
          triggerAgent();
          return 300; // Reset to 300 seconds (5 minutes)
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [chatId]); // Re-create timer if chatId changes so the closure captures the new ID

  const saveSettings = (newId: string) => {
    setChatId(newId);
    localStorage.setItem('telegram_chat_id', newId);
  };

  const handleTestTelegram = async () => {
    if (!chatId) return;
    setIsTestingTelegram(true);
    try {
      await testTelegramConnection(chatId);
      alert("پیام آزمایشی ارسال شد. لطفا تلگرام خود را چک کنید.");
    } catch (error) {
      alert("خطا در ارسال پیام. لطفا اینترنت و Chat ID را بررسی کنید.\nمطمئن شوید ربات را Start کرده‌اید.");
      console.error(error);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const triggerAgent = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLastTelegramStatus(null);
    try {
      const report = await runAutonomousResearch();
      addReport(report); // This adds to the top of the list in App.tsx

      // Auto-send to Telegram if Chat ID is present and report was successful
      if (report.status === 'success' && chatId) {
        console.log("Attempting to send report to Telegram ID:", chatId);
        try {
            await sendTelegramReport(report.findings, chatId, report.id);
            setLastTelegramStatus('sent');
        } catch (e) {
            console.error("Failed to send telegram in auto-mode", e);
            setLastTelegramStatus('error');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId('active');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = (report: AgentReport) => {
    const content = `
REPORT ID: ${report.id}
DATE: ${report.timestamp}
QUERY: ${report.searchQuery}
--------------------------------------------------
${report.findings}
--------------------------------------------------
SOURCES:
${report.sources.map(s => `- ${s.title}: ${s.uri}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZLD_Report_${report.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find the selected report object
  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];

  return (
    <div className="p-4 md:p-6 h-full flex flex-col font-sans relative overflow-hidden">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl">
          <div className="bg-zld-card border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                تنظیمات ربات تلگرام
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              برای دریافت خودکار گزارش‌ها، شناسه عددی (Chat ID) اکانت تلگرام خود را وارد کنید.
            </p>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300">Telegram Chat ID</label>
              <input 
                type="text" 
                value={chatId}
                onChange={(e) => saveSettings(e.target.value)}
                placeholder="مثال: 123456789"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none dir-ltr font-mono text-center"
              />
            </div>
            
            <div className="mt-4 flex gap-3">
                <button 
                  onClick={handleTestTelegram}
                  disabled={!chatId || isTestingTelegram}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-zld-primary border border-slate-600 rounded-xl py-2 text-sm font-bold transition flex justify-center items-center gap-2"
                >
                  {isTestingTelegram ? <RefreshCw className="animate-spin w-4 h-4"/> : <Zap className="w-4 h-4"/>}
                  تست اتصال
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl transition"
                >
                  ذخیره
                </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 text-center">
                نکته: حتما قبل از تست، در تلگرام دکمه Start ربات را زده باشید.
            </p>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-zld-card/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <div>
             <h2 className="text-lg font-black text-white">اتاق وضعیت ZLD</h2>
             <p className="text-xs text-slate-400">چرخه اسکن خودکار: ۵ دقیقه</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
           <button 
             onClick={() => setShowSettings(true)}
             className={`p-2.5 rounded-xl border border-slate-700 transition-colors ${chatId ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-slate-900/80 text-slate-400'}`}
             title="تنظیمات تلگرام"
           >
              <Settings className="w-5 h-5" />
           </button>
           <div className="bg-slate-900 px-4 py-2.5 rounded-xl flex items-center gap-2 border border-slate-700 font-mono text-lg font-bold text-zld-primary">
              <Clock className="w-4 h-4" />
              {formatTime(nextRun)}
           </div>
           <button
            onClick={triggerAgent}
            disabled={isRunning}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg text-sm
              ${isRunning ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-zld-primary hover:bg-cyan-600 text-white'}
            `}
          >
            {isRunning ? <RefreshCw className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
            <span>{isRunning ? '...' : 'اسکن'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Master-Detail Layout */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
        
        {/* Left Sidebar: List of Reports */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-zld-card/30 rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
           <div className="p-3 bg-slate-800/50 border-b border-slate-700/50 text-xs font-bold text-slate-400 flex items-center gap-2">
             <Layers className="w-4 h-4" />
             تاریخچه اسکن‌ها ({reports.length})
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
             {reports.length === 0 ? (
               <div className="text-center py-10 text-slate-500 text-xs">در انتظار اولین گزارش...</div>
             ) : (
               reports.map((r, idx) => (
                 <button
                   key={r.id}
                   onClick={() => setSelectedReportId(r.id)}
                   className={`w-full text-right p-3 rounded-xl border transition-all duration-200 group
                     ${selectedReportId === r.id 
                       ? 'bg-zld-primary/10 border-zld-primary/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                       : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800 hover:border-slate-600'}
                   `}
                 >
                   <div className="flex justify-between items-start mb-1">
                     <span className={`text-xs font-bold ${selectedReportId === r.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                       گزارش #{reports.length - idx}
                     </span>
                     {r.status === 'success' ? (
                       <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                     ) : (
                       <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                     )}
                   </div>
                   <div className="text-[10px] text-slate-500 font-mono mb-1">{r.timestamp}</div>
                   <div className="text-[11px] text-slate-400 truncate w-full opacity-80">
                     {r.searchQuery}
                   </div>
                 </button>
               ))
             )}
           </div>
        </div>

        {/* Right Panel: Detail View */}
        <div className="flex-1 bg-zld-card rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col relative">
           {!selectedReport ? (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
               <Radio className="w-20 h-20 opacity-10 animate-pulse mb-4" />
               <p>سیستم در حال گوش دادن به جدیدترین تحولات ZLD است...</p>
             </div>
           ) : (
             <>
                {/* Detail Header */}
                <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex flex-wrap justify-between items-center gap-3 backdrop-blur-md z-10">
                  <div>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                       <FileText className="w-5 h-5 text-zld-secondary" />
                       نتایج پایش #{reports.length - reports.indexOf(selectedReport)}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                       <span className="font-mono bg-slate-900 px-2 py-0.5 rounded">{selectedReport.timestamp}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                       <span>ID: {selectedReport.id.slice(-6)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleCopy(selectedReport.findings)}
                      className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                      title="کپی"
                    >
                      {copiedId ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => handleExport(selectedReport)}
                      className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                      title="دانلود"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Bar for this specific report */}
                {lastTelegramStatus && selectedReportId === reports[0].id && (
                  <div className={`mx-4 mt-4 p-2 rounded-lg flex items-center gap-2 text-xs font-bold ${lastTelegramStatus === 'sent' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400'}`}>
                    <MessageCircle className="w-3 h-3" />
                    {lastTelegramStatus === 'sent' ? 'ارسال شده به تلگرام' : 'خطا در ارسال'}
                  </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div 
                      className="whitespace-pre-wrap text-slate-300 leading-8 text-justify font-normal select-text"
                      style={{ fontSize: '0.95rem' }}
                    >
                      {selectedReport.findings}
                    </div>
                  </div>

                  {/* Sources */}
                  {selectedReport.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                      <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2">
                        <Share2 className="w-3 h-3" /> منابع یافت شده
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.sources.map((src, i) => (
                          <a 
                            key={i} 
                            href={src.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-zld-primary hover:text-white px-3 py-2 rounded-lg transition border border-slate-700/50 hover:border-zld-primary/30"
                          >
                            <Search className="w-3 h-3 opacity-50" />
                            <span className="truncate max-w-[200px]">{src.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
             </>
           )}
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;