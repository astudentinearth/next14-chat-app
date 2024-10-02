import { lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { channelsTable } from "@/lib/db/schema";
import { arrayContains } from "drizzle-orm";

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
	const { user, session } = await lucia.validateSession(body.sessionId);
	if (user == null || session == null) {
		return Response.json(
			{ error: "Unauthorized: user not logged in" },
			{ status: 401 }
		);
	}
	const channels = await db.query.channelsTable.findMany({
		where: arrayContains(channelsTable.participants, [user.id])
	});
	if (channels.findIndex((c) => c.id === body.channelId) === -1)
		return Response.json(
			{
				error: "Authorization error: user is not a member of this channel"
			},
			{ status: 401 }
		);
	else return Response.json({ allow: true }, { status: 200 });
}
