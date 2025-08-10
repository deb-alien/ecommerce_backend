import { Document } from 'mongoose';

export enum Role {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
}

export interface IUser extends Document {
    username: string;
    email: string;
    role: Role;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
