import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new PrismaClient({log:['error']});
  try {
    const result = await client.$queryRaw`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('plans','quantradar_users','assets') LIMIT 10`;
    const count = await client.plan.count();
    return res.json({ status: 'connected', tables: result, planCount: count, dbUrl: process.env.DATABASE_URL?.slice(0,60)+'...' });
  } catch (e: any) {
    return res.json({ status: 'error', message: e.message, code: e.code, dbUrl: process.env.DATABASE_URL?.slice(0,60)+'...' });
  } finally {
    await client.$disconnect();
  }
}
