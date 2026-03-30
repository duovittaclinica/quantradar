import{config}from '../../lib/config';
import{RawQuote,HistoricalDataPoint,Fundamentals}from '../../types';
const BASE=config.brapi.baseUrl;
const TOKEN=config.brapi.token;
function h2():HeadersInit{const h:HeadersInit={};if(TOKEN)h['Authorization']=`Bearer ${TOKEN}`;return h;}
async function brapi<T>(path:string,params:Record<string,string>={}):Promise<T>{
  const url=new URL(`${BASE}${path}`);Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),config.brapi.timeout);
  try{const r=await fetch(url.toString(),{headers:h2(),signal:ctrl.signal});clearTimeout(t);if(!r.ok)throw new Error(`BRAPI ${r.status}`);return r.json();}finally{clearTimeout(t);}
}
interface BR{symbol:string;shortName:string;regularMarketPrice:number;regularMarketOpen:number;regularMarketDayHigh:number;regularMarketDayLow:number;regularMarketPreviousClose:number;regularMarketChange:number;regularMarketChangePercent:number;regularMarketVolume:number;marketCap?:number;priceEarnings?:number;priceToBook?:number;dividendsYield?:number;trailingPE?:number;regularMarketTime:number;historicalDataPrice?:{date:number;open:number;high:number;low:number;close:number;volume:number;adjustedClose:number}[];}
interface BRes{results:BR[];requestedAt:string;}
const mq=(r:BR):RawQuote=>({ticker:r.symbol,price:r.regularMarketPrice,open:r.regularMarketOpen,high:r.regularMarketDayHigh,low:r.regularMarketDayLow,close:r.regularMarketPrice,previousClose:r.regularMarketPreviousClose,change:r.regularMarketChange,changePercent:r.regularMarketChangePercent,volume:r.regularMarketVolume,marketCap:r.marketCap,source:'BRAPI',timestamp:new Date(r.regularMarketTime*1000)});
const mf=(r:BR):Fundamentals=>({pl:r.priceEarnings??r.trailingPE,pvp:r.priceToBook,dividendYield:r.dividendsYield});
const mh=(r:BR):HistoricalDataPoint[]=>(r.historicalDataPrice??[]).map(d=>({date:new Date(d.date*1000).toISOString().split('T')[0],open:d.open,high:d.high,low:d.low,close:d.adjustedClose??d.close,volume:d.volume}));
export async function getQuote(ticker:string){try{const d=await brapi<BRes>(`/quote/${ticker}`,{fundamental:'true',dividends:'true'});if(!d.results?.length)return null;return{quote:mq(d.results[0]),fundamentals:mf(d.results[0])};}catch(e){console.error(`[BRAPI]`,e);return null;}}
export async function getBatchQuotes(tickers:string[]){const m=new Map<string,{quote:RawQuote;fundamentals:Fundamentals}>();const C=10;for(let i=0;i<tickers.length;i+=C){const c=tickers.slice(i,i+C);try{const d=await brapi<BRes>(`/quote/${c.join(',')}`,{fundamental:'true',dividends:'true'});d.results?.forEach(r=>m.set(r.symbol,{quote:mq(r),fundamentals:mf(r)}));}catch(e){console.error('[BRAPI] batch',e);}if(i+C<tickers.length)await new Promise(r=>setTimeout(r,200));}return m;}
export async function getHistoricalData(ticker:string,range='3mo',interval='1d'){try{const d=await brapi<BRes>(`/quote/${ticker}`,{range,interval,fundamental:'false'});if(!d.results?.length)return[];return mh(d.results[0]);}catch(e){console.error(`[BRAPI] hist`,e);return[];}}
