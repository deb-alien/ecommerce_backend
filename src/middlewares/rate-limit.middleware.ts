import { NextFunction, Request, Response } from 'express';
import { RateLimiterRes } from 'rate-limiter-flexible';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { RateLimiterService } from '../utils/rate-limiter';

@Service()
@Middleware({ type: 'before' })
export class RateLimitMiddleware implements ExpressMiddlewareInterface {
    constructor(private readonly rateLimiterService: RateLimiterService) {}

    async use(request: Request, response: Response, next: NextFunction) {
        try {
            let IP =
                request.headers['x-forwarded-for'] || request.socket.remoteAddress || request.ip;

            if (Array.isArray(IP)) {
                IP = IP[0]; // take the first if multiple
            }

            if (!IP) {
                throw new Error('Unable to determine IP address');
            }
            const key = `signin_rate_limit:${IP}`;
            await this.rateLimiterService.consume(key);
            next();
        } catch (error) {
            const rejRes = error as RateLimiterRes;
            return response.status(429).json({
                message: 'Too many requests. Your IP has blocked for 2 minute.',
                retryAfter: Math.ceil(rejRes.msBeforeNext / 1000),
            });
        }
    }
}
