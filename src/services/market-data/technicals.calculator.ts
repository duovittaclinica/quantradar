import type{HistoricalDataPoint,Technicals}from '../../types';
/**
 * Extended technical indicators calculator
 * Used for detailed asset analysis pages
 */
export interface ExtendedTechnicals extends Technicals {
  stochK: number; stochD: number;
  williamsR: number; cci: number;
  obv: number; obvTrend: 'rising'|'falling'|'flat';
  pivotHigh: number; pivotLow: number;
  support1: number; support2: number;
  resistance1: number; resistance2: number;
  fibLevels: {level:number;price:number}[];
  patterns: string[];
}
function sma(v:number[],p:number):number[]{return v.map((_,i)=>i<p-1?NaN:v.slice(i-p+1,i+1).reduce((a,b)=>a+b,0)/p);}
function ema(v:number[],p:number):number[]{const k=2/(p+1);const e=[...v];for(let i=1;i<e.length;i++)e[i]=isNaN(e[i-1])?e[i]:e[i]*k+e[i-1]*(1-k);return e;}
function computeRSI(c:number[],p=14):number{if(c.length<p+1)return 50;let g=0,l=0;for(let i=1;i<=p;i++){const d=c[i]-c[i-1];if(d>0)g+=d;else l-=d;}let ag=g/p,al=l/p;for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(p-1)+(d>0?d:0))/p;al=(al*(p-1)+(d<0?-d:0))/p;}return al===0?100:+(100-100/(1+ag/al)).toFixed(2);}
function computeStoch(data:HistoricalDataPoint[],k=14,d=3):{k:number;d:number}{
  if(data.length<k)return{k:50,d:50};
  const recent=data.slice(-k);const hi=Math.max(...recent.map(x=>x.high));const lo=Math.min(...recent.map(x=>x.low));
  const ks=data.slice(-k*2).map((_,i,a)=>{if(i<k-1)return null;const w=a.slice(i-k+1,i+1);const h=Math.max(...w.map(x=>x.high));const l=Math.min(...w.map(x=>x.low));const c=a[i].close;return h===l?50:((c-l)/(h-l))*100;}).filter((x):x is number=>x!==null);
  const kv=+(ks[ks.length-1]??50).toFixed(1);
  const dv=+(ks.slice(-d).reduce((a,b)=>a+b,0)/(Math.min(d,ks.length)||1)).toFixed(1);
  return{k:kv,d:dv};
}
function computeOBV(data:HistoricalDataPoint[]):number{
  let obv=0;for(let i=1;i<data.length;i++){if(data[i].close>data[i-1].close)obv+=data[i].volume;else if(data[i].close<data[i-1].close)obv-=data[i].volume;}return obv;
}
function computePivots(data:HistoricalDataPoint[]):{high:number;low:number;s1:number;s2:number;r1:number;r2:number}{
  const last=data[data.length-1];const prev=data[data.length-2]??last;
  const pp=(prev.high+prev.low+prev.close)/3;
  return{high:prev.high,low:prev.low,s1:+(2*pp-prev.high).toFixed(2),s2:+(pp-prev.high+prev.low).toFixed(2),r1:+(2*pp-prev.low).toFixed(2),r2:+(pp+prev.high-prev.low).toFixed(2)};
}
function computeFib(high:number,low:number):{level:number;price:number}[]{
  const diff=high-low;
  return[0,0.236,0.382,0.5,0.618,0.786,1].map(l=>({level:l,price:+(high-diff*l).toFixed(2)}));
}
function detectPatterns(data:HistoricalDataPoint[]):string[]{
  const patterns:string[]=[];if(data.length<5)return patterns;
  const last=data[data.length-1];const prev=data[data.length-2];const prev2=data[data.length-3];
  const body=Math.abs(last.close-last.open);const range=last.high-last.low;
  if(range>0&&body/range<0.1)patterns.push('Doji');
  if(last.close>last.open&&prev.close<prev.open&&last.open<prev.close&&last.close>prev.open)patterns.push('Engolfo Altista');
  if(last.close<last.open&&prev.close>prev.open&&last.open>prev.close&&last.close<prev.open)patterns.push('Engolfo Baixista');
  const sma20v=sma(data.map(d=>d.volume),20);const avgVol=sma20v[sma20v.length-1];if(!isNaN(avgVol)&&last.volume>avgVol*2)patterns.push('Volume Anômalo');
  return patterns;
}
export function computeExtendedTechnicals(data:HistoricalDataPoint[]):ExtendedTechnicals{
  if(data.length<20){return{rsi14:50,macd:0,macdSignal:0,macdHistogram:0,ma20:0,ma50:0,ma200:0,bbUpper:0,bbMiddle:0,bbLower:0,atr:0,adx:20,volumeRelative:1,trend:'lateral',signal:'neutral',stochK:50,stochD:50,williamsR:-50,cci:0,obv:0,obvTrend:'flat',pivotHigh:0,pivotLow:0,support1:0,support2:0,resistance1:0,resistance2:0,fibLevels:[],patterns:[]};}
  const closes=data.map(d=>d.close);const vols=data.map(d=>d.volume);
  const rsi14=computeRSI(closes);
  const e12=ema(closes,12);const e26=ema(closes,26);
  const macd=+(e12[e12.length-1]-e26[e26.length-1]).toFixed(4);
  const macdLine=e12.map((v,i)=>v-e26[i]);const sig=ema(macdLine.slice(25),9);
  const macdSignal=+sig[sig.length-1].toFixed(4);const macdHistogram=+(macd-macdSignal).toFixed(4);
  const sma20=sma(closes,20);const sma50=sma(closes,50);const sma200=sma(closes,200);
  const ma20=+sma20[sma20.length-1].toFixed(2);const ma50=+(sma50[sma50.length-1]||0).toFixed(2);const ma200=+(sma200[sma200.length-1]||0).toFixed(2);
  const std=Math.sqrt(closes.slice(-20).reduce((s,v)=>{const m=ma20;return s+(v-m)**2;},0)/20);
  const bbUpper=+(ma20+2*std).toFixed(2);const bbMiddle=ma20;const bbLower=+(ma20-2*std).toFixed(2);
  const trs=data.slice(1).map((d,i)=>Math.max(d.high-d.low,Math.abs(d.high-data[i].close),Math.abs(d.low-data[i].close)));
  const atr=+(trs.slice(-14).reduce((a,b)=>a+b,0)/14).toFixed(2);
  let adx=20;if(data.length>=28){let pdm=0,ndm=0,tr=0;for(let i=data.length-14;i<data.length;i++){const prev=data[i-1];const curr=data[i];const up=curr.high-prev.high;const dn=prev.low-curr.low;pdm+=up>dn&&up>0?up:0;ndm+=dn>up&&dn>0?dn:0;tr+=Math.max(curr.high-curr.low,Math.abs(curr.high-prev.close),Math.abs(curr.low-prev.close));}if(tr>0){const pdi=(pdm/tr)*100;const ndi=(ndm/tr)*100;adx=+Math.abs(pdi-ndi)/(pdi+ndi||1)*100;}}
  const recentVol=vols.slice(-5).reduce((a,b)=>a+b,0)/5;const avgVol=vols.slice(-20).reduce((a,b)=>a+b,0)/20;const volumeRelative=avgVol>0?+(recentVol/avgVol).toFixed(2):1;
  const price=closes[closes.length-1];
  const trend=ma50>0&&price>ma50&&ma50>ma200?'alta':ma50>0&&price<ma50&&ma50<ma200?'baixa':'lateral';
  const signal=macd>macdSignal&&rsi14>50&&price>ma20?'bullish':macd<macdSignal&&rsi14<50&&price<ma20?'bearish':'neutral';
  const{k:stochK,d:stochD}=computeStoch(data);
  const hi14=Math.max(...data.slice(-14).map(d=>d.high));const lo14=Math.min(...data.slice(-14).map(d=>d.low));
  const williamsR=hi14===lo14?-50:+((hi14-price)/(hi14-lo14)*-100).toFixed(1);
  const tp=data.slice(-20).map(d=>(d.high+d.low+d.close)/3);const tpMean=tp.reduce((a,b)=>a+b,0)/tp.length;const tpStd=Math.sqrt(tp.reduce((s,v)=>s+(v-tpMean)**2,0)/tp.length);
  const cci=tpStd===0?0:+((tp[tp.length-1]-tpMean)/(0.015*tpStd)).toFixed(1);
  const obv=computeOBV(data);const obvPrev=computeOBV(data.slice(0,-5));
  const obvTrend:ExtendedTechnicals['obvTrend']=obv>obvPrev*1.02?'rising':obv<obvPrev*0.98?'falling':'flat';
  const pivots=computePivots(data);
  const fibLevels=computeFib(pivots.high,pivots.low);
  const patterns=detectPatterns(data);
  return{rsi14,macd,macdSignal,macdHistogram,ma20,ma50,ma200,bbUpper,bbMiddle,bbLower,atr,adx:+adx.toFixed(1),volumeRelative,trend,signal,stochK,stochD,williamsR,cci,obv,obvTrend,pivotHigh:pivots.high,pivotLow:pivots.low,support1:pivots.s1,support2:pivots.s2,resistance1:pivots.r1,resistance2:pivots.r2,fibLevels,patterns};
}