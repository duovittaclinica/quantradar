import{prisma}from '../../lib/prisma';
import{logger}from '../../lib/logger';

export async function upgradeUserPlan(userId:string,planName:string){
  const plan=await prisma.plan.findFirst({where:{name:planName}});
  if(!plan)throw new Error('Plan not found');
  const user=await prisma.user.update({where:{id:userId},data:{plan:planName,planId:plan.id}});
  return user;
}
export async function updateProfile(userId:string,profile:string){
  return prisma.user.update({where:{id:userId},data:{profile}});
}
