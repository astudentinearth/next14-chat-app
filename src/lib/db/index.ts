import { Pool } from "pg";
import {drizzle} from "drizzle-orm/node-postgres"
import * as schema from "./schema";

export const pool = new Pool({
    connectionString: process.env["PG_CONNECTION_STRING"]
})
pool.on("connect", ()=>console.log("Connected to postgres"))
pool.on("error", (e)=>console.log(e.message));
export const db = drizzle(pool, {schema});