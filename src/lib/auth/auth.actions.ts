"use server"

import { hash } from "@node-rs/argon2";
import { SignupSchema } from "./validation"
import { generateIdFromEntropySize } from "lucia";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { userTable } from "../db/schema";
import { lucia } from ".";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(username: string, password: string){
    const parsed = SignupSchema.safeParse({username, password, confirm_password: password});
    if(parsed.error) return parsed.error.message;
    const password_hash = await hash(parsed.data.password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    const userId = generateIdFromEntropySize(10);
    const existing = await db.query.userTable.findFirst({where: eq(userTable.username, parsed.data.username)});
    if(existing != null) return "User already exists!";
    await db.insert(userTable).values({id: userId, username, password_hash});
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return redirect("/");
}