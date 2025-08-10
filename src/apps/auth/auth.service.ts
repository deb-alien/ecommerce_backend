import { compare } from 'bcrypt';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { TokenManager } from '../../utils/token-manager';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sing-in.dto';
import { ITokens } from './types';

@Service()
export class AuthService {
    /**
     * The constructor for the auth service
     * @param userService The user service to use
     * @param tokenManager The token manager to use
     * @param rateLimiterService The rate limiter service to use
     */
    constructor(
        @Inject(() => UserService)
        private readonly userService: UserService,

        @Inject(() => TokenManager)
        private readonly tokenManager: TokenManager,
    ) {}

    /**
     * Creates a new user
     * @param dto The signup dto
     * @returns The tokens for the newly created user
     * @throws {BadRequestError} If the user already exists
     */
    public async signUp(dto: SignUpDto): Promise<ITokens> {
        const existingUser = await this.userService.findUserByEmail(dto.email);
        if (existingUser) {
            throw new BadRequestError('User ready exists');
        }

        const user = await this.userService.createUser(dto);

        const tokens = await this.tokenManager.generateTokens({
            sub: user.id.toString(),
            username: user.username,
            role: [user.role],
        });

        // set the redis refresh token hash
        await this.tokenManager.storeTokens(user.id.toString(), tokens.refresh_token);

        return tokens;
    }

    /**
     * Signs in a user and returns the tokens
     * @param dto The signin dto
     * @returns The tokens for the user
     * @throws {UnauthorizedError} If the user is invalid or the password is incorrect
     */
    public async signIn(dto: SignInDto): Promise<ITokens> {
        const user = await this.userService.findUserByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedError('Invalid Credentials');
        }

        const passwordMatch = await compare(dto.password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedError('Invalid Credentials');
        }

        const tokens = await this.tokenManager.generateTokens({
            sub: user.id.toString(),
            username: user.username,
            role: [user.role],
        });

        // set the redis refresh token hash
        await this.tokenManager.storeTokens(
            user.id.toString(),
            tokens.refresh_token,
            Math.floor(parseInt(process.env.REFRESH_TOKEN_TTL ?? '604800000') / 1000),
        );

        return tokens;
    }

    /**
     * Signs out a user and invalidates their refresh token
     * @param id The id of the user to sign out
     * @returns A message indicating the success of the action
     * @throws {NotFoundError} If the user does not have an active session
     */
    public async signOut(id: string): Promise<{ message: string }> {
        const hasToken = await this.tokenManager.hasToken(id);
        if (!hasToken) {
            throw new NotFoundError('No active session found');
        }

        await this.tokenManager.invalidateToken(id);
        return {
            message: 'Signed out successfully',
        };
    }


    /**
     * Generates a new access token for a user using their refresh token
     * @param token The refresh token to use
     * @returns A new pair of access and refresh tokens
     * @throws {UnauthorizedError} If the token is invalid or expired
     */
    public async refreshToken(token: string): Promise<ITokens> {
        const payload = await this.tokenManager.verifyToken(
            token,
            process.env.REFRESH_TOKEN_SECRET!,
        );
        if (!payload) {
            throw new UnauthorizedError('Invalid token');
        }

        const valid = await this.tokenManager.validateToken(payload.sub, token);
        if (!valid) {
            throw new UnauthorizedError('Invalid token');
        }

        const tokens = await this.tokenManager.generateTokens({
            sub: payload.sub,
            username: payload.username,
            role: payload.role,
        });

        // set the redis refresh token hash
        await this.tokenManager.storeTokens(
            payload.sub,
            tokens.refresh_token,
            Math.floor(parseInt(process.env.REFRESH_TOKEN_TTL ?? '604800000') / 1000),
        );

        return tokens;
    }
}
