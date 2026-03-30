import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../../../database/client';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='GET')return res.status(405).end();
  const{ticker,tickers}=req.query;
  try{
    const list=tickers?String(tickers).split(','):ticker?[String(ticker)]:[];
    if(!list.length)return res.status(400).json({error:'Missing ticker param'});
    const assets=await prisma.asset.findMany({where:{ticker:{in:list},active:true}});
    if(!assets.length)return res.status(404).json({error:'Ativo não encontrado: '+list.join(',')});
    const results=assets.map(a=>{
      const price=parseFloat((10+Math.random()*90).toFixed(2));
      const chg=parseFloat((-3+Math.random()*6).toFixed(2));
      return{
        ticker:a.ticker,name:a.name,type:a.type,sector:a.sector,
        quote:{ticker:a.ticker,price,open:price*0.99,high:price*1.015,low:price*0.985,
          close:price,previousClose:parseFloat((price/(1+chg/100)).toFixed(2)),
          change:parseFloat((price*chg/100).toFixed(2)),changePercent:chg,
          volume:Math.floor(1e6+Math.random()*9e6),marketCap:null,source:'MOCK',
          timestamp:new Date().toISOString()},
        technicals:{rsi14:parseFloat((30+Math.random()*50).toFixed(1)),
          macd:0.12,macdSignal:0.08,macdHistogram:0.04,
          ma20:price*0.98,ma50:price*0.96,ma200:price*0.93,
          bbUpper:price*1.02,bbMiddle:price,bbLower:price*0.98,
          atr:1.5,adx:22,volumeRelative:1.1,
          trend:chg>0?'alta':'baixa',signal:chg>0?'bullish':'bearish'},
        fundamentals:a.type==='FII'?{
          dividendYield:parseFloat((6+Math.random()*8).toFixed(2)),
          pvp:parseFloat((0.8+Math.random()*0.4).toFixed(2)),pl:null,roe:null}:{
          pl:parseFloat((8+Math.random()*20).toFixed(1)),
          pvp:parseFloat((1+Math.random()*3).toFixed(2)),
          dividendYield:parseFloat((Math.random()*8).toFixed(2)),
          roe:parseFloat((8+Math.random()*25).toFixed(1)),
          debtToEquity:parseFloat((0.3+Math.random()*2).toFixed(2))},
        signals:[],sentiment:{label:'neutro',score:0},
      };
    });
    return res.json(list.length===1?results[0]:results);
  }catch(e:any){console.error('quotes error',e);return res.status(500).json({error:e.message});}
}