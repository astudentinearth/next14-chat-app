import { db } from ".";
import "server-only";
import {
    channelsTable,
    invitesTable,
    messagesTable,
    sessionTable,
    userTable
} from "./schema";
import { and, arrayContains, eq } from "drizzle-orm";

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
}
