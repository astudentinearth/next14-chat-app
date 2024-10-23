import { lucia } from "@/lib/auth";
import { DatabaseActions } from "@/lib/db/actions";

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
    const channel = await DatabaseActions.findChannelById(body.channelId);
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
        channelId: body.channelId,
        content: body.content,
        sender: user.id,
        sentAt: new Date(),
        senderUsername: user.username
    };
    await DatabaseActions.createMessage(msg);
    return Response.json({ msg }, { status: 200 });
}
