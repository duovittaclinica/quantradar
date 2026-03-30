import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../../../database/client';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='GET')return res.status(405).end();
  try{
    const news=await prisma.newsCache.findMany({orderBy:{publishedAt:'desc'},take:20});
    if(news.length>0)return res.json(news);
    return res.json([
      {id:'1',title:'Ibovespa sobe com exterior positivo',source:'Reuters',sentiment:'positivo',sentimentScore:0.7,publishedAt:new Date(),tickers:[]},
      {id:'2',title:'Petrobras anuncia dividendos acima do esperado',source:'Valor',sentiment:'positivo',sentimentScore:0.85,publishedAt:new Date(),tickers:['PETR4']},
      {id:'3',title:'Banco Central mantém Selic em 10,5%',source:'InfoMoney',sentiment:'neutro',sentimentScore:0.1,publishedAt:new Date(),tickers:[]},
      {id:'4',title:'Vale reporta queda na produção de minério',source:'Bloomberg',sentiment:'negativo',sentimentScore:-0.5,publishedAt:new Date(),tickers:['VALE3']},
    ]);
  }catch(e:any){return res.status(500).json({error:e.message});}
}