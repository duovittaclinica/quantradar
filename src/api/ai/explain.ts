import{prisma}from '../../lib/prisma';
import{logger}from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const client=new Anthropic();

export async function generateAiExplanation(ticker:string,profile='MODERADO',question?:string){
  try{
    const signal=await prisma.signal.findFirst({where:{asset:{ticker}},orderBy:{generatedAt:'desc'}});
    const score=signal?.score??50;
    const tag=signal?.tag??'AGUARDAR';
    const breakdown=(signal?.breakdown as any)??{};
    const j=(signal?.justification as any[]??[]).slice(0,5).map((x:any)=>x.description||'').join('; ');
    const prompt=`Analise ${ticker} (Score:${score}/100, ${tag}) em pt-BR.\nJustificativas: ${j||'Sem dados'}.\n${question?'Pergunta: '+question:'Análise completa com recomendação.'}`;
    const msg=await client.messages.create({model:'claude-sonnet-4-20250514',max_tokens:600,messages:[{role:'user',content:prompt}]});
    const analysis=msg.content[0].type==='text'?msg.content[0].text:'';
    return{analysis,score,tag,breakdown,usageRemaining:0};
  }catch(e:any){logger.error('AI explain error',e);throw e;}
}

export async function aiChat(ticker:string|undefined,messages:{role:string;content:string}[]):Promise<string>{
  const sys=ticker?`Assistente financeiro especializado em ${ticker}.`:'Assistente financeiro do mercado BR.';
  const msg=await client.messages.create({model:'claude-sonnet-4-20250514',max_tokens:400,system:sys,messages:messages.map(m=>({role:m.role as 'user'|'assistant',content:m.content}))});
  return msg.content[0].type==='text'?msg.content[0].text:'';
}
