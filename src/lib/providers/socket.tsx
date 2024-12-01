"use client";

import { io as IOClient } from "socket.io-client";
import { createContext, ReactNode, useEffect, useState } from "react";

type IOContextType = {
    socket: any | null;
    connected: boolean;
};

export const IOContext = createContext<IOContextType>({
    socket: null,
    connected: false
});

export const IOProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    useEffect(() => {
        const instance = new (IOClient as any)(
            process.env["NEXT_PUBLIC_SITE_URL"],
            {
                path: "/api/socket/io",
                addTralingSlash: false
            }
        );
        instance.on("connect", () => {
            setConnected(true);
        });
        instance.on("disconnect", () => {
            setConnected(false);
        });
        setSocket(instance);

        return () => {
            instance.disconnect();
        };
    }, []);

    return (
        <IOContext.Provider value={{ socket, connected }}>
            {children}
        </IOContext.Provider>
    );
};
