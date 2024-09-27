import { lucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(){
    const {session} = await validateRequest();
    if(!session) return NextResponse.json("Unauthorized", {status: 401})
    await lucia.invalidateSession(session.id);
    const {name, attributes, value} = lucia.createBlankSessionCookie();
    cookies().set(name, value, attributes);
    return redirect("/login");
}