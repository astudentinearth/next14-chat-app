"use server";

import { randomUUID } from "crypto";
import { getUser } from "../auth";
import { db } from "../db";
import { Channel, channelsTable } from "../db/schema";
import { redirect } from "next/navigation";
import { arrayContains, inArray } from "drizzle-orm";

export async function createDirectMessageChannel(recipientUserId: string) {}

export async function getDirectMessageChannel(recipientUserId: string) {}

/**
 *
 * @param count maximum number of messages to load
 * @param after number of messages to skip before loading more
 */
export async function loadDirectMessages(count?: number, after?: number) {}

/**
 * Creates a new channel
 * @param name name of the channel
 */
export async function createChannel(name: string) {
	const user = await getUser();
	if (user == null) return "Unauthorized";
	if (name.trim() === "") return "Channel name cannot empty";
	const id = randomUUID();
	await db.insert(channelsTable).values({
		id,
		name,
		owner: user.id,
		creationTime: new Date(),
		isDirectMessage: false,
		participants: [user.id]
	});
	return redirect(`/chat/${id}`);
}

/**
 *
 * @param count maximum number of messages to load
 * @param after number of messages to skip before loading more
 */
export async function loadMessages(count?: number, after?: number) {}

/**
 *
 * @param channelId id of the channel to send the message to
 * @param content contents of the message
 */
export async function sendMessage(channelId: string, content: string) {}

export async function getChannels() {
	const user = await getUser();
	if (!user) return [] as Channel[];
	const result = await db.query.channelsTable.findMany({
		where: arrayContains(channelsTable.participants, [user.id])
	});
	return result;
}
