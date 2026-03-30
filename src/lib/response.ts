import type{NextApiResponse}from 'next';
export const ok=(res:NextApiResponse,data:unknown)=>res.status(200).json(data);
export const created=(res:NextApiResponse,data:unknown)=>res.status(201).json(data);
export const badRequest=(res:NextApiResponse,msg='Bad Request')=>res.status(400).json({error:msg});
export const unauthorized=(res:NextApiResponse)=>res.status(401).json({error:'Unauthorized'});
export const forbidden=(res:NextApiResponse)=>res.status(403).json({error:'Forbidden'});
export const notFound=(res:NextApiResponse,msg='Not Found')=>res.status(404).json({error:msg});
export const serverError=(res:NextApiResponse,msg='Internal Server Error')=>res.status(500).json({error:msg});
export const methodNotAllowed=(res:NextApiResponse)=>res.status(405).json({error:'Method Not Allowed'});