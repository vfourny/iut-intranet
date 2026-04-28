import { TRPCError } from "@trpc/server";
import { toNodeHandler } from "better-auth/node";
import { auth, signUpWithPasswordService, signInWithPasswordService } from "./auth.service.js";

export const authHandler = toNodeHandler(auth);

export const signUpWithPasswordController = async (body: { name: string; email: string; password: string; image?: string; callbackURL?: string }) => {
    if (!body.email || !body.password || !body.name) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Missing fields" });
    }
    try {
        return await signUpWithPasswordService(body);
    } catch (error: any) {
        switch (error?.body?.code) {
            case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
                throw new TRPCError({ code: "CONFLICT", message: "This email is already use" });
            default:
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Server Error" });
        }
    }
};

export const signInWithPasswordController = async (body: {email: string; password: string;rememberMe?: boolean; callbackURL?: string}) => {
    if (!body.email || !body.password) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Missing fields" });
    }
    try {
        return await signInWithPasswordService(body);    
    } catch (error: any) {
        switch (error?.body?.code) {
            case "INVALID_EMAIL_OR_PASSWORD":
                throw new TRPCError({ code: "CONFLICT", message: ""})
            default:
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Server Error" });
        }
    }
}