"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const cookie_1 = require("cookie");
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = (0, next_1.default)({ dev, hostname, port });
const handler = app.getRequestHandler();
let io;
app.prepare().then(() => {
    const httpServer = (0, node_http_1.createServer)(handler);
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: `http://${hostname}:${port}`
        }
    });
    io.use(async (socket, next) => {
        try {
            const cookies = socket.handshake.headers.cookie;
            if (!cookies)
                return next(new Error("Authentication error: no cookies were sent."));
            const { auth_session } = (0, cookie_1.parse)(cookies);
            if (!auth_session)
                return next(new Error("Authentication error: no session ID was found in cookie."));
            console.log(`http://${hostname}:${port}/api/validate-auth`);
            const req = await fetch(`http://${hostname}:${port}/api/validate-auth`, {
                body: JSON.stringify({ sessionId: auth_session }),
                method: "POST"
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await req.json();
            if ("error" in res)
                return next(new Error(res.error));
            const { username, userId } = res;
            socket.user = { username, userId, sessionId: auth_session };
            next();
        }
        catch (error) {
            console.error("Something went wrong: ", error);
            return next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        socket.on("join_channel", async (id) => {
            var _a, _b;
            console.log(`${(_a = socket.user) === null || _a === void 0 ? void 0 : _a.username} is trying to join ${id}`);
            const res = await fetch(`http://${hostname}:${port}/api/can-user-join`, {
                body: JSON.stringify({
                    sessionId: (_b = socket.user) === null || _b === void 0 ? void 0 : _b.sessionId,
                    channelId: id
                }),
                method: "POST"
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await res.json();
            if (result.allow !== true)
                return result.error;
            else {
                socket.join(id);
            }
        });
        socket.on("send_message", async (channelId, content) => {
            var _a;
            const res = await fetch(`http://${hostname}:${port}/api/send-message`, {
                body: JSON.stringify({
                    sessionId: (_a = socket.user) === null || _a === void 0 ? void 0 : _a.sessionId,
                    channelId,
                    content
                }),
                method: "POST"
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body = await res.json();
            if (res.status === 200 && "msg" in body) {
                io.to(channelId).emit("new_message", body.msg);
            }
        });
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
