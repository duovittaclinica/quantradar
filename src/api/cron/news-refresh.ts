import{prisma}from '../../lib/prisma';
import{logger}from '../../lib/logger';

export async function refreshNews(){
  const start=Date.now();
  try{
    const dur=Date.now()-start;
    await prisma.jobLog.create({data:{jobName:'news-refresh',status:'success',durationMs:dur,itemCount:0}});
    return{count:0,duration:dur};
  }catch(e:any){
    await prisma.jobLog.create({data:{jobName:'news-refresh',status:'error',durationMs:Date.now()-start,error:e.message}});
    throw e;
  }
}
