import {z} from "zod"

export const PasswordSchema = z.string().min(8).max(120);
export const UsernameSchema = z.string().min(4).max(64).regex(/^[a-zA-Z0-9_]+$/);

export const LoginSchema = z.object({
    username: UsernameSchema,
    password: PasswordSchema
})

export const SignupSchema = LoginSchema.extend({
    confirm_password: PasswordSchema
})

export type LoginSchemaType = z.infer<typeof LoginSchema>;
export type SignupSchemaType = z.infer<typeof SignupSchema>;