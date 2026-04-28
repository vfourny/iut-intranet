import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./auth.repository.js";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
});

export const signUpWithPasswordService = async (body: { name: string; email: string; password: string; image?: string; callbackURL?: string }) => {
    const data = await auth.api.signUpEmail({ body , asResponse: false });
    return data;
};

export const signInWithPasswordService = async (body: {email: string; password: string;rememberMe?: boolean; callbackURL?: string}) => {
    const data = await auth.api.signInEmail({ body, asResponse: false });
    return data;
}