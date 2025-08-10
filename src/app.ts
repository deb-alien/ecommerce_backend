import { Application } from 'express';
import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import Container from 'typedi';

async function bootstrap() {
  useContainer(Container);

  const app: Application = createExpressServer({
    controllers: [],
    middlewares: [],
  });

  app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
  });
}

/**
	const controllers = loadControllers(path.join(__dirname, 'modules'));
	const middlewares = loadMiddlewares(path.join(__dirname, 'middlewares'));
 */
