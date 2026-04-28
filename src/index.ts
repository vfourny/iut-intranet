import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express'; 
import { appRouter } from './appRouteur';

const app = express();

//Use of the endpoints of the appRouteur
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
  })
);

const port = 3000;
app.listen(port, () => {
    console.log(`Mon serveur démarre sur le port ${port}`)
})