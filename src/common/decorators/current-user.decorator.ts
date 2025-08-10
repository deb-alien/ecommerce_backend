import { createParamDecorator } from 'routing-controllers';
import { ISafeUser } from '../../apps/auth/types';

/**
 * A decorator that injects the current user or a specific field from it.
 * @param field Optional field name to extract from the user object.
 * @returns The entire user or the specified field value.
 */
export function CurrentUser(field?: keyof ISafeUser) {
    return createParamDecorator({
        required: true,
        value: (action) =>
            field
                ? (action.request.user as ISafeUser)?.[field]
                : (action.request.user as ISafeUser),
    });
}
