import { Pool } from "pg";
import {drizzle} from "drizzle-orm/node-postgres"
import * as schema from "./schema";

const pool = new Pool({
    connectionString: process.env["PG_CONNECTION_STRING"]
})

export const db = drizzle(pool, {schema});