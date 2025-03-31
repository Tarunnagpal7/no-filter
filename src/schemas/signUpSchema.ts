import {z} from 'zod';

export const username = z
.string()
.min(3, {message: 'Username must be at least 3 characters long'})
.max(20, {message: 'Username must be at most 20 characters long'})
.regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters');

export const signUpSchema = z.object({
    username: username,
    email: z.string().email({message: 'Invalid email format'}),
    password: z.string().min(6,{message: 'Password must be at least 6 characters long'}),
});