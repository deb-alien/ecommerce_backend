import dotenv from 'dotenv';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Service } from 'typedi';

dotenv.config({ quiet: true });

@Service()
export class RedisService {
    private redisClient: Redis;
    private rateLimiter: RateLimiterRedis;

    /**
     * Creates a new Redis client with connection options from environment variables.
     * Logs connection and error events.
     */
    constructor() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
        });

        this.redisClient.on('connect', () => {
            console.log('Redis connected');
        });

        this.redisClient.on('error', (err) => {
            console.error('Redis error', err);
        });
    }

    /**
     * Get the Redis client instance.
     * @returns The Redis client instance.
     */
    public getClient(): Redis {
        return this.redisClient;
    }

    /**
     * Set a key-value pair in Redis with optional TTL (time to live).
     * @param key Redis key to set.
     * @param value String value to store.
     * @param ttlSeconds Optional TTL in seconds; if omitted, key persists indefinitely.
     * @returns Promise resolving to 'OK' if successful, or void if no TTL provided.
     */
    public async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | void> {
        if (ttlSeconds) {
            return await this.redisClient.set(key, value, 'EX', ttlSeconds);
        } else {
            return await this.redisClient.set(key, value);
        }
    }

    /**
     * Get the value associated with a key.
     * @param key Redis key to retrieve.
     * @returns Promise resolving to the string value or null if key does not exist.
     */
    public async get(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    /**
     * Delete a key from Redis.
     * @param key Redis key to delete.
     * @returns Promise resolving to the number of keys removed (0 or 1).
     */
    public async del(key: string): Promise<number> {
        console.log('called');
        return await this.redisClient.del(key);
    }

    /**
     * Check if a key exists in Redis.
     * @param key Redis key to check.
     * @returns Promise resolving to true if the key exists, otherwise false.
     */
    public async exists(key: string): Promise<boolean> {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }

    /**
     * Increment the numeric value of a key by one.
     * @param key Redis key to increment.
     * @returns Promise resolving when increment operation completes.
     */
    public async incr(key: string): Promise<number> {
        return await this.redisClient.incr(key);
    }

    /**
     * Set a TTL (time to live) in seconds on a key.
     * @param key Redis key to expire.
     * @param ttl TTL in seconds.
     * @returns Promise resolving when expire operation completes.
     */
    public async expire(key: string, ttl: number): Promise<void> {
        await this.redisClient.expire(key, ttl);
    }
}
