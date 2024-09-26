import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: text("id").primaryKey(),
    username: varchar("username", {length: 64}).unique().notNull(),
    password_hash: text("password_hash").notNull()
})

export const sessionTable = pgTable("session", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(()=>userTable.id),
    expiresAt: timestamp("expires_at", {withTimezone: true, mode: "date"}).notNull()
})

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;
export type Session = typeof sessionTable.$inferSelect;
export type NewSession = typeof sessionTable.$inferInsert;