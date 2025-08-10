import { Model, model, Schema } from 'mongoose';
import { Service } from 'typedi';
import { IUser, Role } from '.';

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: [true, 'Username already in use'],
            lowercase: true,
            indexes: true,
        },
        email: {
            type: String,
            required: [true, 'Email Address is required'],
            unique: [true, 'Email already exits'],
            lowercase: true,
            index: true,
        },
        role: {
            type: String,
            enum: Role,
            default: Role.CUSTOMER,
            required: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength: [
                8,
                'Password must be 8 characters long and must contain one uppercase letter one lowercase letter, one special char an one digit',
            ],
        },
    },
    { timestamps: true },
);

@Service()
export class UserRepository {
    public model: Model<IUser>;

    constructor() {
        this.model = model<IUser>('User', UserSchema);
    }
}
