import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { prisma } from '../../../database/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow with secret to prevent abuse
  const secret = req.query.secret || req.body?.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Hash Admin@123 with bcrypt at runtime
    const hash = await bcrypt.hash('Admin@123', 10);

    // Upsert admin user with freshly generated hash
    const user = await prisma.user.upsert({
      where: { email: 'admin@quantradar.com.br' },
      update: { passwordHash: hash, role: 'ADMIN', plan: 'PREMIUM' },
      create: {
        id: 'user_admin_001',
        email: 'admin@quantradar.com.br',
        name: 'Admin QuantRadar',
        passwordHash: hash,
        role: 'ADMIN',
        plan: 'PREMIUM',
        profile: 'MODERADO',
        planId: 'plan_premium',
      },
    });

    // Seed plans if not exist
    await prisma.plan.upsert({
      where:{name:'FREE'}, update:{},
      create:{id:'plan_free',name:'FREE',maxAssets:10,maxAlerts:5,maxAiDaily:3,cacheSeconds:300,backtestDays:30}
    });
    await prisma.plan.upsert({
      where:{name:'PRO'}, update:{},
      create:{id:'plan_pro',name:'PRO',maxAssets:30,maxAlerts:50,maxAiDaily:50,cacheSeconds:60,backtestDays:365}
    });
    await prisma.plan.upsert({
      where:{name:'PREMIUM'}, update:{},
      create:{id:'plan_premium',name:'PREMIUM',maxAssets:100,maxAlerts:999,maxAiDaily:999,cacheSeconds:30,backtestDays:730}
    });

    // Seed watchlist for admin
    const wl = await prisma.watchlist.upsert({
      where:{id:'wl_admin_001'},
      update:{},
      create:{id:'wl_admin_001',userId:user.id,name:'Principal'}
    });

    return res.json({
      success: true,
      admin: { id: user.id, email: user.email, role: user.role },
      message: 'Admin password reset to Admin@123'
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
