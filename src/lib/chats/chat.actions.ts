"use server";

import { randomUUID } from "crypto";
import { arrayContains, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "../auth";
import { db } from "../db";
import { Channel, channelsTable, Invite, invitesTable } from "../db/schema";

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

export async function getChannelInfo(id: string) {
	const user = await getUser();
	if (!user) return null;
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, id)
	});
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

export async function invalidateInvite(id: string) {}

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
		.set({ participants: [...(channel.participants ?? []), user.id] });
	if (invite.oneTime)
		await db.delete(invitesTable).where(eq(invitesTable.id, inviteId[0])); // delete invite if it was single use
	return redirect(`/chat/${channel.id}`);
}
