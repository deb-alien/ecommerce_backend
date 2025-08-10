import { ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, _request: Request, response: Response, _next: NextFunction) {
        const status = error.httpCode || response.statusCode || 500;

        let message = 'Something went wrong';
        let errors = undefined;

        if (error.name === 'BadRequestError' && Array.isArray(error.errors)) {
            errors = error.errors.map((e: ValidationError) => ({
                property: e.property,
                constraints: e.constraints,
            }));
            message = 'Validation failed';
        } else {
            message =
                process.env.NODE_ENV === 'production'
                    ? 'Internal Server Error'
                    : error.message || message;
        }

        const stack = process.env.NODE_ENV === 'production' ? undefined : error.stack;

        return response.status(status).json({
            message,
            ...(errors && { errors }),
            name: error.name,
            ...(stack && { stack }),
        });
    }
}
