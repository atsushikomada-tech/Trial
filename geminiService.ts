
import { GoogleGenAI } from "@google/genai";
import { Booth, SalesRep } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSalesPerformance(booths: Booth[], salesReps: SalesRep[]) {
  const soldBooths = booths.filter(b => b.status === 'SOLD');
  const summaryData = {
    totalBooths: booths.length,
    soldCount: soldBooths.length,
    occupancyRate: ((soldBooths.length / booths.length) * 100).toFixed(1),
    salesDistribution: salesReps.map(sr => ({
      name: sr.name,
      count: booths.filter(b => b.salesRepId === sr.id && b.status === 'SOLD').length
    }))
  };

  const prompt = `
    Analyze the following exhibition booth sales data and provide a professional, concise management summary in Japanese.
    Data:
    - Total Booths: ${summaryData.totalBooths}
    - Sold Booths: ${summaryData.soldCount}
    - Occupancy: ${summaryData.occupancyRate}%
    - Sales by Rep: ${JSON.stringify(summaryData.salesDistribution)}

    Focus on identifying high-performing sales reps and suggestions to fill remaining booths. 
    Keep the tone professional for a manager.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "分析データの取得に失敗しました。";
  }
}
