"use server";

import { hash, verify } from "@node-rs/argon2";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser, lucia } from ".";
import { DatabaseActions } from "../db/actions";
import { loginLimiter, signupLimiter } from "../limiters";
import { LoginSchema, SignupSchema } from "./validation";

const hashOpts = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
};

//TODO: lucia is deprecated. MOVE AWAY FROM IT
//TODO: Move database logic over to the database actions file

export async function signup(username: string, password: string) {
    try {
        await signupLimiter.consume(
            headers().get("X-Forwarded-For") ??
                headers().get("X-Real-IP") ??
                "",
            1
        );
    } catch (err) {
        console.log(err instanceof Error && err.message);
        return;
    }
    const parsed = SignupSchema.safeParse({
        username,
        password,
        confirm_password: password
    });
    if (parsed.error) return parsed.error.message;
    const password_hash = await hash(parsed.data.password, hashOpts);
    const existing = await DatabaseActions.findUserByName(parsed.data.username);
    if (existing != null) return "User already exists!";
    const { id, error } = await DatabaseActions.createUser(
        username,
        password_hash
    );
    if (error || id == null) return error;
    const session = await lucia.createSession(id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
    return redirect("/");
}

export async function login(username: string, password: string) {
    try {
        await loginLimiter.consume(
            headers().get("X-Forwarded-For") ??
                headers().get("X-Real-IP") ??
                "",
            1
        );
    } catch (error) {
        if (error instanceof Error) console.log(error.message);
        return;
    }
    const parsed = LoginSchema.safeParse({ username, password });
    if (parsed.error) return parsed.error.message;
    const user = await DatabaseActions.findUserByName(parsed.data.username);
    if (!user) return "No such user";
    const isValidPassword = verify(
        user.password_hash,
        parsed.data.password,
        hashOpts
    );
    if (!isValidPassword) return "Incorrect username or password";
    const sess = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(sess.id);
    cookies().set(cookie.name, cookie.value, cookie.attributes);
    return redirect("/");
}

export async function deleteAccount() {
    try {
        const user = await getUser();
        if (!user) return "Unauthorized";
        await DatabaseActions.deleteAccount(user.id);
        return redirect("/signup");
    } catch (error) {
        if (error instanceof Error)
            console.log("Error deleting account:", error.message);
    }
}
