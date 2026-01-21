import {z} from "zod";

export const SignupSchema = z.object({
    username: z.string().min(2),
    email: z.email(),
    password: z.string().min(3)
})

export const SigninSchema = z.object({
    email: z.email(),
    password: z.string().min(3)
})

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20)
})