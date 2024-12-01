"use client";

import { loadMessages } from "@/lib/chats/chat.actions";
import { Channel, Message } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, Send, ShieldOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import InvitePopover from "./invite-popover";
import { MembersPopover } from "./members-popover";
import NamePopover from "./name-popover";
import { OptionsPopover } from "./options-popover";
import { Sidebar } from "../sidebar";
export * from "./chat-view";

export default function ChatPanel({
    id,
    userId,
    hostname,
    dev,
    username
}: {
    id: string;
    userId: string;
    username: string;
    hostname: string;
    dev: boolean;
}) {
    const msgbox = useRef<HTMLInputElement>(null);
    const chatView = useRef<HTMLDivElement>(null);
    const { data: channels, isLoading } = useQuery<Channel[] | undefined>({
        queryKey: ["chat-list"]
    });
    const channel = channels?.find((item) => item.id === id);

    const [msgState, setMsgState] = useState<Message[]>([]);
    const [count, setCount] = useState(15);

    const { data: messages, isLoading: msgLoading } = useQuery({
        queryFn: async () => await loadMessages(id, count, count - 15),
        queryKey: ["current-channel-messages", id, count]
    });

    useEffect(() => {
        if (Array.isArray(messages)) {
            if (count === 15) setMsgState(messages);
            else {
                msgState.push(...messages);
            }
        }
    }, [messages]);

    let socket: Socket;
    if (dev) {
        socket = io(`http://${hostname}`);
    } else socket = io(`wss://${hostname}`);

    useEffect(() => {
        socket.connect();
        socket.emit("join_channel", id);
        socket.on("new_message", (data) => {
            const msg = data as Message;
            for (const m of msgState) {
                if (m.id === msg.id) return;
            }
            const newState = [...msgState];
            newState.unshift(msg);
            setMsgState(newState);
        });
        return () => {
            socket.disconnect();
        };
    }, [socket, id]);

    useEffect(() => {
        if (chatView.current) {
            chatView.current.scrollTo(0, chatView.current.scrollHeight);
        }
    }, [msgState]);

    const send = async () => {
        if (!msgbox.current || !channel) return;
        if (msgbox.current.value.trim() == "") return;
        const msg = msgbox.current.value.trim();
        socket.emit("send_message", channel.id, msg);
        msgbox.current.value = "";
    };

    const loadMore = () => {
        setCount(count + 15);
    };
    return channel ? (
        <div
            className={cn(
                "h-full w-full bg-neutral-900/50 rounded-2xl border border-border p-2 flex flex-col",
                msgLoading && "justify-center items-center"
            )}
        >
            {msgLoading ? (
                <div>
                    <LoaderCircle
                        size={32}
                        className="opacity-50 animate-spin"
                    />
                </div>
            ) : (
                <>
                    <div className="flex gap-2 [&>button]:flex-shrink-0 ">
                        <Sidebar id={id} username={username} mobile />
                        {channel.isDirectMessage ? (
                            <></>
                        ) : (
                            <OptionsPopover channel={channel} />
                        )}
                        {channel?.isDirectMessage ||
                        channel.owner !== userId ? (
                            <></>
                        ) : (
                            <InvitePopover id={id} />
                        )}
                        <NamePopover
                            name={channel?.name ?? ""}
                            isLoading={isLoading}
                            id={id}
                        />
                        <div className="flex-grow"></div>
                        {channel?.isDirectMessage ? (
                            <></>
                        ) : (
                            <MembersPopover channel={channel} />
                        )}
                    </div>
                    <div
                        ref={chatView}
                        className="h-full flex flex-col flex-nowrap gap-2 pt-2 overflow-y-auto my-2 bottom-align scroll-view"
                    >
                        <div className="p-2 border-border border max-w-96 self-center rounded-lg text-foreground/75 text-sm text-center">
                            <p>
                                <ShieldOff size={16} className="inline" />
                                &nbsp;&nbsp;This application does not use
                                end-to-end encryption. Do not send anything
                                sensitive.
                            </p>
                        </div>
                        <Button
                            onClick={loadMore}
                            variant={"secondary"}
                            className="max-w-60 self-center rounded-full"
                        >
                            Load more
                        </Button>
                        {messages instanceof Array
                            ? msgState.toReversed().map((m) => (
                                  <div key={m.id} className="flex">
                                      {userId === m.sender && (
                                          <div className="flex-grow"></div>
                                      )}
                                      <div
                                          className={cn(
                                              "flex flex-col shrink-0 bg-neutral-900 p-3 w-fit rounded-2xl border border-border drop-shadow-md max-w-[70vw]",
                                              userId === m.sender &&
                                                  "bg-primary/85 text-primary-foreground border-none"
                                          )}
                                      >
                                          {userId !== m.sender &&
                                              !channel?.isDirectMessage && (
                                                  <span className="font-bold block">
                                                      {m.senderUsername}
                                                  </span>
                                              )}
                                          <span className="block">
                                              {m.content}
                                          </span>
                                      </div>
                                  </div>
                              ))
                            : messages}
                    </div>
                    <div className="flex gap-2 bottom-4 right-4">
                        <Input
                            onKeyDown={(e) => {
                                if (e.key == "Enter") send();
                            }}
                            ref={msgbox}
                            aria-label="message"
                            id="message-input"
                            type="text"
                            placeholder="Type a message"
                            className="rounded-lg bg-neutral-900 border border-border"
                        />
                        <Button
                            onClick={send}
                            variant={"default"}
                            className="p-0 w-10 h-10 text-primary-foreground rounded-lg flex-shrink-0"
                        >
                            <Send size={20} />
                        </Button>
                    </div>
                </>
            )}
        </div>
    ) : (
        <></>
    );
}
