import { createParamDecorator } from 'routing-controllers';
import { ISafeUser } from '../../apps/auth/types';

/**
 * A decorator that injects the user ID (sub) from the request
 * @returns The user ID (sub) if found, otherwise throws an error
 * @throws {Error} If the user ID is not found in the request
 */
export function CurrentUserId() {
    return createParamDecorator({
        required: true,
        value: (action) => {
            const user = action.request.user as Pick<ISafeUser, 'sub'>;
            if (!user) {
                throw new Error('User ID (sub) not found in request');
            }

            return user.sub;
        },
    });
}
