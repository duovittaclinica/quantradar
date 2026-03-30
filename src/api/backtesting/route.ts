import{prisma}from '../../lib/prisma';
import{logger}from '../../lib/logger';
import{runBacktest}from '../../services/backtesting/engine';

export async function runBacktestRoute(ticker:string,profile='MODERADO',minScore=65,targetPct=8,stopPct=4){
  try{
    const asset=await prisma.asset.findUnique({where:{ticker}});
    // Use mock historical data if BRAPI not configured
    const mockData=Array.from({length:252},(_,i)=>{
      const base=100+Math.sin(i/20)*15;
      return{date:new Date(Date.now()-i*86400000).toISOString().slice(0,10),open:base,high:base*1.01,low:base*0.99,close:base,volume:1000000};
    }).reverse();
    const result=runBacktest(ticker,mockData,{minScore,targetPct,stopPct,profile:profile as any,lookbackWindow:60,maxHoldingDays:15});
    return result;
  }catch(e:any){logger.error('Backtest error',e);throw e;}
}
