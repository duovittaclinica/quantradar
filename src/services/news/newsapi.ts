import{config}from '../../lib/config';
import{cache}from '../cache/redis';
import{NewsItem}from '../../types';
const BASE=config.newsApi.baseUrl;
const KEY=config.newsApi.apiKey;
const KEYWORD_MAP:Record<string,string[]>={petrobras:['PETR4','PETR3'],vale:['VALE3'],itaú:['ITUB4'],bradesco:['BBDC4'],'banco do brasil':['BBAS3'],ambev:['ABEV3'],weg:['WEGE3'],bitcoin:['BTC','HASH11'],ethereum:['ETH'],ibovespa:['BOVA11']};
const FIN_KEYWORDS=['dividendo','juros','selic','inflação','ipca','câmbio','resultado','lucro','receita','guidance','ipo','fusão','bcb','copom'];
function extractTickers(text:string):string[]{const lower=text.toLowerCase();const s=new Set<string>();for(const[k,v]of Object.entries(KEYWORD_MAP)){if(lower.includes(k))v.forEach(t=>s.add(t));}const m=text.match(/([A-Z]{4}[0-9]{1,2}|BTC|ETH|BNB)/g)??[];m.forEach(t=>s.add(t));return[...s];}
function extractKeywords(text:string):string[]{const lower=text.toLowerCase();return FIN_KEYWORDS.filter(k=>lower.includes(k));}
async function fetchNews(query:string,pageSize=20):Promise<NewsItem[]>{
  if(!KEY){console.warn('[NewsAPI] No key');return[];}
  const url=new URL(`${BASE}/everything`);url.searchParams.set('q',query);url.searchParams.set('language','pt');url.searchParams.set('sortBy','publishedAt');url.searchParams.set('pageSize',String(pageSize));url.searchParams.set('apiKey',KEY);
  try{const res=await fetch(url.toString(),{signal:AbortSignal.timeout(config.newsApi.timeout)});if(!res.ok)throw new Error(`NewsAPI ${res.status}`);const data=await res.json();return(data.articles??[]).map((a:any,i:number)=>({id:`newsapi-${i}-${Date.now()}`,title:a.title,description:a.description,url:a.url,source:a.source.name,publishedAt:new Date(a.publishedAt),keywords:extractKeywords(`${a.title} ${a.description??''}`),relatedTickers:extractTickers(`${a.title} ${a.description??''}`)}));}
  catch(err){console.error('[NewsAPI]',err);return[];}
}
export async function getMarketNews(pageSize=20):Promise<NewsItem[]>{return cache.getOrSet(cache.keys.news('market'),()=>fetchNews('mercado financeiro OR ibovespa OR b3 OR selic',pageSize),config.redis.ttl.news);}
export async function getAssetNews(ticker:string,pageSize=10):Promise<NewsItem[]>{return cache.getOrSet(cache.keys.news(ticker),()=>fetchNews(ticker,pageSize),config.redis.ttl.news);}
export async function getEconomicCalendarNews():Promise<NewsItem[]>{return cache.getOrSet(cache.keys.news('calendar'),()=>fetchNews('IPCA OR SELIC OR PIB OR copom',10),config.redis.ttl.news);}