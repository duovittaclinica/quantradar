import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../lib/prisma';
import{logger}from '../lib/logger';
import{runBacktest}from '../services/backtesting/engine';
import{fetchHistorical}from '../services/market-data/brapi';

export async function runBacktestRoute(ticker:string,profile='MODERADO',minScore=65,targetPct=8,stopPct=4){
  const historicalRaw=await fetchHistorical(ticker,'1y');
  if(!historicalRaw||historicalRaw.length<30)throw new Error('Dados históricos insuficientes');
  const data=historicalRaw.map((d:any)=>({date:d.date,open:d.open??d.close,high:d.high??d.close,low:d.low??d.close,close:d.close,volume:d.volume??0}));
  const result=runBacktest(ticker,data,{minScore,targetPct,stopPct,profile:profile as any,lookbackWindow:60,maxHoldingDays:15});
  return result;
}
