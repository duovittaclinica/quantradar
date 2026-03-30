import type{Asset}from '@prisma/client';
export async function runRadar(assets:Asset[],profile='MODERADO'){
  return assets.map(a=>({
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
    summary:a.name+' — sinal gerado pelo QuantRadar.',
  })).sort((a:any,b:any)=>b.score-a.score);
}