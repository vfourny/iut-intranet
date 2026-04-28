import { initTRPC } from '@trpc/server';
import { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
}

const t = initTRPC.context<Context>().create({ isDev: false});

export const router = t.router;
export const publicProcedure = t.procedure;