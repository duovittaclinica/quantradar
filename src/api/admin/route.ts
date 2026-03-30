import{prisma}from '../../lib/prisma';
import{logger}from '../../lib/logger';

export async function getAdminStats(){
  const[userCount,signalCount,alertCount,jobLogs]=await Promise.all([
    prisma.user.count(),
    prisma.signal.count(),
    prisma.alert.count({where:{active:true}}),
    prisma.jobLog.findMany({orderBy:{createdAt:'desc'},take:20}),
  ]);
  return{userCount,signalCount,alertCount,jobLogs};
}
export async function getAdminConfig(){
  return{radarEnabled:true,alertsEnabled:true,aiEnabled:!!process.env.ANTHROPIC_API_KEY,brapiEnabled:!!process.env.BRAPI_TOKEN};
}
