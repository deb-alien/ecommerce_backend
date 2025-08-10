import { NextFunction, Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, _request: Request, response: Response, _next: NextFunction) {
    const status = response.statusCode || 500;

    return response.status(status).json({
      message: error.message || 'Internal Server Error',
      name: error.name,
      errors: error?.errors || [],
    });
  }
}
