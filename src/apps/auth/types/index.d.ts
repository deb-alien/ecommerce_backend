export interface ITokens {
    access_token: string;
    refresh_token: string;
}

export interface IPayload {
    sub: string;
    username: string;
    role: string[];
}

export interface ISafeUser {
    sub: string;
    username: string;
    role: string[];
}
