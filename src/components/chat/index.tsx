"use client"

import { getChannelInfo, loadMessages, sendMessage } from "@/lib/chats/chat.actions"
import useEmptyInput from "@/lib/hooks/useEmptyInput"
import { useQuery } from "@tanstack/react-query"
import { LoaderCircle, Send, Settings2, Users } from "lucide-react"
import { useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import InvitePopover from "./invite-popover"
import NamePopover from "./name-popover"
import { getUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Channel } from "@/lib/db/schema"
import {io} from "socket.io-client"
import { useRouter } from "next/navigation"

export default function ChatPanel({id, userId, username, hostname}: {id: string, userId: string, username: string, hostname:string}){
    const msgbox = useRef<HTMLInputElement>(null);
    const {isEmpty} = useEmptyInput(msgbox);
    const router = useRouter();

    const {data: messages, isLoading: msgLoading} = useQuery({
        queryFn: async ()=>await loadMessages(id),
        queryKey: ["current-channel-messages", id],
    })
    
    const {data: channels, isLoading} = useQuery<Channel[] | undefined>({queryKey: ["chat-list"]});
    const channel = channels?.find((item)=>item.id===id);
    
    const socket = io(`http://${hostname}`);
    socket.connect();

    const send = async () => {
        if(!msgbox.current || !channel) return;
        if(msgbox.current.value.trim()=="") return;
        const msg = msgbox.current.value.trim();
        await sendMessage(channel.id, msg);
        msgbox.current.value = "";
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
        <div className="h-full flex flex-col gap-2 pt-2 overflow-y-auto my-2 justify-end">
            {(messages instanceof Array) ? messages.toReversed().map((m)=><div key={m.id} className="flex">
                {userId === m.sender && <div className="flex-grow"></div>}
                <div className={cn("flex flex-col shrink-0 bg-neutral-900 p-3 w-fit rounded-2xl border border-border drop-shadow-md max-w-[70vw]", userId === m.sender && "bg-primary/85 text-primary-foreground border-none")}>
                    {(userId !== m.sender && !channel?.isDirectMessage) && <span className="font-bold block">{m.senderUsername}</span>}
                    <span className="block">{m.content}</span>
                </div>
            </div>) : messages}
        </div>
        <div className="flex gap-2 bottom-4 right-4">
            <Input ref={msgbox} aria-label="message" id="message-input" type="text" placeholder="Type a message" className="rounded-lg bg-neutral-900 border border-border"/>
            <Button onClick={send} disabled={isEmpty} variant={"default"} className="p-0 w-10 h-10 text-primary-foreground rounded-lg flex-shrink-0"><Send size={20}/></Button>
        </div>
        </>}
    </div>
}