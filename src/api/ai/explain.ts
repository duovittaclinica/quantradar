import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../auth/config';
import{prisma}from '../lib/prisma';
import{logger}from '../lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const client=new Anthropic();

export async function generateAiExplanation(ticker:string,profile='MODERADO',question?:string):Promise<{analysis:string;score:number;tag:string;breakdown:any;usageRemaining:number}>{
  const asset=await prisma.asset.findUnique({where:{ticker}});
  const signal=await prisma.signal.findFirst({where:{asset:{ticker}},orderBy:{generatedAt:'desc'}});
  const score=signal?.score??50;
  const tag=signal?.tag??'AGUARDAR';
  const breakdown=signal?.breakdown??{};
  const justification=(signal?.justification as any[]??[]).slice(0,5).map((j:any)=>j.description).join('; ');
  const prompt=`Você é um analista de investimentos do mercado brasileiro. Analise ${ticker} (Score:${score}/100, ${tag}) de forma clara e objetiva em pt-BR.\n\nJustificativas: ${justification||'Nenhuma disponível'}.\n\n${question?'Pergunta: '+question:'Forneça uma análise completa com recomendação.'}`;
  const msg=await client.messages.create({model:'claude-sonnet-4-20250514',max_tokens:600,messages:[{role:'user',content:prompt}]});
  const analysis=msg.content[0].type==='text'?msg.content[0].text:'';
  return{analysis,score,tag,breakdown,usageRemaining:0};
}

export async function aiChat(ticker:string|undefined,messages:{role:string;content:string}[]):Promise<string>{
  const sys=ticker?`Você é um assistente de análise financeira especializado em ${ticker} e no mercado brasileiro.`:'Você é um assistente de análise financeira do mercado brasileiro.';
  const msg=await client.messages.create({model:'claude-sonnet-4-20250514',max_tokens:400,system:sys,messages:messages.map(m=>({role:m.role as 'user'|'assistant',content:m.content}))});
  return msg.content[0].type==='text'?msg.content[0].text:'';
}
