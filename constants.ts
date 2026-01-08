
import { ExhibitionLayout, SalesRep, BoothStatus } from './types';

export const INITIAL_SALES_REPS: SalesRep[] = [
  { id: 'sr1', name: '田中 太郎', color: '#3B82F6' },
  { id: 'sr2', name: '佐藤 花子', color: '#10B981' },
  { id: 'sr3', name: '鈴木 一郎', color: '#F59E0B' },
  { id: 'sr4', name: '高橋 健一', color: '#8B5CF6' },
];

export const STATUS_COLORS: Record<BoothStatus, string> = {
  AVAILABLE: '#FFFFFF',
  RESERVED: '#FEF3C7', // amber-100
  NEGOTIATING: '#DBEAFE', // blue-100
  SOLD: '#DCFCE7', // green-100
};

export const STATUS_BORDER_COLORS: Record<BoothStatus, string> = {
  AVAILABLE: '#E2E8F0',
  RESERVED: '#F59E0B',
  NEGOTIATING: '#3B82F6',
  SOLD: '#10B981',
};

// Dummy floor plan data
const generateInitialBooths = (): any[] => {
  const booths = [];
  // Row A (Premium)
  for (let i = 0; i < 6; i++) {
    booths.push({
      id: `A-${i+1}`,
      label: `A-${i+1}`,
      x: 50 + i * 110,
      y: 50,
      width: 100,
      height: 100,
      status: 'AVAILABLE',
      updatedAt: Date.now(),
    });
  }
  // Row B
  for (let i = 0; i < 8; i++) {
    booths.push({
      id: `B-${i+1}`,
      label: `B-${i+1}`,
      x: 50 + i * 80,
      y: 200,
      width: 70,
      height: 70,
      status: 'AVAILABLE',
      updatedAt: Date.now(),
    });
  }
  // Row C
  for (let i = 0; i < 8; i++) {
    booths.push({
      id: `C-${i+1}`,
      label: `C-${i+1}`,
      x: 50 + i * 80,
      y: 300,
      width: 70,
      height: 70,
      status: 'AVAILABLE',
      updatedAt: Date.now(),
    });
  }
  return booths;
};

export const INITIAL_LAYOUT: ExhibitionLayout = {
  id: 'main-hall-2024',
  name: 'メインホール展示会 2024秋',
  width: 800,
  height: 600,
  booths: generateInitialBooths(),
};
