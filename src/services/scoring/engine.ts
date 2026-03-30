import{EnrichedAsset,ScoreWeights,ScoreBreakdown,ScoringResult,JustificationItem,RiskItem,SignalTag,InvestorProfile}from '../../types';
import{config}from '../../lib/config';
const PW:Record<InvestorProfile,ScoreWeights>={
  CONSERVADOR:{technical:20,fundamental:40,sentiment:15,liquidity:25},
  MODERADO:{technical:35,fundamental:30,sentiment:20,liquidity:15},
  AGRESSIVO:{technical:50,fundamental:20,sentiment:20,liquidity:10},
  DIVIDENDOS:{technical:15,fundamental:55,sentiment:10,liquidity:20},
  VALORIZACAO:{technical:40,fundamental:40,sentiment:15,liquidity:5},
  CURTO_PRAZO:{technical:60,fundamental:10,sentiment:25,liquidity:5},
  LONGO_PRAZO:{technical:20,fundamental:50,sentiment:10,liquidity:20},
};
function scoreTechnical(a:EnrichedAsset,jj:JustificationItem[]):number{
  const t=a.technicals;let s=50;
  const j=(f:string,d:string,i:JustificationItem['impact'],delta:number,w=10)=>{s+=delta;jj.push({factor:f,description:d,impact:i,weight:w});};
  if(t.rsi14<30)j('RSI',`RSI ${t.rsi14} — sobrevenda`,'positive',15,15);
  else if(t.rsi14<45)j('RSI',`RSI ${t.rsi14} — abaixo neutro`,'positive',8,10);
  else if(t.rsi14>70)j('RSI',`RSI ${t.rsi14} — sobrecomprado`,'negative',-12,12);
  else if(t.rsi14>60)j('RSI',`RSI ${t.rsi14} — levemente alto`,'negative',-5,8);
  else j('RSI',`RSI ${t.rsi14} — neutro`,'neutral',0,5);
  if(t.macdHistogram>0&&t.macd>t.macdSignal)j('MACD','Momentum positivo','positive',10,12);
  else if(t.macdHistogram<0&&t.macd<t.macdSignal)j('MACD','Momentum negativo','negative',-8,10);
  else j('MACD','MACD em cruzamento','neutral',0,5);
  if(t.trend==='alta')j('Tendência','Acima das médias móveis','positive',12,15);
  else if(t.trend==='lateral')j('Tendência','Em consolidação','neutral',0,5);
  else j('Tendência','Tendência de baixa','negative',-12,12);
  const p=a.quote.price;
  if(p<t.bbLower)j('Bollinger','Abaixo da banda inferior','positive',10,10);
  else if(p>t.bbUpper)j('Bollinger','Acima da banda superior','negative',-8,8);
  if(t.volumeRelative>1.5)j('Volume',`Volume ${t.volumeRelative}x acima`,'positive',8,10);
  else if(t.volumeRelative<0.5)j('Volume','Volume baixo','negative',-5,5);
  if(t.adx>25)j('ADX',`ADX ${t.adx} — tendência forte`,'positive',5,8);
  return Math.max(0,Math.min(100,s));
}
function scoreFundamental(a:EnrichedAsset,jj:JustificationItem[]):number{
  const f=a.fundamentals;const tp=a.type;let s=50;
  const j=(factor:string,d:string,i:JustificationItem['impact'],delta:number,w=10)=>{s+=delta;jj.push({factor,description:d,impact:i,weight:w});};
  if(tp==='ETF'||tp==='CRIPTO'){j('Tipo',`${tp} — análise limitada`,'neutral',0,5);return 60;}
  if(f.pl!=null){if(f.pl<8)j('P/L',`P/L ${f.pl}x — barato`,'positive',15,15);else if(f.pl<15)j('P/L',`P/L ${f.pl}x — razoável`,'positive',7,10);else if(f.pl>30)j('P/L',`P/L ${f.pl}x — caro`,'negative',-10,12);else if(f.pl<0)j('P/L','Prejuízo','negative',-15,15);}
  if(f.pvp!=null){if(f.pvp<0.8)j('P/VP',`P/VP ${f.pvp} — abaixo do patrimônio`,'positive',12,12);else if(f.pvp<1.2)j('P/VP',`P/VP ${f.pvp} — próximo ao patrimonial`,'positive',5,8);else if(f.pvp>3)j('P/VP',`P/VP ${f.pvp} — alto prêmio`,'negative',-8,10);}
  if(f.dividendYield!=null){if(f.dividendYield>10)j('DY',`DY ${f.dividendYield}% — excepcional`,'positive',15,15);else if(f.dividendYield>6)j('DY',`DY ${f.dividendYield}% — acima da média`,'positive',8,12);else if(f.dividendYield>3)j('DY',`DY ${f.dividendYield}% — moderado`,'positive',3,8);else if(f.dividendYield===0)j('DY','Sem dividendos','negative',-5,5);}
  if(f.roe!=null){if(f.roe>20)j('ROE',`ROE ${f.roe}% — muito rentável`,'positive',12,12);else if(f.roe>12)j('ROE',`ROE ${f.roe}% — adequado`,'positive',5,8);else if(f.roe<5)j('ROE',`ROE ${f.roe}% — baixo`,'negative',-8,10);}
  return Math.max(0,Math.min(100,s));
}
function scoreSentiment(ss:number|undefined,jj:JustificationItem[]):number{
  if(ss==null){jj.push({factor:'Sentimento',description:'Sem dados',impact:'neutral',weight:0});return 50;}
  const normalized=(ss+1)*50;
  if(ss>0.4)jj.push({factor:'Sentimento',description:`Notícias positivas (score:${ss.toFixed(2)})`,impact:'positive',weight:20});
  else if(ss>0.1)jj.push({factor:'Sentimento',description:`Notícias levemente positivas`,impact:'positive',weight:15});
  else if(ss<-0.3)jj.push({factor:'Sentimento',description:`Notícias negativas (score:${ss.toFixed(2)})`,impact:'negative',weight:20});
  else jj.push({factor:'Sentimento',description:'Notícias neutras',impact:'neutral',weight:10});
  return Math.max(0,Math.min(100,normalized));
}
function scoreLiquidity(a:EnrichedAsset,jj:JustificationItem[]):number{
  const v=a.quote.volume;const tp=a.type;let s=50;
  const j=(f:string,d:string,i:JustificationItem['impact'],delta:number,w=10)=>{s+=delta;jj.push({factor:f,description:d,impact:i,weight:w});};
  const min=tp==='CRIPTO'?1e9:tp==='FII'?5e5:2e6;
  if(v>min*5)j('Liquidez','Volume excelente','positive',20,20);
  else if(v>min)j('Liquidez','Boa liquidez','positive',10,15);
  else if(v<min*0.2)j('Liquidez','Liquidez baixa','negative',-15,15);
  const atrPct=a.quote.price>0?(a.technicals.atr/a.quote.price)*100:0;
  if(tp!=='CRIPTO'){if(atrPct>4)j('Volatilidade',`ATR ${atrPct.toFixed(1)}% — alta`,'negative',-10,10);else if(atrPct<1.5)j('Volatilidade','Volatilidade controlada','positive',5,8);}
  return Math.max(0,Math.min(100,s));
}
function identifyRisks(a:EnrichedAsset):RiskItem[]{
  const r:RiskItem[]=[],t=a.technicals,f=a.fundamentals,p=a.quote.price;
  if(t.rsi14>70)r.push({type:'Sobrecompra',description:`RSI ${t.rsi14}`,severity:'medium'});
  if(t.trend==='baixa')r.push({type:'Tendência Negativa',description:'Ativo em queda',severity:'high'});
  if(a.type==='CRIPTO')r.push({type:'Alta Volatilidade',description:'Cripto — risco elevado',severity:'high'});
  if(f.debtToEquity&&f.debtToEquity>2.5)r.push({type:'Endividamento',description:`D/PL ${f.debtToEquity}x`,severity:'medium'});
  if(f.pl&&f.pl>30)r.push({type:'Valuation Elevado',description:`P/L ${f.pl}x`,severity:'low'});
  if(a.quote.volume<100_000)r.push({type:'Baixa Liquidez',description:'Volume insuficiente',severity:'high'});
  return r;
}
function determineTag(score:number,risks:RiskItem[]):SignalTag{
  const hasHigh=risks.some(r=>r.severity==='high');
  if(hasHigh&&score<70)return 'ALTO_RISCO';
  if(score>=config.scoring.minScoreCompraForte)return 'COMPRA_FORTE';
  if(score>=config.scoring.minScoreCompraMod)return 'COMPRA_MODERADA';
  if(score>=config.scoring.minScoreAguardar)return 'AGUARDAR';
  return 'ALTO_RISCO';
}
function estimateTargets(a:EnrichedAsset):{targetPrice?:number;stopLoss?:number;horizon:'curto'|'médio'|'longo'}{
  const p=a.quote.price,t=a.technicals;
  return{targetPrice:+(Math.max(t.bbUpper,p+t.atr*2)).toFixed(2),stopLoss:+(Math.min(t.bbLower,p-t.atr*1.5)).toFixed(2),horizon:t.trend==='alta'&&t.adx>25?'curto':a.type==='FII'?'longo':'médio'};
}
export function calculateScore(a:EnrichedAsset,sentimentScore?:number,profile:InvestorProfile='MODERADO'):ScoringResult{
  const w=PW[profile]??PW.MODERADO;const jj:JustificationItem[]=[];
  const ts=scoreTechnical(a,jj);const fs=scoreFundamental(a,jj);const ss=scoreSentiment(sentimentScore,jj);const ls=scoreLiquidity(a,jj);
  const total=+(ts*w.technical/100+fs*w.fundamental/100+ss*w.sentiment/100+ls*w.liquidity/100).toFixed(1);
  const risks=identifyRisks(a);const tag=determineTag(total,risks);const{targetPrice,stopLoss,horizon}=estimateTargets(a);
  return{ticker:a.ticker,score:total,tag,breakdown:{technical:+ts.toFixed(1),fundamental:+fs.toFixed(1),sentiment:+ss.toFixed(1),liquidity:+ls.toFixed(1),total},justification:jj,risks,targetPrice,stopLoss,horizon,confidence:Math.min(1,jj.length/10),weights:{technical:w.technical,fundamental:w.fundamental,sentiment:w.sentiment,liquidity:w.liquidity},generatedAt:new Date()};
}
export function batchCalculateScores(assets:EnrichedAsset[],sentimentMap=new Map<string,number>(),profile:InvestorProfile='MODERADO'):ScoringResult[]{
  return assets.map(a=>calculateScore(a,sentimentMap.get(a.ticker),profile)).sort((a,b)=>b.score-a.score);
}