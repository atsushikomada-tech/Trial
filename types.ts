
export type BoothStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'NEGOTIATING';

export interface SalesRep {
  id: string;
  name: string;
  color: string;
}

export interface Booth {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: BoothStatus;
  companyName?: string;
  salesRepId?: string;
  dealValue?: number;
  updatedAt: number;
}

export interface ExhibitionLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  booths: Booth[];
}

export interface AppState {
  layout: ExhibitionLayout;
  selectedBoothId: string | null;
  salesReps: SalesRep[];
}
