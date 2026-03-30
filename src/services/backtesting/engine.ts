import{computeTechnicals}from '../market-data/technicals';
import{calculateScore}from '../scoring/engine';
import type{HistoricalDataPoint,EnrichedAsset,InvestorProfile}from '../../types';
export interface BacktestTrade{entryDate:string;exitDate:string;entryPrice:number;exitPrice:number;returnPct:number;holdingDays:number;signalScore:number;signalTag:string;exitReason:'target'|'stop'|'timeout';win:boolean;}
export interface BacktestStats{totalTrades:number;wins:number;losses:number;winRate:number;totalReturn:number;avgReturn:number;avgWin:number;avgLoss:number;profitFactor:number;maxDrawdown:number;sharpe:number;avgHoldingDays:number;bestTrade:number;worstTrade:number;}
export interface BacktestResult{ticker:string;profile:InvestorProfile;period:{from:string;to:string};trades:BacktestTrade[];stats:BacktestStats;}
interface Cfg{minScore:number;targetPct:number;stopPct:number;maxHoldingDays:number;lookbackWindow:number;profile:InvestorProfile;}
const DEF:Cfg={minScore:65,targetPct:8,stopPct:4,maxHoldingDays:15,lookbackWindow:60,profile:'MODERADO'};
function mkAsset(ticker:string,w:HistoricalDataPoint[]):EnrichedAsset{
  const l=w[w.length-1],p=w[w.length-2]??l,ch=l.close-p.close;
  return{ticker,name:ticker,type:'ACAO',quote:{ticker,price:l.close,open:l.open,high:l.high,low:l.low,close:l.close,previousClose:p.close,change:ch,changePercent:(ch/p.close)*100,volume:l.volume,source:'BACKTEST',timestamp:new Date(l.date)},technicals:computeTechnicals(w),fundamentals:{}};
}
function mdd(r:number[]):number{let pk=0,d=0,c=0;for(const x of r){c+=x;if(c>pk)pk=c;const dd=pk-c;if(dd>d)d=dd;}return d;}
function sharpe(r:number[],rf=0.1375/252):number{if(r.length<2)return 0;const m=r.reduce((s,x)=>s+x,0)/r.length;const std=Math.sqrt(r.reduce((s,x)=>s+(x-m)**2,0)/r.length);return std===0?0:+((m-rf)/std*Math.sqrt(252)).toFixed(2);}
export function runBacktest(ticker:string,data:HistoricalDataPoint[],cfg:Partial<Cfg>={}):BacktestResult{
  const c={...DEF,...cfg};const trades:BacktestTrade[]=[];let i=c.lookbackWindow;
  while(i<data.length){
    const scoring=calculateScore(mkAsset(ticker,data.slice(i-c.lookbackWindow,i)),undefined,c.profile);
    if(scoring.score>=c.minScore){
      const ep=data[i].close,ed=data[i].date,tgt=ep*(1+c.targetPct/100),stp=ep*(1-c.stopPct/100);
      let xp=ep,xd=ed,xr:'target'|'stop'|'timeout'='timeout',j=i+1;
      while(j<data.length&&j<i+c.maxHoldingDays){const b=data[j];if(b.high>=tgt){xp=tgt;xd=b.date;xr='target';break;}if(b.low<=stp){xp=stp;xd=b.date;xr='stop';break;}j++;}
      if(xr==='timeout'&&j<data.length){xp=data[j-1].close;xd=data[j-1].date;}
      const ret=+((xp-ep)/ep*100).toFixed(3);
      trades.push({entryDate:ed,exitDate:xd,entryPrice:+ep.toFixed(2),exitPrice:+xp.toFixed(2),returnPct:ret,holdingDays:j-i,signalScore:scoring.score,signalTag:scoring.tag,exitReason:xr,win:ret>0});
      i=j+1;
    }else i++;
  }
  const wins=trades.filter(t=>t.win),losses=trades.filter(t=>!t.win),rets=trades.map(t=>t.returnPct);
  const sw=wins.reduce((s,t)=>s+t.returnPct,0),sl=Math.abs(losses.reduce((s,t)=>s+t.returnPct,0));
  return{ticker,profile:c.profile,period:{from:data[c.lookbackWindow]?.date??data[0]?.date??'',to:data[data.length-1]?.date??''},trades,stats:{totalTrades:trades.length,wins:wins.length,losses:losses.length,winRate:trades.length>0?+(wins.length/trades.length).toFixed(3):0,totalReturn:+rets.reduce((s,r)=>s+r,0).toFixed(2),avgReturn:trades.length>0?+(rets.reduce((s,r)=>s+r,0)/trades.length).toFixed(2):0,avgWin:wins.length>0?+(sw/wins.length).toFixed(2):0,avgLoss:losses.length>0?-(sl/losses.length).toFixed(2):0,profitFactor:sl>0?+(sw/sl).toFixed(2):sw>0?999:0,maxDrawdown:+mdd(rets).toFixed(2),sharpe:sharpe(rets.map(r=>r/100)),avgHoldingDays:trades.length>0?Math.round(trades.reduce((s,t)=>s+t.holdingDays,0)/trades.length):0,bestTrade:rets.length>0?+Math.max(...rets).toFixed(2):0,worstTrade:rets.length>0?+Math.min(...rets).toFixed(2):0}};
}
export function compareBacktests(results:BacktestResult[]):{ranking:Array<{ticker:string;score:number;stats:BacktestStats}>}{
  return{ranking:results.map(r=>({ticker:r.ticker,score:+(r.stats.winRate*40+Math.min(r.stats.profitFactor/3,1)*30+Math.min(r.stats.totalReturn/50,1)*20+Math.min(r.stats.sharpe/2,1)*10).toFixed(1),stats:r.stats})).sort((a,b)=>b.score-a.score)};
}