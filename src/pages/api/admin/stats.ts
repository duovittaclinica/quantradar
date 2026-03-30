import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
import{prisma}from '../../../database/client';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='GET')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session||session.user.role!=='ADMIN')return res.status(403).end();
  try{
    const[users,plans,signals,assets,jobLogs]=await Promise.all([
      prisma.user.count(),
      prisma.plan.findMany({include:{_count:{select:{users:true}}}}),
      prisma.signal.count(),
      prisma.asset.count({where:{active:true}}),
      prisma.jobLog.findMany({orderBy:{createdAt:'desc'},take:10}),
    ]);
    return res.json({users,plans,signals,assets,jobLogs,
      byPlan:plans.map(p=>({name:p.name,count:p._count.users}))});
  }catch(e:any){return res.status(500).json({error:e.message});}
}