import {Lucia} from "lucia"
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { db } from "../db"
import { sessionTable, userTable } from "../db/schema"

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production"
        }
    },
    getUserAttributes(databaseUserAttributes) {
        return {
            username: databaseUserAttributes.username
        };
    }
})

declare module "lucia"{
    interface Register{
        Lucia: typeof lucia,
        DatabaseUserAttributes: DatabaseUserAttributes
    }
}

interface DatabaseUserAttributes{
    username: string,
}