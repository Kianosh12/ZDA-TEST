import React, { useState } from 'react';
import { ZLDArticle } from '../types';
import { analyzeZLDArticle } from '../services/geminiService';
import { Upload, FileText, CheckCircle, Cpu } from './Icons';

interface KnowledgeBaseProps {
  articles: ZLDArticle[];
  setArticles: React.Dispatch<React.SetStateAction<ZLDArticle[]>>;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ articles, setArticles }) => {
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleIngest = async () => {
    if (!inputText.trim()) return;
    setProcessing(true);
    try {
      const analysis = await analyzeZLDArticle(inputText);
      const newArticle: ZLDArticle = {
        id: Date.now().toString(),
        title: analysis.title || "Untitled Article",
        summary: analysis.summary || "No summary available",
        keyTechnologies: analysis.keyTechnologies || [],
        rawContent: inputText,
        dateAdded: new Date().toLocaleDateString('fa-IR')
      };
      setArticles(prev => [newArticle, ...prev]);
      setInputText('');
    } catch (e) {
      console.error(e);
      alert("خطا در تحلیل متن");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <header>
        <h2 className="text-2xl font-bold text-white mb-2">پایگاه دانش ZLD</h2>
        <p className="text-slate-400">مقالات علمی یا گزارش‌های فنی را وارد کنید تا Agent آنها را تحلیل و به حافظه خود اضافه کند.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        
        {/* Input Section */}
        <div className="flex flex-col space-y-4">
          <div className="bg-zld-card rounded-2xl p-4 border border-slate-700 flex-1 flex flex-col">
            <textarea
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-zld-primary resize-none"
              placeholder="متن مقاله یا گزارش فنی را اینجا کپی کنید..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleIngest}
                disabled={processing || !inputText}
                className={`
                  px-6 py-2 rounded-lg font-bold flex items-center gap-2
                  ${processing ? 'bg-slate-700' : 'bg-zld-primary hover:bg-cyan-600 text-white'}
                `}
              >
                {processing ? <Cpu className="animate-spin w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {processing ? 'در حال استخراج دانش...' : 'پردازش و ذخیره'}
              </button>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="flex flex-col space-y-4 overflow-hidden">
          <h3 className="font-bold text-slate-300 flex items-center gap-2">
            <FileText className="w-5 h-5 text-zld-secondary" />
            منابع تحلیل شده ({articles.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {articles.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-slate-600 border border-dashed border-slate-700 rounded-xl">
                هنوز مقاله‌ای اضافه نشده است
              </div>
            ) : (
              articles.map(article => (
                <div key={article.id} className="bg-zld-card p-5 rounded-xl border border-slate-700 hover:border-zld-primary/50 transition group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white group-hover:text-zld-primary transition">{article.title}</h4>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">{article.dateAdded}</span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-3">{article.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {article.keyTechnologies.map((tech, i) => (
                      <span key={i} className="text-[10px] bg-zld-secondary/10 text-zld-secondary border border-zld-secondary/20 px-2 py-0.5 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default KnowledgeBase;