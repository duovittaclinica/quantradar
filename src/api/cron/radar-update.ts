import{prisma}from '../../lib/prisma';
import{logger}from '../../lib/logger';
import{cache}from '../../services/cache/redis';

export async function updateRadar(){
  const start=Date.now();
  try{
    const count=await prisma.asset.count();
    await cache.flush('radar:');
    const dur=Date.now()-start;
    await prisma.jobLog.create({data:{jobName:'radar-update',status:'success',durationMs:dur,itemCount:count}});
    return{count,duration:dur};
  }catch(e:any){
    await prisma.jobLog.create({data:{jobName:'radar-update',status:'error',durationMs:Date.now()-start,error:e.message}});
    throw e;
  }
}
