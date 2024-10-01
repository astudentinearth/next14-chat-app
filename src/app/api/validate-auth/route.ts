import { lucia } from "@/lib/auth";
import cors from "@/lib/cors";

const headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function POST(req: Request) {
	console.log("Validating");
	const body = await req.json();
	if ("sessionId" in body) {
		const { user, session } = await lucia.validateSession(body.sessionId);
		if (user == null || session == null)
			return Response.json(
				{ error: "Unauthorized: user not logged in" },
				{ status: 401, headers }
			);
		else
			return Response.json(
				{ username: user.username, userId: user.id },
				{ headers }
			);
	} else
		return Response.json(
			{ error: "Bad request: no session id provided" },
			{ status: 400, headers }
		);
}

export async function OPTIONS(req: Request) {
	return new Response(null, { headers });
}
