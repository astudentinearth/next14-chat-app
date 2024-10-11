import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "cookie";
import {
	joinLimiter,
	messagesLimiter,
	socketLimiter
} from "./lib/message-limiter";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

declare module "socket.io" {
	interface Socket {
		user?: { username: string; userId: string; sessionId: string };
	}
}

let io: Server;

app.prepare().then(() => {
	const httpServer = createServer(handler);
	io = new Server(httpServer, {
		cors: {
			origin: `http://${hostname}:${port}`
		}
	});
	io.use(async (socket, next) => {
		try {
			const cookies = socket.handshake.headers.cookie;
			if (!cookies)
				return next(
					new Error("Authentication error: no cookies were sent.")
				);
			const { auth_session } = parse(cookies);
			if (!auth_session)
				return next(
					new Error(
						"Authentication error: no session ID was found in cookie."
					)
				);
			try {
				await socketLimiter.consume(
					`${auth_session}-${socket.handshake.address}`,
					1
				);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (error) {
				return next(new Error("Too many socket messages sent."));
			}
			const req = await fetch(
				`http://${hostname}:${port}/api/validate-auth`,
				{
					body: JSON.stringify({ sessionId: auth_session }),
					method: "POST"
				}
			);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const res: any = await req.json();
			if ("error" in res)
				return next(new Error((res as { error: string }).error));
			const { username, userId } = res as {
				username: string;
				userId: string;
			};
			socket.user = { username, userId, sessionId: auth_session };
			next();
		} catch (error) {
			console.error("Something went wrong: ", error);
			return next(new Error("Authentication error"));
		}
	});
	io.on("connection", (socket) => {
		socket.on("join_channel", async (id) => {
			if (!socket.user) return;
			joinLimiter
				.consume(socket.user.username, 1)
				.then(async () => {
					const res = await fetch(
						`http://${hostname}:${port}/api/can-user-join`,
						{
							body: JSON.stringify({
								sessionId: socket.user?.sessionId,
								channelId: id
							}),
							method: "POST"
						}
					);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const result: any = await res.json();
					if (result.allow !== true) return result.error;
					else {
						socket.join(id);
					}
				})
				.catch(() => {});
		});
		socket.on(
			"send_message",
			async (channelId: string, content: string) => {
				if (!socket.user) return;
				if (content.trim().length > 400) return;
				if (content.trim().length == 0) return;
				messagesLimiter
					.consume(socket.user?.username, 1)
					.then(async () => {
						const res = await fetch(
							`http://${hostname}:${port}/api/send-message`,
							{
								body: JSON.stringify({
									sessionId: socket.user?.sessionId,
									channelId,
									content
								}),
								method: "POST"
							}
						);
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const body: any = await res.json();
						if (res.status === 200 && "msg" in body) {
							io.to(channelId).emit("new_message", body.msg);
						}
					})
					.catch(() => {
						return "Slow down.";
					});
			}
		);
	});

	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Ready on http://${hostname}:${port}`);
		});
});
