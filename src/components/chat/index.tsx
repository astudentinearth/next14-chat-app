"use client"

import { getChannelInfo } from "@/lib/chats/chat.actions"
import useEmptyInput from "@/lib/hooks/useEmptyInput"
import { useQuery } from "@tanstack/react-query"
import { Send, Settings2, Users } from "lucide-react"
import { useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import InvitePopover from "./invite-popover"
import NamePopover from "./name-popover"

export default function ChatPanel({id}: {id: string}){
    const msgbox = useRef<HTMLInputElement>(null);
    const {isEmpty} = useEmptyInput(msgbox);
    const {data: channel, isLoading} = useQuery({
        queryFn: async ()=>await getChannelInfo(id),
        queryKey: ["current-channel-info"]
    });
    return  <div className="h-full w-full bg-neutral-900/50 rounded-2xl border border-border p-2 flex flex-col">
        <div className="flex gap-2 [&>button]:flex-shrink-0">
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Settings2 size={20}/></Button>
            {channel?.isDirectMessage ? <></> : <InvitePopover id={id}/>}
            <NamePopover name={channel?.name ?? ""} isLoading={isLoading} id={id}/>
            <div className="flex-grow"></div>
            {channel?.isDirectMessage ? <></> : <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Users size={20}/></Button>}
        </div>
        <div className="h-full"></div>
        <div className="flex gap-2">
            <Input ref={msgbox} aria-label="message" id="message-input" type="text" placeholder="Type a message" className="rounded-lg bg-neutral-900 border border-border"/>
            <Button disabled={isEmpty} variant={"default"} className="p-0 w-10 h-10 text-primary-foreground rounded-lg flex-shrink-0"><Send size={20}/></Button>
        </div>
    </div>
}