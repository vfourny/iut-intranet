import { publicProcedure, router } from "../trpc.js";
import { signUpWithPasswordController, signInWithPasswordController } from "./auth.controller.js";

interface SignUpInput {
    name: string;
    email: string;
    password: string;
    image?: string;
    callbackURL?: string;
}

interface SignInInput {
    email: string;
    password: string;
    rememberMe?: boolean;
    callbackURL?: string;
}

export const authRouter = router({
    signUpWithPassword: publicProcedure
        .input((input: unknown) => input as SignUpInput)
        .mutation(async ({ input }) => {
            return await signUpWithPasswordController(input);
        }),
    signInWithPassword: publicProcedure
        .input((input: unknown) => input as SignInInput)
        .mutation(async ({ input }) => {
            return await signInWithPasswordController(input);
        })
});