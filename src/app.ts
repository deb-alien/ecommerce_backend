import { Application } from 'express';
import 'reflect-metadata';
import Container from 'typedi';

import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { createExpressServer, useContainer } from 'routing-controllers';
import { loadControllers, loadMiddlewares } from './utils/auto-load';

dotenv.config({ quiet: true });

async function bootstrap() {
  useContainer(Container);

  const controllers = loadControllers(path.join(__dirname, 'apps'));
  const middlewares = loadMiddlewares(path.join(__dirname, 'middlewares'));

  const app: Application = createExpressServer({
    controllers,
    middlewares,
    defaultErrorHandler: false,
  });

  app.use(cors());
  app.use(morgan('dev'));
  app.use(helmet());

  app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
}

void bootstrap();