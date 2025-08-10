import { compare, hash } from 'bcrypt';
import dotenv from 'dotenv';
import { sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { UnauthorizedError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { IPayload, ISafeUser, ITokens } from '../apps/auth/types';
import { RedisService } from './redis';

dotenv.config({ quiet: true });

/**
 * Service to manage user tokens
 */
@Service()
export class TokenManager {
    constructor(
        @Inject(() => RedisService)
        private readonly redisService: RedisService,
    ) {}

    /**
     * Generates a pair of access and refresh tokens
     * @param payload payload to sign tokens with
     * @returns a pair of access and refresh tokens
     */
    public async generateTokens(payload: IPayload): Promise<ITokens> {
        const [access_token, refresh_token] = await Promise.all([
            sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: parseInt(process.env.ACCESS_TOKEN_TTL ?? '24h', 10),
            }),
            sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: parseInt(process.env.REFRESH_TOKEN_TTL ?? '7d', 10),
            }),
        ]);

        return { access_token, refresh_token };
    }

    /**
     * Verifies a given token using the provided secret.
     * @param token The token to verify.
     * @param secret The secret key to use for verification.
     * @returns The decoded token payload if verification is successful.
     * @throws {UnauthorizedError} If the token is expired or invalid.
     */
    public async verifyToken(token: string, secret: string): Promise<ISafeUser> {
        try {
            const payload = verify(token, secret, {
                algorithms: ['HS256'],
                ignoreExpiration: false,
            }) as ISafeUser;

            return payload;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedError('Token Expired');
            }
            throw new UnauthorizedError('Invalid Token');
        }
    }

    /**
     * Stores a token in redis
     * @param id user id
     * @param token token to store
     * @returns a promise that resolves when the token is stored
     */
    public async storeTokens(id: string, token: string, ttl?: number): Promise<void> {
        const key = `refresh:${id}`;
        await this.redisService.set(key, await hash(token, 10), ttl);
    }

    /**
     * Validates a token
     * @param id user id
     * @param token token to validate
     * @returns true if the token is valid, false otherwise
     */
    public async validateToken(id: string, token: string): Promise<boolean> {
        const key = `refresh:${id}`;

        const tokenExists = await this.hasToken(id);
        if (!tokenExists) return false;

        const storedToken = await this.redisService.get(key);
        return await compare(token, storedToken!);
    }

    /**
     * Checks if a token is present in redis for a given user
     * @param id user id
     * @returns true if the token is present, false otherwise
     */
    public async hasToken(id: string): Promise<boolean> {
        const key = `refresh:${id}`;
        return await this.redisService.exists(key);
    }

    /**
     * Invalidates a token
     * @param id user id
     * @returns a promise that resolves when the token is invalidated
     */
    public async invalidateToken(id: string): Promise<void> {
        const key = `refresh:${id}`;
        await this.redisService.del(key);
    }
}
