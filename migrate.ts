import dotenv from "dotenv";
import {migrate} from "drizzle-orm/node-postgres/migrator"
import {db, pool} from "./src/lib/db"

dotenv.config({path: ".env.development.local"});
console.log(process.env["PG_CONNECTION_STRING"])
async function run_migrations(){
    await migrate(db, {migrationsFolder: "./drizzle"});
    await pool.end();
}

run_migrations();