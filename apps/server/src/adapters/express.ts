import { ExpressAdapter } from '@nestjs/platform-express';
import { Express } from 'express';

const app = (router: Express) => new ExpressAdapter(router);

export default app;
