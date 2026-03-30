import{cache}from '../cache/redis';
import{getQuote,getBatchQuotes,getHistoricalData}from './brapi';
import{computeTechnicals}from './technicals';
import{config}from '../../lib/config';
import{EnrichedAsset}from '../../types';
const META:Record<string,{name:string;type:EnrichedAsset['type'];sector:string}>={
  PETR4:{name:'Petrobras PN',type:'ACAO',sector:'Energia'},VALE3:{name:'Vale ON',type:'ACAO',sector:'Mineração'},
  ITUB4:{name:'Itaú Unibanco PN',type:'ACAO',sector:'Financeiro'},BBDC4:{name:'Bradesco PN',type:'ACAO',sector:'Financeiro'},
  ABEV3:{name:'Ambev ON',type:'ACAO',sector:'Consumo'},WEGE3:{name:'WEG ON',type:'ACAO',sector:'Industrial'},
  RENT3:{name:'Localiza ON',type:'ACAO',sector:'Mobilidade'},PRIO3:{name:'PetroRio ON',type:'ACAO',sector:'Energia'},
  CSMG3:{name:'Copasa ON',type:'ACAO',sector:'Saneamento'},EGIE3:{name:'Engie Brasil ON',type:'ACAO',sector:'Utilidades'},
  BBAS3:{name:'Banco do Brasil ON',type:'ACAO',sector:'Financeiro'},SUZB3:{name:'Suzano ON',type:'ACAO',sector:'Papel e Celulose'},
  TAEE11:{name:'Taesa UNT',type:'ACAO',sector:'Transmissão'},SANB11:{name:'Santander UNT',type:'ACAO',sector:'Financeiro'},
  MXRF11:{name:'Maxi Renda FII',type:'FII',sector:'Papel'},HGLG11:{name:'CSHG Logística FII',type:'FII',sector:'Logística'},
  KNRI11:{name:'Kinea Renda Imob',type:'FII',sector:'Híbrido'},VISC11:{name:'Vinci Shopping FII',type:'FII',sector:'Shoppings'},
  XPML11:{name:'XP Malls FII',type:'FII',sector:'Shoppings'},BCFF11:{name:'BTG Pactual FOF',type:'FII',sector:'FOF'},
  IVVB11:{name:'iShares S&P 500 ETF',type:'ETF',sector:'Global'},BOVA11:{name:'iShares IBOVESPA ETF',type:'ETF',sector:'Brasil'},
  SMAL11:{name:'iShares Small Cap ETF',type:'ETF',sector:'Small Caps'},HASH11:{name:'Hashdex Cripto ETF',type:'ETF',sector:'Cripto'},
};
function defaultTechnicals(price:number){return{rsi14:50,macd:0,macdSignal:0,macdHistogram:0,ma20:price,ma50:price,ma200:price,bbUpper:price*1.02,bbMiddle:price,bbLower:price*0.98,atr:0,adx:20,volumeRelative:1,trend:'lateral' as const,signal:'neutral' as const};}
export async function getEnrichedAsset(ticker:string):Promise<EnrichedAsset|null>{
  return cache.getOrSet(cache.keys.quote(ticker),async()=>{
    const[marketData,historical]=await Promise.all([getQuote(ticker),getHistoricalData(ticker,'3mo','1d')]);
    if(!marketData)return null;
    const technicals=historical.length>=30?computeTechnicals(historical):defaultTechnicals(marketData.quote.price);
    const meta=META[ticker]??{name:ticker,type:'ACAO' as const,sector:'Outro'};
    return{ticker,name:meta.name,type:meta.type,sector:meta.sector,quote:marketData.quote,technicals,fundamentals:marketData.fundamentals};
  },config.redis.ttl.quote);
}
export async function getBatchEnrichedAssets(tickers:string[]):Promise<EnrichedAsset[]>{
  const results:EnrichedAsset[]=[],toFetch:string[]=[];
  await Promise.all(tickers.map(async t=>{const cached=await cache.get<EnrichedAsset>(cache.keys.quote(t));if(cached)results.push(cached);else toFetch.push(t);}));
  if(toFetch.length>0){const batchData=await getBatchQuotes(toFetch);await Promise.all(toFetch.map(async ticker=>{const marketData=batchData.get(ticker);if(!marketData)return;const historical=await getHistoricalData(ticker,'3mo','1d');const technicals=historical.length>=30?computeTechnicals(historical):defaultTechnicals(marketData.quote.price);const meta=META[ticker]??{name:ticker,type:'ACAO' as const,sector:'Outro'};const asset:EnrichedAsset={ticker,name:meta.name,type:meta.type,sector:meta.sector,quote:marketData.quote,technicals,fundamentals:marketData.fundamentals};await cache.set(cache.keys.quote(ticker),asset,config.redis.ttl.quote);results.push(asset);}));}
  return results;
}
export{getHistoricalData};