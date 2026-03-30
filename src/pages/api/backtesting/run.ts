import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
import{prisma}from '../../../database/client';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session)return res.status(401).json({error:'Unauthorized'});
  const{ticker='PETR4',profile='MODERADO',minScore=65,targetPct=8,stopPct=4}=req.body||{};
  try{
    const asset=await prisma.asset.findUnique({where:{ticker}});
    if(!asset)return res.status(404).json({error:'Ativo não encontrado: '+ticker});
    // Generate mock backtest results
    const trades=[];
    let equity=10000,wins=0,losses=0;
    const days=90;
    for(let i=0;i<days;i++){
      if(Math.random()>0.85){
        const isWin=Math.random()>0.4;
        const pnlPct=isWin?targetPct*(0.5+Math.random()*0.8):-stopPct*(0.5+Math.random()*0.7);
        const pnl=equity*(pnlPct/100);
        equity+=pnl;
        if(isWin)wins++;else losses++;
        const entryDate=new Date();entryDate.setDate(entryDate.getDate()-days+i);
        const exitDate=new Date(entryDate);exitDate.setDate(exitDate.getDate()+Math.floor(2+Math.random()*8));
        trades.push({entryDate:entryDate.toISOString().slice(0,10),exitDate:exitDate.toISOString().slice(0,10),
          entryPrice:parseFloat((20+Math.random()*60).toFixed(2)),
          exitPrice:parseFloat((20+Math.random()*60).toFixed(2)),
          pnlPercent:parseFloat(pnlPct.toFixed(2)),pnlAbsolute:parseFloat(pnl.toFixed(2)),
          result:isWin?'WIN':'LOSS',holdingDays:Math.floor(2+Math.random()*8)});
      }
    }
    const totalTrades=wins+losses;
    const totalReturn=((equity-10000)/10000)*100;
    const winRate=totalTrades>0?(wins/totalTrades)*100:0;
    return res.json({
      ticker,profile,
      summary:{totalReturn:parseFloat(totalReturn.toFixed(2)),
        totalTrades,wins,losses,
        winRate:parseFloat(winRate.toFixed(1)),
        avgWin:parseFloat((targetPct*0.7).toFixed(2)),
        avgLoss:parseFloat((stopPct*0.6).toFixed(2)),
        sharpeRatio:parseFloat((0.8+Math.random()*1.5).toFixed(2)),
        maxDrawdown:parseFloat((-5-Math.random()*15).toFixed(2)),
        profitFactor:parseFloat((winRate/Math.max(100-winRate,1)*1.2).toFixed(2)),
        finalEquity:parseFloat(equity.toFixed(2))},
      trades:trades.slice(-30),
      equityCurve:Array.from({length:30},(_,i)=>({
        date:new Date(Date.now()-(29-i)*86400000).toISOString().slice(0,10),
        equity:parseFloat((10000*(1+totalReturn/100*(i/29))).toFixed(2))
      })),
    });
  }catch(e:any){console.error('backtest error',e);return res.status(500).json({error:e.message});}
}