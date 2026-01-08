
import React from 'react';
import { Booth, BoothStatus } from '../types';
import { STATUS_COLORS, STATUS_BORDER_COLORS } from '../constants';

interface BoothMapProps {
  booths: Booth[];
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const BoothMap: React.FC<BoothMapProps> = ({ booths, width, height, selectedId, onSelect }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-lg border border-slate-200 overflow-auto p-8 flex justify-center items-center min-h-[600px]">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full h-auto drop-shadow-sm"
      >
        {/* Background Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Booths */}
        {booths.map((booth) => {
          const isSelected = selectedId === booth.id;
          return (
            <g
              key={booth.id}
              onClick={() => onSelect(booth.id)}
              className="cursor-pointer group"
            >
              <rect
                x={booth.x}
                y={booth.y}
                width={booth.width}
                height={booth.height}
                fill={STATUS_COLORS[booth.status]}
                stroke={isSelected ? '#2563EB' : STATUS_BORDER_COLORS[booth.status]}
                strokeWidth={isSelected ? 3 : 1.5}
                rx="4"
                className="booth-transition group-hover:filter group-hover:brightness-95"
              />
              <text
                x={booth.x + booth.width / 2}
                y={booth.y + booth.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[10px] font-bold select-none pointer-events-none ${
                  booth.status === 'AVAILABLE' ? 'fill-slate-500' : 'fill-slate-800'
                }`}
              >
                {booth.label}
              </text>
              {booth.companyName && (
                <text
                  x={booth.x + booth.width / 2}
                  y={booth.y + booth.height / 2 + 15}
                  textAnchor="middle"
                  className="text-[8px] fill-slate-600 font-medium select-none pointer-events-none"
                >
                  {booth.companyName.length > 10 ? booth.companyName.substring(0, 8) + '...' : booth.companyName}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BoothMap;
