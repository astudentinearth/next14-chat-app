import { lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { channelsTable, messagesTable } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
	const body = await req.json();
	if (!("sessionId" in body))
		return Response.json(
			{ error: "Bad request: no session id provided" },
			{ status: 400 }
		);
	if (!("channelId" in body))
		return Response.json(
			{ error: "Bad request: no channel id provided" },
			{ status: 400 }
		);
	if (!("content" in body))
		return Response.json(
			{ error: "Bad request: no message content provided" },
			{ status: 400 }
		);
	const { user, session } = await lucia.validateSession(body.sessionId);
	if (user == null || session == null) {
		return Response.json(
			{ error: "Unauthorized: user not logged in" },
			{ status: 401 }
		);
	}
	const channel = await db.query.channelsTable.findFirst({
		where: eq(channelsTable.id, body.channelId)
	});
	if (!channel)
		return Response.json(
			{
				error: "No such channel"
			},
			{ status: 400 }
		);
	if (!channel.participants?.includes(user.id))
		return Response.json(
			{ error: "You are not a member of this conversation" },
			{ status: 401 }
		);
	const msg = {
		id: randomUUID(),
		channelId: body.channelId,
		content: body.content,
		sender: user.id,
		sentAt: new Date(),
		senderUsername: user.username
	};
	await db.insert(messagesTable).values(msg);
	return Response.json({ msg }, { status: 200 });
}
