import{config}from '../../lib/config';
import{cache}from '../cache/redis';
import{NewsItem,Sentiment,ImpactLevel}from '../../types';
interface SentimentResult{sentiment:Sentiment;score:number;impactLevel:ImpactLevel;reasoning:string;keywords:string[];}
function ruleBased(text:string):SentimentResult{
  const lower=text.toLowerCase();
  const pos=['lucro','crescimento','alta','aprovação','dividendo','expansão','recorde','ganho','melhora'];
  const neg=['queda','perda','crise','fraude','rebaixamento','recuo','risco','prejuízo'];
  const hi=['selic','ipca','pib','copom','resultado','dividendo','guidance','ipo','fusão'];
  let score=0;pos.forEach(w=>{if(lower.includes(w))score+=0.2;});neg.forEach(w=>{if(lower.includes(w))score-=0.2;});
  score=Math.max(-1,Math.min(1,score));
  const sentiment:Sentiment=score>0.1?'positivo':score<-0.1?'negativo':'neutro';
  const hasHi=hi.some(w=>lower.includes(w));
  const impactLevel:ImpactLevel=hasHi?'alto':'médio';
  const keywords=[...pos,...neg].filter(w=>lower.includes(w));
  return{sentiment,score:+score.toFixed(3),impactLevel,reasoning:'Rule-based fallback',keywords};
}
export async function analyzeNewsSentiment(title:string,description=''):Promise<SentimentResult>{
  const text=`${title}. ${description}`.trim();
  const key=cache.keys.sentiment(Buffer.from(text).toString('base64').slice(0,32));
  return cache.getOrSet(key,async()=>{
    if(!config.claude.apiKey)return ruleBased(text);
    const prompt=`Analise a manchete financeira e retorne APENAS JSON válido, sem markdown:
"${text}"
{"sentiment":"positivo"|"neutro"|"negativo","score":-1.0 a 1.0,"impactLevel":"alto"|"médio"|"baixo","reasoning":"explicação curta","keywords":[]}`;
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':config.claude.apiKey,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:config.claude.model,max_tokens:256,messages:[{role:'user',content:prompt}]}),signal:AbortSignal.timeout(10000)});
      if(!res.ok)throw new Error(`Claude ${res.status}`);
      const data=await res.json();
      const raw=data.content?.[0]?.text??'{}';
      return JSON.parse(raw.replace(/```json|```/g,'').trim()) as SentimentResult;
    }catch(err){console.error('[Sentiment] Claude failed:',err);return ruleBased(text);}
  },config.redis.ttl.sentiment);
}
export async function enrichNewsWithSentiment(articles:NewsItem[]):Promise<NewsItem[]>{
  return Promise.all(articles.map(async article=>{const r=await analyzeNewsSentiment(article.title,article.description);return{...article,sentiment:r.sentiment,sentimentScore:r.score,impactLevel:r.impactLevel,keywords:[...new Set([...article.keywords,...r.keywords])]};} ));
}
export async function getTickerSentimentScore(articles:NewsItem[]){
  const withS=await enrichNewsWithSentiment(articles);const scored=withS.filter(a=>a.sentimentScore!==undefined);
  if(!scored.length)return{score:0,positiveCount:0,negativeCount:0,neutralCount:0,summary:'Sem dados'};
  const pos=scored.filter(a=>a.sentiment==='positivo').length;const neg=scored.filter(a=>a.sentiment==='negativo').length;const neu=scored.filter(a=>a.sentiment==='neutro').length;
  let wSum=0,wTotal=0;scored.forEach((a,i)=>{const w=1+(i/scored.length);const imp=a.impactLevel==='alto'?1.5:a.impactLevel==='médio'?1:0.6;wSum+=(a.sentimentScore??0)*w*imp;wTotal+=w*imp;});
  const score=+((wSum/(wTotal||1))*0.7).toFixed(3);
  const dom=pos>neg?'positivo':neg>pos?'negativo':'neutro';
  return{score,positiveCount:pos,negativeCount:neg,neutralCount:neu,summary:`Sentimento ${dom} (${scored.length} notícias)`};
}