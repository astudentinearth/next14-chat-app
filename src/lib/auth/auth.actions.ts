"use server";

import { hash, verify } from "@node-rs/argon2";
import { LoginSchema, SignupSchema } from "./validation";
import { generateIdFromEntropySize } from "lucia";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema";
import { getUser, lucia } from ".";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginLimiter, signupLimiter } from "../limiters";
import { DatabaseActions } from "../db/actions";

const hashOpts = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
};

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
    const userId = generateIdFromEntropySize(10);
    const existing = await db.query.userTable.findFirst({
        where: eq(userTable.username, parsed.data.username)
    });
    if (existing != null) return "User already exists!";
    await db.insert(userTable).values({ id: userId, username, password_hash });
    const session = await lucia.createSession(userId, {});
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
    const user = await db.query.userTable.findFirst({
        where: eq(userTable.username, parsed.data.username)
    });
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
