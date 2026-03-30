import type{HistoricalDataPoint,Technicals}from '../../types';
function sma(v:number[],p:number):number[]{return v.map((_,i)=>i<p-1?NaN:v.slice(i-p+1,i+1).reduce((a,b)=>a+b,0)/p);}
function ema(v:number[],p:number):number[]{const k=2/(p+1);const e=[...v];for(let i=1;i<e.length;i++)e[i]=isNaN(e[i-1])?e[i]:e[i]*k+e[i-1]*(1-k);return e;}
function computeRSI(c:number[],p=14):number{
  if(c.length<p+1)return 50;
  let gains=0,losses=0;
  for(let i=1;i<=p;i++){const d=c[i]-c[i-1];if(d>0)gains+=d;else losses-=d;}
  let ag=gains/p,al=losses/p;
  for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(p-1)+(d>0?d:0))/p;al=(al*(p-1)+(d<0?-d:0))/p;}
  if(al===0)return 100;return+(100-100/(1+ag/al)).toFixed(2);
}
function computeMACD(c:number[]):{macd:number;signal:number;histogram:number}{
  if(c.length<26)return{macd:0,signal:0,histogram:0};
  const e12=ema(c,12);const e26=ema(c,26);const line=e12.map((v,i)=>v-e26[i]);
  const sig=ema(line.slice(25),9);const last=line[line.length-1];const s=sig[sig.length-1];
  return{macd:+last.toFixed(4),signal:+s.toFixed(4),histogram:+(last-s).toFixed(4)};
}
function computeBB(c:number[],p=20,mult=2):{upper:number;middle:number;lower:number}{
  if(c.length<p)return{upper:c[c.length-1]*1.02,middle:c[c.length-1],lower:c[c.length-1]*0.98};
  const s=c.slice(-p);const m=s.reduce((a,b)=>a+b,0)/p;
  const std=Math.sqrt(s.reduce((a,b)=>a+(b-m)**2,0)/p);
  return{upper:+(m+mult*std).toFixed(2),middle:+m.toFixed(2),lower:+(m-mult*std).toFixed(2)};
}
function computeATR(data:HistoricalDataPoint[],p=14):number{
  if(data.length<2)return 0;
  const trs=data.slice(1).map((d,i)=>{const prev=data[i].close;return Math.max(d.high-d.low,Math.abs(d.high-prev),Math.abs(d.low-prev));});
  const recent=trs.slice(-p);return+(recent.reduce((a,b)=>a+b,0)/recent.length).toFixed(2);
}
function computeADX(data:HistoricalDataPoint[],p=14):number{
  if(data.length<p*2)return 20;
  let plusDM=0,minusDM=0,tr=0;
  for(let i=data.length-p;i<data.length;i++){const prev=data[i-1];const curr=data[i];const upMove=curr.high-prev.high;const downMove=prev.low-curr.low;plusDM+=upMove>downMove&&upMove>0?upMove:0;minusDM+=downMove>upMove&&downMove>0?downMove:0;tr+=Math.max(curr.high-curr.low,Math.abs(curr.high-prev.close),Math.abs(curr.low-prev.close));}
  if(tr===0)return 20;const plusDI=(plusDM/tr)*100;const minusDI=(minusDM/tr)*100;const dx=Math.abs(plusDI-minusDI)/(plusDI+minusDI||1)*100;return+dx.toFixed(1);
}
export function computeTechnicals(data:HistoricalDataPoint[]):Technicals{
  if(data.length<20)return{rsi14:50,macd:0,macdSignal:0,macdHistogram:0,ma20:data[data.length-1]?.close??0,ma50:0,ma200:0,bbUpper:0,bbMiddle:0,bbLower:0,atr:0,adx:20,volumeRelative:1,trend:'lateral',signal:'neutral'};
  const closes=data.map(d=>d.close);const volumes=data.map(d=>d.volume);
  const rsi14=computeRSI(closes);const{macd,signal:macdSignal,histogram:macdHistogram}=computeMACD(closes);
  const ma20s=sma(closes,20);const ma50s=sma(closes,50);const ma200s=sma(closes,200);
  const ma20=+ma20s[ma20s.length-1].toFixed(2);const ma50=+(ma50s[ma50s.length-1]||0).toFixed(2);const ma200=+(ma200s[ma200s.length-1]||0).toFixed(2);
  const{upper:bbUpper,middle:bbMiddle,lower:bbLower}=computeBB(closes);
  const atr=computeATR(data);const adx=computeADX(data);
  const recentVol=volumes.slice(-5).reduce((a,b)=>a+b,0)/5;const avgVol=volumes.slice(-20).reduce((a,b)=>a+b,0)/20;const volumeRelative=avgVol>0?+(recentVol/avgVol).toFixed(2):1;
  const price=closes[closes.length-1];
  const trend=ma50>0&&price>ma50&&ma50>ma200?'alta':ma50>0&&price<ma50&&ma50<ma200?'baixa':'lateral';
  const signal=macd>macdSignal&&rsi14>50&&price>ma20?'bullish':macd<macdSignal&&rsi14<50&&price<ma20?'bearish':'neutral';
  return{rsi14,macd,macdSignal,macdHistogram,ma20,ma50,ma200,bbUpper,bbMiddle,bbLower,atr,adx,volumeRelative,trend,signal};
}