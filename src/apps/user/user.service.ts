import { hash } from 'bcrypt';
import { Inject, Service } from 'typedi';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { IUser } from './models';
import { UserRepository } from './models/user.model';

@Service()
export class UserService {
    /**
     * Constructs a new user service
     * @param userRepository The user repository to use
     */
    constructor(
        @Inject(() => UserRepository)
        private readonly userRepository: UserRepository,
    ) {}

    /**
     * Finds a user by email
     * @param email The email to search for
     * @returns The user if found, null otherwise
     */
    public async findUserByEmail(email: string): Promise<IUser | undefined | null> {
        try {
            return await this.userRepository.model.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Creates a new user
     * @param dto The signup dto
     * @returns The newly created user
     */
    public async createUser(dto: SignUpDto): Promise<IUser> {
        try {
            const passwordHash = await hash(dto.password, 10);
            return await this.userRepository.model.create({
                ...dto,
                password: passwordHash,
            });
        } catch (error) {
            throw error;
        }
    }
}
