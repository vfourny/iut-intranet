import { authRouter } from './auth/auth.router.js';
import { router, publicProcedure } from './trpc.js';
import { User } from '@prisma/client';

export const appRouter = router({

  //Authentification files (signIn, signUp)
  auth: authRouter,

  //get the users of the seed
  userList: publicProcedure
    .query(async () => {
      const users: User[] = [{ id: 1, name: 'Armand', lastName: 'Cuvelier' }];

      return users;
    }),
});
 
export type AppRouter = typeof appRouter;