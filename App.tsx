import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AnalysisView from './components/AnalysisView';
import ScenarioResults from './components/ScenarioResults';
import KnowledgeBase from './components/KnowledgeBase';
import ReportView from './components/ReportView';
import LiveMonitor from './components/LiveMonitor';
import { AgentState, ZLDArticle, WaterAnalysis, ZLDScenario, AgentReport } from './types';
import { Menu } from './components/Icons';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<AgentState['activeView']>('monitor'); // Start on Monitor
  
  // App State
  const [knowledgeBase, setKnowledgeBase] = useState<ZLDArticle[]>([]);
  const [scenarios, setScenarios] = useState<ZLDScenario[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<WaterAnalysis | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ZLDScenario | null>(null);
  const [agentReports, setAgentReports] = useState<AgentReport[]>([]);

  // Handlers
  const handleScenariosGenerated = (generated: ZLDScenario[], analysis: WaterAnalysis) => {
    setScenarios(generated);
    setCurrentAnalysis(analysis);
    setView('analysis'); // Stay on analysis but show results
  };

  const handleSelectReport = (scenario: ZLDScenario) => {
    setSelectedScenario(scenario);
    setView('report');
  };

  const addAgentReport = (report: AgentReport) => {
    setAgentReports(prev => [report, ...prev]);
  };

  // Render Content based on view
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="p-8 text-center mt-20">
            <h2 className="text-3xl font-bold text-white mb-4">خوش آمدید به ZLD Agent Pro</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              این سیستم هوشمند برای کمک به مهندسین فرآیند در طراحی سیستم‌های تصفیه پساب با بازیافت کامل (Zero Liquid Discharge) طراحی شده است.
              از منوی سمت راست برای شروع استفاده کنید.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
               <div className="bg-zld-card p-6 rounded-xl border border-slate-700">
                  <div className="text-4xl font-bold text-zld-primary mb-2">{knowledgeBase.length}</div>
                  <div className="text-slate-400">مقالات تحلیل شده</div>
               </div>
               <div className="bg-zld-card p-6 rounded-xl border border-slate-700">
                  <div className="text-4xl font-bold text-zld-accent mb-2">{scenarios.length}</div>
                  <div className="text-slate-400">سناریوهای تولید شده</div>
               </div>
               <div className="bg-zld-card p-6 rounded-xl border border-slate-700">
                  <div className="text-4xl font-bold text-red-400 mb-2">{agentReports.length}</div>
                  <div className="text-slate-400">گزارش‌های خودکار</div>
               </div>
               <div className="bg-zld-card p-6 rounded-xl border border-slate-700">
                  <div className="text-4xl font-bold text-green-500 mb-2">AI</div>
                  <div className="text-slate-400">Gemini Pro Ready</div>
               </div>
            </div>
          </div>
        );
      case 'monitor':
        return <LiveMonitor reports={agentReports} addReport={addAgentReport} />;
      case 'knowledge':
        return <KnowledgeBase articles={knowledgeBase} setArticles={setKnowledgeBase} />;
      case 'analysis':
        return scenarios.length > 0 && currentAnalysis ? (
          <div className="flex flex-col h-full overflow-y-auto">
             <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <span className="text-slate-300 text-sm">نتایج شبیه‌سازی برای دبی {currentAnalysis.flowRate} m³/hr</span>
                <button onClick={() => setScenarios([])} className="text-xs text-zld-primary hover:underline">
                  طراحی جدید
                </button>
             </div>
             <ScenarioResults scenarios={scenarios} onSelectReport={handleSelectReport} />
          </div>
        ) : (
          <AnalysisView knowledgeBase={knowledgeBase} onScenarioGenerated={handleScenariosGenerated} />
        );
      case 'report':
        return <ReportView scenario={selectedScenario} analysis={currentAnalysis} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zld-dark font-sans" dir="rtl">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 border-b border-slate-700 bg-zld-dark z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="mr-4 font-bold text-white">ZLD Agent</span>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto relative">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;