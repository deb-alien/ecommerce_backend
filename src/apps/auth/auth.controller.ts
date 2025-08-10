import { Body, Get, HttpCode, JsonController, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { RefreshToken } from '../../common/decorators/get-refresh-token.decorator';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sing-in.dto';
import { ITokens } from './types';

@Service()
@JsonController('/auth')
export class AuthController {
    /**
     * Creates a new AuthController
     * @param authService The auth service to use
     */
    constructor(
        @Inject(() => AuthService)
        private readonly authService: AuthService,
    ) {}

    /**
     * Handles the sign up route
     * @param {SignUpDto} dto - Signup information
     * @returns {Promise<ITokens>} - a promise that resolves with the access and refresh tokens
     */
    @Post('/sign-up')
    @HttpCode(201)
    public async signUp(@Body() dto: SignUpDto): Promise<ITokens> {
        return await this.authService.signUp(dto);
    }

    /**
     * Handles the sign in route
     * @param {SignInDto} dto - signin information
     * @returns {Promise<ITokens>} - a promise that resolves with the access and refresh tokens
     */
    @Post('/sign-in')
    @HttpCode(200)
    public async signIn(@Body() dto: SignInDto): Promise<ITokens> {
        return await this.authService.signIn(dto);
    }

    /**
     * Signs out a user and invalidates their refresh token
     * @param {string} id - The id of the user to sign out
     * @returns {Promise<{ message: string }>} - A promise that resolves with a message indicating the success of the action
     * @throws {NotFoundError} If the user does not have an active session
     */
    @Post('/sign-out')
    @HttpCode(200)
    public async signOut(@CurrentUserId() id: string): Promise<{ message: string }> {
        return await this.authService.signOut(id);
    }

    /**
     * Handles the refresh token route
     * @param {string} refreshToken - The refresh token to use
     * @returns {Promise<ITokens>} - a promise that resolves with a new pair of access and refresh tokens
     * @throws {UnauthorizedError} If the token is invalid or expired
     */
    @Get('/refresh-token')
    @HttpCode(200)
    public async refreshToken(@RefreshToken() refreshToken: string): Promise<ITokens> {
        return await this.authService.refreshToken(refreshToken);
    }
}
