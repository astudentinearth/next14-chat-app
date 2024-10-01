import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "cookie";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

declare module "socket.io" {
	interface Socket {
		user?: { username: string; userId: string };
	}
}

app.prepare().then(() => {
	const httpServer = createServer(handler);
	const io = new Server(httpServer, {
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
			console.log(`http://${hostname}:${port}/api/validate-auth`);
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
			socket.user = { username, userId };
			next();
		} catch (error) {
			console.error("Something went wrong: ", error);
			return next(new Error("Authentication error"));
		}
	});
	io.on("connection", (socket) => {
		console.log(
			socket.user?.username,
			"connected from: ",
			socket.handshake.address
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
