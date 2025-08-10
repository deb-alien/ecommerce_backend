import 'reflect-metadata';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import Container from 'typedi';
import { useContainer, useExpressServer } from 'routing-controllers';

import connectMongo from './utils/database';

dotenv.config({ quiet: true });

async function bootstrap() {
    useContainer(Container);

    await connectMongo();

    const app = express();

    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));

    useExpressServer(app, {
        routePrefix: '/api/v1',
        controllers: [path.join(__dirname, 'apps', '**', '*.controller.{ts,js}')],
        middlewares: [path.join(__dirname, 'middlewares', '*.middleware.{ts,js}')],
        defaultErrorHandler: false,
        validation: {
            whitelist: true,
            forbidNonWhitelisted: true,
        },
    });

    app.listen(process.env.PORT ?? 3000, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
}

void bootstrap();
