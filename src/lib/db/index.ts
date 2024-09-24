import { Pool } from "pg";
import {drizzle} from "drizzle-orm/node-postgres"
import * as schema from "./schema";

const pool = new Pool({
    connectionString: "postgres://postgres:@localhost:5432/chat-app"
})

export const db = drizzle(pool, {schema});