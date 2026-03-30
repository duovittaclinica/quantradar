import type{NextApiRequest,NextApiResponse}from 'next';

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  const dbUrl=process.env.DATABASE_URL||'NOT SET';
  const directUrl=process.env.DIRECT_URL||'NOT SET';
  
  // Try prisma connection
  let dbError='';
  let dbOk=false;
  try{
    const{PrismaClient}=require('@prisma/client');
    const p=new PrismaClient({datasources:{db:{url:process.env.DATABASE_URL}}});
    await p.$queryRaw`SELECT 1 as test`;
    await p.$disconnect();
    dbOk=true;
  }catch(e:any){dbError=e.message||String(e);}
  
  return res.json({
    dbUrl:dbUrl.replace(/:[^:@]+@/,':[REDACTED]@'),
    directUrl:directUrl.replace(/:[^:@]+@/,':[REDACTED]@'),
    dbOk,dbError:dbError.slice(0,500),
    nodeEnv:process.env.NODE_ENV,
  });
}
