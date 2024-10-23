"use server";

import { produce } from "immer";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "../auth";
import { DatabaseActions } from "../db/actions";
import { Channel, Invite } from "../db/schema";
import {
    chatActionsLimiter,
    createChannelLimiter,
    tryConsume
} from "../limiters";

export async function createDirectMessageChannel(recipientUserId: string) {
    const user = await getUser();
    if (!user) return "Unauthorized: you are not logged in";
    const allowed = await tryConsume(createChannelLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const recipient = await DatabaseActions.findUserById(recipientUserId);
    if (!recipient) return "No user with this name exists";
    const { id, error } = await DatabaseActions.createChannel({
        owner: user.id,
        creationTime: new Date(),
        isDirectMessage: true,
        participants: [user.id, recipientUserId],
        dmUsernames: [user.username, recipient.username]
    });
    if (!id) return error;
    return redirect(`/chat/${id}`);
}

export async function loadDirectMessageChannel(recipientUsername: string) {
    const user = await getUser();
    if (!user) return "Unauthorized: you are not logged in";
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    if (user.username === recipientUsername) return "You can't text yourself";
    const dest = await DatabaseActions.findUserByName(recipientUsername);
    if (!dest) return "No such user";
    const recipientUserId: string = dest.id;
    const channel = await DatabaseActions.findDirectMessageChannel([
        user.id,
        recipientUserId
    ]);
    if (!channel) return await createDirectMessageChannel(recipientUserId);
    else return redirect(`/chat/${channel.id}`);
}

/**
 *
 * @param count maximum number of messages to load
 * @param after number of messages to skip before loading more
 */
// export async function loadDirectMessages(count?: number, after?: number) {}

/**
 * Creates a new channel
 * @param name name of the channel
 */
export async function createChannel(name: string) {
    const user = await getUser();
    if (user == null) return "Unauthorized";
    const allowed = await tryConsume(createChannelLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    if (name.trim() === "") return "Channel name cannot empty";
    const { id, error } = await DatabaseActions.createChannel({
        name,
        owner: user.id,
        creationTime: new Date(),
        isDirectMessage: false,
        participants: [user.id]
    });
    if (!id) return error;
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
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(channelId);
    if (!channel) return "No such channel";
    if (!channel.participants?.includes(user.id))
        return "You are not a member of this conversation";
    const messages = await DatabaseActions.getMessages(channelId, count, after);
    return messages;
}

/**
 *
 * @param channelId id of the channel to send the message to
 * @param content contents of the message
 */
export async function sendMessage(channelId: string, content: string) {
    if (content.trim().length > 400)
        return "Message should not exceed 400 characters.";
    if (content.trim().length == 0) return "Message cannot be empty.";
    const user = await getUser();
    if (!user) return "Unauthorized: you are not logged in";
    const allowed = await tryConsume(createChannelLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(channelId);
    if (!channel) return "No such channel";
    if (!channel.participants?.includes(user.id))
        return "You are not a member of this conversation";
    const msg = {
        channelId,
        content,
        sender: user.id,
        sentAt: new Date(),
        senderUsername: user.username
    };
    await DatabaseActions.createMessage(msg);
}

export async function getChannels() {
    const user = await getUser();
    if (!user) return [] as Channel[];
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const result = await DatabaseActions.getUserChannels(user.id);
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
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(id);
    if (!channel?.participants?.includes(user.id))
        return "You are not a member of this conversation";
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

export async function getChannelParticipants(channelId: string) {
    const user = await getUser();
    if (!user) return null;
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(channelId);
    if (!channel) return "No such channel";
    if (!channel.participants?.includes(user.id))
        return "You are not a member of this conversation";
    const users = await DatabaseActions.findUsersByIds(channel.participants);
    return users;
}

export async function renameChannel(id: string, newName: string) {
    if (newName.length > 80) return;
    const user = await getUser();
    if (user == null) return "Unauthorized: not signed in";
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(id);
    if (channel?.owner !== user.id)
        return "Unauthorized: you don't own this channel.";
    await DatabaseActions.renameChannel(id, newName);
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
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(channelId);
    if (channel?.owner !== user.id)
        return "Unauthorized: you don't own this channel.";
    const { id, error } = await DatabaseActions.createInvite({
        channelId,
        oneTime: opts?.singleUse,
        expires: opts?.expires
            ? new Date(Date.now() + durations[opts.expires])
            : null
    });
    if (error) return error;
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
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const invite = await DatabaseActions.findInviteById(inviteId);
    if (!invite) return "No such invite";
    const channel = await DatabaseActions.findChannelById(invite.channelId);
    if (!channel) return "No such channel";
    if (channel.owner !== user.id) return "You don't own this channel";
    await DatabaseActions.invalidateInvite(inviteId);
}

export async function listInvites(channelId: string) {
    const user = await getUser();
    if (user == null) return "Unauthorized: not signed in";
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(channelId);
    if (channel?.owner !== user.id)
        return "Unauthorized: you don't own this channel.";
    const invites = await DatabaseActions.findChannelInvites(channelId);
    return invites;
}

export async function joinChannel(inviteURL: string) {
    const user = await getUser();
    if (user == null) return "Unauthorized: not signed in";
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const inviteId = inviteURL.match(/((\w{4,12}-?)){5}/);
    if (inviteId == null) return "Invalid invite: no invite ID";
    const invite = await DatabaseActions.findInviteById(inviteId[0]);
    if (!invite) return "Invalid invite: invite does not exist";
    const valid = isValidInvite(invite);
    if (!valid) return "Expired invite";
    const channel = await DatabaseActions.findChannelById(invite.channelId);
    if (!channel) return "Not found: channel does not exist";
    if (channel.participants?.includes(user.id))
        return redirect(`/chat/${channel.id}`); // user already in channel
    await DatabaseActions.addParticipant(user.id, channel);
    if (invite.oneTime) await DatabaseActions.invalidateInvite(inviteId[0]); // delete invite if it was single use
    return redirect(`/chat/${channel.id}`);
}

export async function leaveChannel(channelId: string) {
    const user = await getUser();
    if (user == null) return "Unauthorized: not signed in";
    const allowed = await tryConsume(chatActionsLimiter, user.id, 1);
    if (!allowed) return "Too many requests";
    const channel = await DatabaseActions.findChannelById(channelId);
    if (!channel) return "Not found: channel does not exist";
    await DatabaseActions.removeParticipant(user.id, channel);
    return redirect("/");
}
