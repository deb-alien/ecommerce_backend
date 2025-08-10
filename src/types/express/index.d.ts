import { ISafeUser } from '../../apps/auth/types';

declare global {
    namespace Express {
        export interface Request {
            user?: ISafeUser;
        }
    }
}
