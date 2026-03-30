import bcrypt from 'bcrypt';
import{prisma}from '../../lib/prisma';
import{logger}from '../../lib/logger';

export async function registerUser(email:string,name:string,password:string){
  const exists=await prisma.user.findUnique({where:{email}});
  if(exists)throw new Error('Email já cadastrado');
  const hash=await bcrypt.hash(password,10);
  const plan=await prisma.plan.findFirst({where:{name:'FREE'}});
  const user=await prisma.user.create({data:{email,name,passwordHash:hash,plan:'FREE',planId:plan?.id??null,role:'USER',profile:'MODERADO'}});
  logger.info('User registered',{email});
  return{id:user.id,email:user.email,name:user.name};
}
