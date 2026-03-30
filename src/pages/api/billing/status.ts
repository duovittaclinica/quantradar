import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
import{prisma}from '../../../database/client';

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='GET')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session)return res.status(401).end();
  const user=await prisma.user.findUnique({where:{id:session.user.id},select:{plan:true,planId:true}});
  return res.json(user);
}