import type{NextApiRequest,NextApiResponse,NextApiHandler}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../auth/config';
export function withAuth(handler:NextApiHandler){
  return async(req:NextApiRequest,res:NextApiResponse)=>{
    const session=await getServerSession(req,res,authOptions);
    if(!session)return res.status(401).json({error:'Unauthorized'});
    (req as any).session=session;
    return handler(req,res);
  };
}
export function withOptionalAuth(handler:NextApiHandler){
  return async(req:NextApiRequest,res:NextApiResponse)=>{
    try{const session=await getServerSession(req,res,authOptions);(req as any).session=session;}catch{}
    return handler(req,res);
  };
}
export function withAdminAuth(handler:NextApiHandler){
  return async(req:NextApiRequest,res:NextApiResponse)=>{
    const session=await getServerSession(req,res,authOptions);
    if(!session||session.user.role!=='ADMIN')return res.status(403).json({error:'Forbidden'});
    (req as any).session=session;
    return handler(req,res);
  };
}