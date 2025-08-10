import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 32)
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(8, 32)
    password: string;
}
