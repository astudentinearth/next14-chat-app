"use client"

import { loadMessages } from "@/lib/chats/chat.actions"
import { Channel, Message } from "@/lib/db/schema"
import useEmptyInput from "@/lib/hooks/useEmptyInput"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { LoaderCircle, Send, Settings2, ShieldOff, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import InvitePopover from "./invite-popover"
import NamePopover from "./name-popover"

export default function ChatPanel({id, userId, username, hostname}: {id: string, userId: string, username: string, hostname:string}){
    const msgbox = useRef<HTMLInputElement>(null);
    const chatView = useRef<HTMLDivElement>(null);
    const {isEmpty} = useEmptyInput(msgbox);
    const router = useRouter();

    const [msgState, setMsgState] = useState<Message[]>([]);
    const [count, setCount] = useState(15);

    const {data: messages, isLoading: msgLoading} = useQuery({
        queryFn: async ()=>await loadMessages(id, count, count-15),
        queryKey: ["current-channel-messages", id, count],
    })
    
    useEffect(()=>{
        if(Array.isArray(messages)){ 
            if(count===15) setMsgState(messages);
            else{
                msgState.push(...messages);
            }
        }
    }, [messages])

    const {data: channels, isLoading} = useQuery<Channel[] | undefined>({queryKey: ["chat-list"]});
    const channel = channels?.find((item)=>item.id===id);
    
    const socket = io(`http://${hostname}`);
    
     useEffect(()=>{
         socket.connect();
         socket.emit("join_channel", id);
         socket.on("new_message", (data)=>{
             const msg = data as Message;
             for(const m of msgState){
                 if(m.id===msg.id) return;
             }
             const newState = [...msgState];
             newState.unshift(msg);
             setMsgState(newState);
         })
         return ()=>{socket.disconnect()}
     }, [socket, id])

    useEffect(()=>{
        if(chatView.current){
            chatView.current.scrollTo(0, chatView.current.scrollHeight);
        }
    }, [msgState]);

    const send = async () => {
        if(!msgbox.current || !channel) return;
        if(msgbox.current.value.trim()=="") return;
        const msg = msgbox.current.value.trim();
        socket.emit("send_message", channel.id, msg);
        msgbox.current.value = "";
    }
    
    const loadMore = ()=>{
        setCount(count + 15);
    }

    return  <div className={cn("h-full w-full bg-neutral-900/50 rounded-2xl border border-border p-2 flex flex-col", msgLoading && "justify-center items-center")}>
        {msgLoading ? <div>
            <LoaderCircle size={32} className="opacity-50 animate-spin"/>
        </div> : 
        <>
        <div className="flex gap-2 [&>button]:flex-shrink-0 ">
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Settings2 size={20}/></Button>
            {channel?.isDirectMessage ? <></> : <InvitePopover id={id}/>}
            <NamePopover name={channel?.name ?? ""} isLoading={isLoading} id={id}/>
            <div className="flex-grow"></div>
            {channel?.isDirectMessage ? <></> : <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Users size={20}/></Button>}
        </div>
        <div ref={chatView} className="h-full flex flex-col flex-nowrap gap-2 pt-2 overflow-y-auto my-2 bottom-align scroll-view">
            <div className="p-2 border-border border max-w-96 self-center rounded-lg text-foreground/75 text-sm text-center">
                <p><ShieldOff size={16} className="inline"/>&nbsp;&nbsp;This application does not use end-to-end encryption. Do not send anything sensitive.</p>
            </div>
            <Button onClick={loadMore} variant={"secondary"} className="max-w-60 self-center rounded-full">Load more</Button>
            {(messages instanceof Array) ? msgState.toReversed().map((m)=><div key={m.id} className="flex">
                {userId === m.sender && <div className="flex-grow"></div>}
                <div className={cn("flex flex-col shrink-0 bg-neutral-900 p-3 w-fit rounded-2xl border border-border drop-shadow-md max-w-[70vw]", userId === m.sender && "bg-primary/85 text-primary-foreground border-none")}>
                    {(userId !== m.sender && !channel?.isDirectMessage) && <span className="font-bold block">{m.senderUsername}</span>}
                    <span className="block">{m.content}</span>
                </div>
            </div>) : messages}
        </div>
        <div className="flex gap-2 bottom-4 right-4">
            <Input onKeyDown={(e)=>{
                if(e.key=="Enter") send();
            }} ref={msgbox} aria-label="message" id="message-input" type="text" placeholder="Type a message" className="rounded-lg bg-neutral-900 border border-border"/>
            <Button onClick={send} variant={"default"} className="p-0 w-10 h-10 text-primary-foreground rounded-lg flex-shrink-0"><Send size={20}/></Button>
        </div>
        </>}
    </div>
}