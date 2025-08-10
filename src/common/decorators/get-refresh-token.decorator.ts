import { Request } from "express";
import { createParamDecorator } from "routing-controllers";

export function RefreshToken() {
    return createParamDecorator({
        required :true,
        value: (action): string => {
            const request = action.request as Request;
            const authHeader = request.headers.authorization

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error('Unauthorized');
            }

            return authHeader.split(' ')[1];
        }
    })
}