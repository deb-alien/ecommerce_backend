import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware, UnauthorizedError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { TokenManager } from './../utils/token-manager';

dotenv.config({ quiet: true });

@Service()
@Middleware({ type: 'before' })
export class AuthorizationMiddleware implements ExpressMiddlewareInterface {
    /**
     * Constructor for the AuthorizationMiddleware.
     * @param tokenManager The token manager to use for validation.
     */
    constructor(
        @Inject()
        private readonly tokenManager: TokenManager,
    ) {}

    /**
     * Middleware function to validate the authorization header.
     * @param request The express request object.
     * @param _response The express response object.
     * @param next The next middleware function in the chain.
     */
    async use(request: Request, _response: Response, next: NextFunction) {
        console.log(request.url);
        const publicRoutes = [
            '/auth/sign-in',
            '/auth/sign-up',
            '/auth/refresh-token',
            '/auth/verify-email',
            '/auth/forgot-password',
            '/auth/reset-password',
            // '/auth/logout',
        ];

        if (publicRoutes.includes(request.url)) {
            return next();
        }

        try {
            const authHeader = request.headers.authorization;
            // console.log(authHeader);
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedError('Unauthorized');
            }

            // console.log(process.env.ACCESS_TKN_SECRET!);

            const token = authHeader.split(' ')[1];
            const payload = await this.tokenManager.verifyToken(
                token,
                process.env.ACCESS_TOKEN_SECRET!,
            );

            //* see the /src/types/express/index.d.ts we are declaring a global type for req.user type
            request.user = payload;

            return next();
        } catch (error) {
            throw new UnauthorizedError('Unauthorized');
        }
    }
}
