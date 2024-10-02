import { verifyRequestOrigin } from "lucia";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
	if (request.method === "GET") {
		return NextResponse.next();
	}
	if (
		// TODO: implement verification to ensure these can only be invoked from this server
		request.nextUrl.pathname.startsWith("/api/validate-auth") ||
		request.nextUrl.pathname.startsWith("/api/can-user-join") ||
		request.nextUrl.pathname.startsWith("/api/send-message")
	)
		return NextResponse.next();
	const originHeader = request.headers.get("Origin");
	// NOTE: You may need to use `X-Forwarded-Host` instead
	const hostHeader = request.headers.get("Host");
	if (
		!originHeader ||
		!hostHeader ||
		!verifyRequestOrigin(originHeader, [hostHeader])
	) {
		return new NextResponse(null, {
			status: 403
		});
	}
	return NextResponse.next();
}
