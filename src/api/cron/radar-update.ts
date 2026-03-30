import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../lib/prisma';
import{logger}from '../lib/logger';
import{cache}from '../services/cache/redis';
import{runRadar}from '../services/scoring/radar';

export async function updateRadar(){
  const start=Date.now();
  try{
    const assets=await prisma.asset.findMany({where:{active:true},take:50});
    const results=await runRadar(assets,'MODERADO');
    await cache.flush('radar:*');
    await cache.set('radar:MODERADO:all:0',results,300);
    const dur=Date.now()-start;
    await prisma.jobLog.create({data:{jobName:'radar-update',status:'success',durationMs:dur,itemCount:results.length}});
    return{count:results.length,duration:dur};
  }catch(e:any){
    await prisma.jobLog.create({data:{jobName:'radar-update',status:'error',durationMs:Date.now()-start,error:e.message}});
    throw e;
  }
}
