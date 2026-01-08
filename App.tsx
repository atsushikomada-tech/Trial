
import React, { useState, useEffect, useCallback, useRef } from 'react';
import BoothMap from './components/BoothMap';
import BoothEditor from './components/BoothEditor';
import { INITIAL_LAYOUT, INITIAL_SALES_REPS } from './constants';
import { ExhibitionLayout, Booth, SalesRep } from './types';
import { analyzeSalesPerformance } from './geminiService';

const App: React.FC = () => {
  const [layout, setLayout] = useState<ExhibitionLayout>(INITIAL_LAYOUT);
  const [selectedBoothId, setSelectedBoothId] = useState<string | null>(null);
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const selectedBooth = layout.booths.find(b => b.id === selectedBoothId) || null;

  const handleUpdateBooth = useCallback((id: string, updates: Partial<Booth>) => {
    setLayout(prev => ({
      ...prev,
      booths: prev.booths.map(b => b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b)
    }));
  }, []);

  const handleAddBooth = () => {
    const newId = `N-${layout.booths.length + 1}`;
    const newBooth: Booth = {
      id: newId,
      label: newId,
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      status: 'AVAILABLE',
      updatedAt: Date.now(),
    };
    setLayout(prev => ({
      ...prev,
      booths: [...prev.booths, newBooth]
    }));
    setSelectedBoothId(newId);
  };

  const handleDeleteBooth = (id: string) => {
    if (!confirm('この小間を削除しますか？')) return;
    setLayout(prev => ({
      ...prev,
      booths: prev.booths.filter(b => b.id !== id)
    }));
    setSelectedBoothId(null);
  };

  const handleExportPDF = async () => {
    if (!mapRef.current) return;
    
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    // @ts-ignore
    const canvas = await html2canvas(mapRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.setFontSize(18);
    pdf.text(layout.name, 10, 15);
    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
    
    // Add stats page
    pdf.addPage();
    pdf.text('販売統計レポート', 10, 15);
    const sold = layout.booths.filter(b => b.status === 'SOLD').length;
    pdf.setFontSize(12);
    pdf.text(`総小間数: ${layout.booths.length}`, 10, 30);
    pdf.text(`成約数: ${sold}`, 10, 40);
    pdf.text(`成約率: ${((sold / layout.booths.length) * 100).toFixed(1)}%`, 10, 50);
    
    if (aiAnalysis) {
      pdf.text('AI分析概要:', 10, 70);
      const splitText = pdf.splitTextToSize(aiAnalysis, pdfWidth - 20);
      pdf.text(splitText, 10, 80);
    }

    pdf.save(`exhibition-layout-${new Date().getTime()}.pdf`);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeSalesPerformance(layout.booths, INITIAL_SALES_REPS);
    setAiAnalysis(result || null);
    setIsAnalyzing(false);
  };

  // Stats calculation
  const stats = {
    total: layout.booths.length,
    sold: layout.booths.filter(b => b.status === 'SOLD').length,
    negotiating: layout.booths.filter(b => b.status === 'NEGOTIATING').length,
    reserved: layout.booths.filter(b => b.status === 'RESERVED').length,
    available: layout.booths.filter(b => b.status === 'AVAILABLE').length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{layout.name}</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Booth Management System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDesignMode(!isDesignMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold border ${
              isDesignMode 
                ? 'bg-orange-600 text-white border-orange-600 shadow-inner' 
                : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{isDesignMode ? '編集終了' : 'レイアウト編集'}</span>
          </button>

          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200 text-sm font-semibold"
          >
            {isAnalyzing ? (
              <svg className="animate-spin h-4 w-4 text-indigo-700" xmlns="http://www.w3.org/2000/center" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
            <span>AI分析</span>
          </button>
          
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>PDF出力</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
        {/* Left Side: Map & Analytics */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">総小間数</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl shadow-sm border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 uppercase">成約済 (SOLD)</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.sold}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase">交渉中</p>
              <p className="text-2xl font-bold text-blue-800">{stats.negotiating}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl shadow-sm border border-amber-100">
              <p className="text-xs font-semibold text-amber-600 uppercase">予約</p>
              <p className="text-2xl font-bold text-amber-800">{stats.reserved}</p>
            </div>
            <div className="hidden lg:block bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">空き状況</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-slate-800">{stats.available}</p>
                <span className="text-xs font-medium text-slate-400">/ {stats.total}</span>
              </div>
            </div>
          </div>

          {/* AI Insight Box */}
          {aiAnalysis && (
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center space-x-2 mb-2">
                <div className="bg-indigo-100 p-1.5 rounded-md">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-slate-800">AI 販売戦略サマリー</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
            </div>
          )}

          {/* Map Area */}
          <div ref={mapRef} className="relative">
            <BoothMap
              booths={layout.booths}
              width={layout.width}
              height={layout.height}
              selectedId={selectedBoothId}
              onSelect={setSelectedBoothId}
            />
            {isDesignMode && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleAddBooth}
                  className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center space-x-2 font-bold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>新規小間追加</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Editor Sidebar */}
        <aside className={`w-full md:w-[360px] lg:w-[400px] border-l border-slate-200 shadow-xl z-10 flex flex-col transition-colors duration-300 ${isDesignMode ? 'bg-slate-50' : 'bg-white'}`}>
          <BoothEditor
            booth={selectedBooth}
            salesReps={INITIAL_SALES_REPS}
            onUpdate={handleUpdateBooth}
            onDelete={isDesignMode ? handleDeleteBooth : undefined}
            onClose={() => setSelectedBoothId(null)}
            isDesignMode={isDesignMode}
          />

          {/* Legend Section */}
          {!isDesignMode && (
            <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Legend</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border border-slate-300 bg-white"></div>
                  <span className="text-xs text-slate-600">空き</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border border-amber-400 bg-amber-100"></div>
                  <span className="text-xs text-slate-600">予約</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border border-blue-500 bg-blue-100"></div>
                  <span className="text-xs text-slate-600">交渉中</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded border border-emerald-500 bg-emerald-100"></div>
                  <span className="text-xs text-slate-600">成約済</span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Real-time Indicator (Mock) */}
      <div className="fixed bottom-4 left-4 flex items-center space-x-2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
        <span>{isDesignMode ? 'DESIGN MODE ACTIVE' : 'REAL-TIME ACTIVE'}</span>
      </div>
    </div>
  );
};

export default App;
