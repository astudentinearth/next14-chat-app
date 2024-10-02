import { joinChannel } from "@/lib/chats/chat.actions";

export async function GET(
	req: Request,
	{ params }: { params: { id: string } }
) {
	await joinChannel(params.id);
	return Response.json({});
}
