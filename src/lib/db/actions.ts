import { db } from ".";
import "server-only";
import {
    Channel,
    channelsTable,
    invitesTable,
    messagesTable,
    NewChannel,
    NewInvite,
    NewMessage,
    sessionTable,
    userTable
} from "./schema";
import { and, arrayContains, desc, eq, inArray } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { randomUUID } from "crypto";

export class DatabaseActions {
    static async deleteAccount(userID: string) {
        // Delete all messages sent by this user
        console.log("Deleting messages");
        await db
            .delete(messagesTable)
            .where(eq(messagesTable.sender, userID))
            .execute();

        const channels = await db.query.channelsTable.findMany({
            where: eq(channelsTable.owner, userID)
        });
        for (const channel of channels) {
            await db
                .delete(messagesTable)
                .where(eq(messagesTable.channelId, channel.id))
                .execute();
            await db
                .delete(invitesTable)
                .where(eq(invitesTable.channelId, channel.id))
                .execute();
        }

        // Delete all channels created by this user
        console.log("Deleting channels");
        await db
            .delete(channelsTable)
            .where(eq(channelsTable.owner, userID))
            .execute();

        //Delete DM channels this user is a member of
        await db
            .delete(channelsTable)
            .where(
                and(
                    eq(channelsTable.isDirectMessage, true),
                    arrayContains(channelsTable.participants, [userID])
                )
            );
        console.log("Deleting sessions");
        // Delete all sessions for the account
        await db.delete(sessionTable).where(eq(sessionTable.userId, userID));
        console.log("Deleting user");

        // Remove the user from user table
        await db.delete(userTable).where(eq(userTable.id, userID));
    }

    static async findUserById(id: string) {
        return await db.query.userTable.findFirst({
            where: eq(userTable.id, id)
        });
    }

    static async findUserByName(username: string) {
        return await db.query.userTable.findFirst({
            where: eq(userTable.username, username)
        });
    }

    static async createUser(
        username: string,
        password_hash: string
    ): Promise<{ id?: string; error?: string }> {
        const userId = generateIdFromEntropySize(10); //TODO: Use a better id generator without lucia
        const existing = await db.query.userTable.findFirst({
            where: eq(userTable.username, username)
        });
        if (existing != null) return { error: "User already exists" };
        await db
            .insert(userTable)
            .values({ id: userId, username, password_hash });
        return { id: userId };
    }

    static async findUsersByIds(ids: string[]) {
        return await db.query.userTable.findMany({
            where: inArray(userTable.id, ids),
            columns: { password_hash: false }
        });
    }

    static async createChannel(
        channel: Omit<NewChannel, "id">
    ): Promise<{ id?: string; error?: string }> {
        const channelId = randomUUID();
        try {
            await db.insert(channelsTable).values({
                id: channelId,
                ...channel
            });
            return { id: channelId };
        } catch (error) {
            return { error: (error as Error).message };
        }
    }

    static async findChannelById(id: string) {
        return await db.query.channelsTable.findFirst({
            where: eq(channelsTable.id, id)
        });
    }

    static async createMessage(message: Omit<NewMessage, "id">) {
        const messageId = randomUUID();
        await db.insert(messagesTable).values({ ...message, id: messageId });
        return messageId;
    }

    static async removeParticipant(userId: string, channel: Channel) {
        db.update(channelsTable)
            .set({
                participants: channel.participants?.filter((n) => n !== userId)
            })
            .where(eq(channelsTable.id, channel.id));
    }

    static async addParticipant(userId: string, channel: Channel) {
        if (channel.participants?.includes(userId))
            return "User already in channel";
        await db
            .update(channelsTable)
            .set({ participants: [...(channel.participants ?? []), userId] })
            .where(eq(channelsTable.id, channel.id));
    }

    static async invalidateInvite(inviteId: string) {
        await db.delete(invitesTable).where(eq(invitesTable.id, inviteId));
    }

    static async renameChannel(channelId: string, name: string) {
        await db
            .update(channelsTable)
            .set({ name })
            .where(eq(channelsTable.id, channelId));
    }

    static async getUserChannels(userId: string) {
        return await db.query.channelsTable.findMany({
            where: arrayContains(channelsTable.participants, [userId])
        });
    }

    static async findDirectMessageChannel(userIds: [string, string]) {
        return await db.query.channelsTable.findFirst({
            where: and(
                arrayContains(channelsTable.participants, userIds),
                eq(channelsTable.isDirectMessage, true)
            )
        });
    }

    static async findInviteById(inviteId: string) {
        return await db.query.invitesTable.findFirst({
            where: eq(invitesTable.id, inviteId)
        });
    }

    static async findChannelInvites(channelId: string) {
        return await db.query.invitesTable.findMany({
            where: eq(invitesTable.channelId, channelId)
        });
    }

    static async createInvite(opts: Omit<NewInvite, "id">) {
        const id = randomUUID();
        try {
            await db.insert(invitesTable).values({
                id,
                ...opts
            });
        } catch (error) {
            return { error: (error as Error).message };
        }
        return { id };
    }

    static async getMessages(
        channelId: string,
        count?: number,
        after?: number
    ) {
        return await db.query.messagesTable.findMany({
            where: eq(messagesTable.channelId, channelId),
            orderBy: desc(messagesTable.sentAt),
            limit: count ?? 15,
            offset: after
        });
    }
}
