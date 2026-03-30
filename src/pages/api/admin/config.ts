import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  const session=await getServerSession(req,res,authOptions);
  if(!session||session.user.role!=='ADMIN')return res.status(403).end();
  return res.json({
    radarEnabled:true,alertsEnabled:true,
    aiEnabled:!!process.env.ANTHROPIC_API_KEY,
    brapiEnabled:!!process.env.BRAPI_TOKEN,
    appmaxEnabled:!!process.env.APPMAX_API_KEY,
    appmaxConfigured:!!(process.env.APPMAX_API_KEY&&process.env.APPMAX_SECRET),
  });
}