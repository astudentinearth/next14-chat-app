"use server";

import { randomUUID } from "crypto";
import { and, arrayContains, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "../auth";
import { db } from "../db";
import {
	Channel,
	channelsTable,
	Invite,
	invitesTable,
	messagesTable,
	userTable
} from "../db/schema";
import { produce } from "immer";

export async function createDirectMessageChannel(recipientUserId: string) {
	const user = await getUser();
	if (!user) return "Unauthorized: you are not logged in";
	const recipient = await db.query.userTable.findFirst({
		where: eq(userTable.id, recipientUserId)
	});
	if (!recipient) return "No user with this name exists";
	const id = randomUUID();
	await db.insert(channelsTable).values({
		id,
		owner: user.id,
		creationTime: new Date(),
		isDirectMessage: true,
		participants: [user.id, recipientUserId],
		dmUsernames: [user.username, recipient.username]
	});
	return redirect(`/chat/${id}`);
}

export async function loadDirectMessageChannel(recipientUsername: string) {
	const user = await getUser();
	if (!user) return "Unauthorized: you are not logged in";
	if (user.username === recipientUsername) return "You can't text yourself";
	const dest = await db.query.userTable.findFirst({
		where: eq(userTable.username, recipientUsername)
	});
	if (!dest) return "No such user";
	const recipientUserId: string = dest.id;
	const channel = await db.query.channelsTable.findFirst({
		where: and(
			arrayContains(channelsTable.participants, [
				user.id,
				recipientUserId
			]),
			eq(channelsTable.isDirectMessage, true)
		)
	});
	if (!channel) return await createDirectMessageChannel(recipientUserId);
	else return redirect(`/chat/${channel.id}`);
}

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
 * Gets messages from a channel
 * @param count maximum number of messages to load - defaults to 15
 * @param after number of messages to skip before loading more - defaults to 0
 */
export async function loadMessages(
	channelId: string,
	count?: number,
	after?: number
) {
	const user = await getUser();
	if (!user) return "Unauthorized: you are not logged in";
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, channelId)
	});
	if (!channel) return "No such channel";
	if (!channel.participants?.includes(user.id))
		return "You are not a member of this conversation";
	const messages = await db.query.messagesTable.findMany({
		where: eq(messagesTable.channelId, channelId),
		orderBy: desc(messagesTable.sentAt),
		limit: count ?? 15,
		offset: after
	});
	return messages;
}

/**
 *
 * @param channelId id of the channel to send the message to
 * @param content contents of the message
 */
export async function sendMessage(channelId: string, content: string) {
	const user = await getUser();
	if (!user) return "Unauthorized: you are not logged in";
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, channelId)
	});
	if (!channel) return "No such channel";
	if (!channel.participants?.includes(user.id))
		return "You are not a member of this conversation";
	await db.insert(messagesTable).values({
		id: randomUUID(),
		channelId,
		content,
		sender: user.id,
		sentAt: new Date(),
		senderUsername: user.username
	});
	//TODO: Notify via socket
}

export async function getChannels() {
	const user = await getUser();
	if (!user) return [] as Channel[];
	const result = await db.query.channelsTable.findMany({
		where: arrayContains(channelsTable.participants, [user.id])
	});
	const final = produce(result, (draft) => {
		for (const c of draft) {
			if (!c.isDirectMessage || c.dmUsernames == null) continue;
			const recipient = c.dmUsernames.filter((n) => n !== user.username);
			if (recipient.length !== 1) continue;
			c.name = `${recipient[0]}`;
		}
	});
	return final;
}

export async function getChannelInfo(id: string) {
	const user = await getUser();
	if (!user) return null;
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, id)
	});
	if (
		channel != null &&
		channel.isDirectMessage &&
		channel.dmUsernames != null
	) {
		const recipient = channel.dmUsernames.filter(
			(n) => n !== user.username
		);
		if (recipient.length !== 1) return channel;
		return { ...channel, name: recipient[0] };
	}
	return channel ?? null;
}

export async function renameChannel(id: string, newName: string) {
	const user = await getUser();
	if (user == null) return "Unauthorized: not signed in";
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, id)
	});
	if (channel?.owner !== user.id)
		return "Unauthorized: you don't own this channel.";
	await db
		.update(channelsTable)
		.set({ name: newName })
		.where(eq(channelsTable.id, id));
	return "Success";
}

interface InviteOpts {
	singleUse?: boolean;
	expires?: "30m" | "1h" | "6h" | "24h";
}

const HOUR = 3600 * 1000;

const durations = {
	"30m": HOUR / 2,
	"1h": HOUR,
	"6h": HOUR * 6,
	"24h": HOUR * 24
};

export async function createInvite(channelId: string, opts?: InviteOpts) {
	const user = await getUser();
	if (user == null) return "Unauthorized: not signed in";
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, channelId)
	});
	if (channel?.owner !== user.id)
		return "Unauthorized: you don't own this channel.";
	const id = randomUUID();
	await db.insert(invitesTable).values({
		id,
		channelId,
		oneTime: opts?.singleUse,
		expires: opts?.expires
			? new Date(Date.now() + durations[opts.expires])
			: null
	});
	const host = headers().get("Host");
	return `${host}/invite/${id}`;
}

export async function isValidInvite(invite: Invite) {
	if (invite.expires == null) return true;
	if (invite.expires.valueOf() - Date.now() < 0) return false;
	else return true;
}

export async function invalidateInvite(inviteId: string) {
	const user = await getUser();
	if (user == null) return "Unauthorized: not signed in";
	const invite = await db.query.invitesTable.findFirst({
		where: eq(invitesTable.id, inviteId[0])
	});
	if (!invite) return "No such invite";
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, invite.channelId)
	});
	if (!channel) return "No such channel";
	if (channel.owner !== user.id) return "You don't own this channel";
	await db.delete(invitesTable).where(eq(invitesTable.id, inviteId));
}

export async function listInvites(channelId: string) {
	const user = await getUser();
	if (user == null) return "Unauthorized: not signed in";
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, channelId)
	});
	if (channel?.owner !== user.id)
		return "Unauthorized: you don't own this channel.";
	const invites = await db.query.invitesTable.findMany({
		where: eq(invitesTable.channelId, channelId)
	});
	return invites;
}

export async function joinChannel(inviteURL: string) {
	const user = await getUser();
	if (user == null) return "Unauthorized: not signed in";
	const inviteId = inviteURL.match(/((\w{4,12}-?)){5}/);
	if (inviteId == null) return "Invalid invite: no invite ID";
	const invite = await db.query.invitesTable.findFirst({
		where: eq(invitesTable.id, inviteId[0])
	});
	if (!invite) return "Invalid invite: invite does not exist";
	const valid = isValidInvite(invite);
	if (!valid) return "Expired invite";
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, invite.channelId)
	});
	if (!channel) return "Not found: channel does not exist";
	if (channel.participants?.includes(user.id))
		return redirect(`/chat/${channel.id}`); // user already in channel
	await db
		.update(channelsTable)
		.set({ participants: [...(channel.participants ?? []), user.id] })
		.where(eq(channelsTable.id, invite.channelId));
	if (invite.oneTime)
		await db.delete(invitesTable).where(eq(invitesTable.id, inviteId[0])); // delete invite if it was single use
	return redirect(`/chat/${channel.id}`);
}
