import {
	boolean,
	pgTable,
	text,
	timestamp,
	varchar
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
	id: text("id").primaryKey(),
	username: varchar("username", { length: 64 }).unique().notNull(),
	password_hash: text("password_hash").notNull()
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userTable.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date"
	}).notNull()
});

export const channelsTable = pgTable("channel", {
	id: text("id").primaryKey(),
	owner: text("owner_id")
		.notNull()
		.references(() => userTable.id),
	participants: text("participant_ids")
		.references(() => userTable.id)
		.array(),
	name: varchar("name", { length: 120 }),
	creationTime: timestamp("created", {
		withTimezone: true,
		mode: "date"
	}).notNull(),
	isDirectMessage: boolean("is_dm"),
	dmUsernames: varchar("dm_usernames", { length: 64 })
		.references(() => userTable.username)
		.array()
});

export const messagesTable = pgTable("message", {
	id: text("id").primaryKey(),
	channelId: text("channel_id").references(() => channelsTable.id),
	sender: text("sender_id").references(() => userTable.id),
	content: text("content").notNull(),
	sentAt: timestamp("sent_at", { mode: "date" }).notNull(),
	senderUsername: varchar("text").references(() => userTable.username)
});

export const invitesTable = pgTable("invite", {
	id: text("id").primaryKey(),
	channelId: text("channel_id")
		.references(() => channelsTable.id)
		.notNull(),
	expires: timestamp("expires_at", { mode: "date" }),
	oneTime: boolean("oneTime")
});

export type User = typeof userTable.$inferSelect;
export type NewUser = typeof userTable.$inferInsert;

export type Session = typeof sessionTable.$inferSelect;
export type NewSession = typeof sessionTable.$inferInsert;

export type Channel = typeof channelsTable.$inferSelect;
export type NewChannel = typeof channelsTable.$inferInsert;

export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;

export type Invite = typeof invitesTable.$inferSelect;
export type NewInvite = typeof invitesTable.$inferInsert;
