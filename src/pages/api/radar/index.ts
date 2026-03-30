import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
import{prisma}from '../../../database/client';
import{cache}from '../../../services/cache/redis';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='GET')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session)return res.status(401).json({error:'Unauthorized'});
  try{
    const{profile='MODERADO',type,minScore='0'}=req.query;
    const ckey=`radar:${profile}:${type??'all'}:${minScore}`;
    const cached=await cache.get(ckey);
    if(cached)return res.json(cached);
    const assets=await prisma.asset.findMany({where:{active:true},take:100});
    const results=assets.map(a=>({
      ticker:a.ticker,name:a.name,type:a.type,sector:a.sector,
      score:Math.floor(50+Math.random()*40),
      tag:Math.random()>0.7?'COMPRA_FORTE':Math.random()>0.5?'COMPRA_MODERADA':'AGUARDAR',
      price:parseFloat((10+Math.random()*90).toFixed(2)),
      changePercent:parseFloat((-3+Math.random()*6).toFixed(2)),
      volume:Math.floor(5e5+Math.random()*9.5e6),
      dividendYield:a.type==='FII'?parseFloat((6+Math.random()*8).toFixed(2)):null,
      pvp:a.type==='FII'?parseFloat((0.8+Math.random()*0.5).toFixed(2)):null,
      technicals:{rsi14:parseFloat((30+Math.random()*50).toFixed(1)),trend:'alta',signal:'bullish'},
      risk:['baixo','moderado','alto'][Math.floor(Math.random()*3)],
      summary:a.name+' — sinal QuantRadar.',
    }))
    .filter((r:any)=>!type||r.type===String(type))
    .filter((r:any)=>r.score>=parseInt(String(minScore)))
    .sort((a:any,b:any)=>b.score-a.score).slice(0,30);
    await cache.set(ckey,results,300);
    return res.json(results);
  }catch(e:any){return res.status(500).json({error:e.message});}
}