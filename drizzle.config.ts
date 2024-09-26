import {defineConfig} from "drizzle-kit"

export default defineConfig({
    schema: './src/lib/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite',
    dbCredentials: {
        url: process.env["PG_CONNECTION_STRING"]!
    }
})