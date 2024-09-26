import dotenv from "dotenv";
import {migrate} from "drizzle-orm/node-postgres/migrator"
import {db, pool} from "./src/lib/db"
dotenv.config({path: "./env.development.local"});

await migrate(db, {migrationsFolder: "./drizzle"});
await pool.end();