import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../lib/prisma';
import{logger}from '../lib/logger';
import{fetchNews}from '../services/news/newsapi';
import{analyzeSentiment}from '../services/sentiment/analyzer';

export async function refreshNews(){
  const start=Date.now();
  try{
    const articles=await fetchNews();
    let count=0;
    for(const a of articles.slice(0,50)){
      const sentiment=await analyzeSentiment(a.title??'',[a.title??'',a.description??''].filter(Boolean));
      await prisma.newsCache.upsert({
        where:{url:a.url??'unknown-'+Date.now()},
        update:{sentiment:sentiment.label,sentimentScore:sentiment.score,cachedAt:new Date()},
        create:{title:a.title??'',description:a.description,url:a.url??'unknown-'+Date.now(),source:a.source??'unknown',sentiment:sentiment.label,sentimentScore:sentiment.score,tickers:a.tickers??[],publishedAt:new Date(a.publishedAt??Date.now())},
      });
      count++;
    }
    const dur=Date.now()-start;
    await prisma.jobLog.create({data:{jobName:'news-refresh',status:'success',durationMs:dur,itemCount:count}});
    return{count,duration:dur};
  }catch(e:any){
    await prisma.jobLog.create({data:{jobName:'news-refresh',status:'error',durationMs:Date.now()-start,error:e.message}});
    throw e;
  }
}
