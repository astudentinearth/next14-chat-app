import { NextApiResponseWithIO } from "@/lib/types";
import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";

export const config = {
    api: {
        bodyParser: false
    }
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponseWithIO
) {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        const http: NetServer = res.socket.server as any;
        const io = new IOServer(http, {
            path,
            addTrailingSlash: false
        });
    }
}
