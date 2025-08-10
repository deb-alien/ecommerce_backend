import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Inject, Service } from 'typedi';

import dotenv from 'dotenv';
import { RedisService } from './redis';

dotenv.config({ quiet: true });

@Service()
export class RateLimiterService {
    private rateLimiter: RateLimiterRedis;

    constructor(@Inject(() => RedisService) private redisService: RedisService) {

        this.rateLimiter = new RateLimiterRedis({
            storeClient: this.redisService.getClient(),
            points: 3, // 5 requests
            duration: 60 * 2, // per 120 seconds per key (IP or user)
            keyPrefix: 'rl_signin',
        });
    }

    /**
     * Consumes a single request from the rate limiter.
     * @param key the key to consume from
     * @returns a promise that resolves when the request is consumed
     */
    async consume(key: string) {
        return this.rateLimiter.consume(key);
    }

    /**
     * Applies a penalty to the rate limiter.
     * @param key the key to apply the penalty to
     * @returns a promise that resolves when the penalty is applied
     */

    async penalty(key: string) {
        return this.rateLimiter.penalty(key);
    }

    /**
     * Rewards the rate limiter.
     * @param key the key to reward
     * @returns a promise that resolves when the reward is applied
     */
    async reward(key: string) {
        return this.rateLimiter.reward(key);
    }
}
