import type{NextApiRequest,NextApiResponse}from 'next';
import bcrypt from 'bcrypt';
import{prisma}from '../../../database/client';
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  try{
    const{email,name,password}=req.body;
    if(!email||!name||!password)return res.status(400).json({error:'Campos obrigatórios faltando'});
    if(password.length<6)return res.status(400).json({error:'Senha muito curta (mín 6 caracteres)'});
    const exists=await prisma.user.findUnique({where:{email}});
    if(exists)return res.status(400).json({error:'Email já cadastrado'});
    const hash=await bcrypt.hash(password,10);
    const plan=await prisma.plan.findFirst({where:{name:'FREE'}});
    const user=await prisma.user.create({data:{
      email,name,passwordHash:hash,role:'USER',plan:'FREE',
      planId:plan?.id??null,profile:'MODERADO'
    }});
    return res.status(201).json({id:user.id,email:user.email,name:user.name,plan:user.plan});
  }catch(e:any){return res.status(500).json({error:e.message});}
}