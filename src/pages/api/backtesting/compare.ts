import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session)return res.status(401).json({error:'Unauthorized'});
  const{tickers=['PETR4','VALE3'],profile='MODERADO'}=req.body||{};
  try{
    const results=tickers.map((t:string)=>({
      ticker:t,profile,
      totalReturn:parseFloat((-10+Math.random()*50).toFixed(2)),
      winRate:parseFloat((40+Math.random()*40).toFixed(1)),
      sharpeRatio:parseFloat((0.5+Math.random()*2).toFixed(2)),
      maxDrawdown:parseFloat((-5-Math.random()*20).toFixed(2)),
      totalTrades:Math.floor(10+Math.random()*30),
    }));
    return res.json({results,best:results.reduce((a:any,b:any)=>a.totalReturn>b.totalReturn?a:b)});
  }catch(e:any){return res.status(500).json({error:e.message});}
}