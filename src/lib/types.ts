import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

export interface NextApiResponseWithIO extends NextApiResponse {
    socket: SocketWithIO;
}

export interface SocketWithIO extends Socket {
    server: ServerWithIO;
}

export interface ServerWithIO extends NetServer {
    io: IOServer;
}
