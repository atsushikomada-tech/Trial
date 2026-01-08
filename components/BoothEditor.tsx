
import React from 'react';
import { Booth, SalesRep, BoothStatus } from '../types';

interface BoothEditorProps {
  booth: Booth | null;
  salesReps: SalesRep[];
  onUpdate: (id: string, updates: Partial<Booth>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  isDesignMode?: boolean;
}

const BoothEditor: React.FC<BoothEditorProps> = ({ booth, salesReps, onUpdate, onDelete, onClose, isDesignMode }) => {
  if (!booth) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 p-6 italic text-center">
        {isDesignMode ? '編集したい小間をクリックしてください' : '小間を選択すると詳細が表示されます'}
      </div>
    );
  }

  const handleStatusChange = (status: BoothStatus) => {
    onUpdate(booth.id, { status });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {isDesignMode ? '形状・配置編集' : '小間管理'}: {booth.label}
          </h3>
          {isDesignMode && <p className="text-xs text-orange-600 font-bold uppercase tracking-tighter">Layout Editor</p>}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Design Mode Controls */}
        {isDesignMode && (
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-4">
            <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              形状と位置
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase">X座標</label>
                <input
                  type="number"
                  value={booth.x}
                  onChange={(e) => onUpdate(booth.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 rounded border border-orange-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase">Y座標</label>
                <input
                  type="number"
                  value={booth.y}
                  onChange={(e) => onUpdate(booth.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 rounded border border-orange-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase">幅 (Width)</label>
                <input
                  type="number"
                  value={booth.width}
                  onChange={(e) => onUpdate(booth.id, { width: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 rounded border border-orange-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-orange-700 uppercase">高さ (Height)</label>
                <input
                  type="number"
                  value={booth.height}
                  onChange={(e) => onUpdate(booth.id, { height: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 rounded border border-orange-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-orange-700 uppercase">ラベル名</label>
              <input
                type="text"
                value={booth.label}
                onChange={(e) => onUpdate(booth.id, { label: e.target.value })}
                className="w-full px-2 py-1 rounded border border-orange-200 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(booth.id)}
                className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold border border-red-200"
              >
                この小間を削除
              </button>
            )}
          </div>
        )}

        {/* Regular Sales Mode Controls */}
        {!isDesignMode && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ステータス</label>
              <div className="grid grid-cols-2 gap-2">
                {(['AVAILABLE', 'RESERVED', 'NEGOTIATING', 'SOLD'] as BoothStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                      booth.status === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {s === 'AVAILABLE' ? '空き' : s === 'RESERVED' ? '予約' : s === 'NEGOTIATING' ? '交渉中' : '成約済'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">出展社名</label>
              <input
                type="text"
                value={booth.companyName || ''}
                onChange={(e) => onUpdate(booth.id, { companyName: e.target.value })}
                placeholder="企業名を入力..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">担当営業</label>
              <select
                value={booth.salesRepId || ''}
                onChange={(e) => onUpdate(booth.id, { salesRepId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="">未選択</option>
                {salesReps.map((sr) => (
                  <option key={sr.id} value={sr.id}>
                    {sr.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">受注見込額 (万円)</label>
              <input
                type="number"
                value={booth.dealValue || ''}
                onChange={(e) => onUpdate(booth.id, { dealValue: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
        最終更新: {new Date(booth.updatedAt).toLocaleString()}
      </div>
    </div>
  );
};

export default BoothEditor;
