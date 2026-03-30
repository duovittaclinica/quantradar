const mockFetch=jest.fn();global.fetch=mockFetch;
jest.mock('../services/cache/redis',()=>({cache:{get:jest.fn().mockResolvedValue(null),set:jest.fn().mockResolvedValue(undefined),getOrSet:jest.fn().mockImplementation((_:string,fn:()=>Promise<any>)=>fn()),invalidatePattern:jest.fn().mockResolvedValue(undefined),del:jest.fn().mockResolvedValue(undefined),keys:{quote:(t:string)=>`quote:${t}`,news:(q:string)=>`news:${q}`,sentiment:(id:string)=>`sent:${id}`,radar:(p:string)=>`radar:${p}`,historical:(t:string,r:string)=>`hist:${t}:${r}`,fundamentals:(t:string)=>`fund:${t}`,scoring:(t:string)=>`score:${t}`}}}));
import{computeTechnicals}from '../services/market-data/technicals';
import{calculateScore,batchCalculateScores}from '../services/scoring/engine';
import type{EnrichedAsset,HistoricalDataPoint}from '../types';
function makeAsset(ticker:string):EnrichedAsset{
  return{ticker,name:`${ticker} Corp`,type:'ACAO',sector:'Test',
    quote:{ticker,price:50,open:49,high:52,low:48,close:50,previousClose:48,change:2,changePercent:4,volume:10_000_000,source:'MOCK',timestamp:new Date()},
    technicals:computeTechnicals(Array.from({length:80},(_,i)=>({date:`2024-01-${String(i+1).padStart(2,'0')}`,open:48+i*0.1,high:49+i*0.1,low:47+i*0.1,close:48+i*0.12,volume:1_000_000}))),
    fundamentals:{pl:12,pvp:0.9,dividendYield:8,roe:18}};
}
describe('Pipeline Integration',()=>{
  it('computes score 0-100',()=>{const r=calculateScore(makeAsset('TEST4'));expect(r.score).toBeGreaterThanOrEqual(0);expect(r.score).toBeLessThanOrEqual(100);});
  it('value asset scores higher',()=>{const a=makeAsset('V4');a.fundamentals={pl:7,pvp:0.7,dividendYield:12,roe:22};const r=calculateScore(a,0.4);expect(r.score).toBeGreaterThan(60);});
  it('batch descending',()=>{const assets=[makeAsset('A4'),makeAsset('B4')];const rs=batchCalculateScores(assets);for(let i=0;i<rs.length-1;i++)expect(rs[i].score).toBeGreaterThanOrEqual(rs[i+1].score);});
  it('justifications have required fields',()=>{const r=calculateScore(makeAsset('J4'));r.justification.forEach(j=>{expect(j.factor).toBeTruthy();expect(j.description).toBeTruthy();expect(['positive','negative','neutral']).toContain(j.impact);});});
});