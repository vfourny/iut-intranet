import { router, publicProcedure } from './trpc';
import { User } from '@prisma/client';

export const appRouter = router({

  //get the users of the seed
  userList: publicProcedure
    .query(async () => {
      const users: User[] = [{ id: 1, name: 'Armand', lastName: 'Cuvelier' }];

      return users;
    }),
});
 
export type AppRouter = typeof appRouter;