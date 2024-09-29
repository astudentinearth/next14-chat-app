"use client"

import { Hash, Send, SquarePen } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useState } from "react"
import JoinChannelDialog from "./compose-dialog"
import DirectMessageDialog from "./new-dm-dialog"

export default function NewChatDropdown(){
    const [joinChannelOpen, setJoinChannelOpen] = useState(false);
    const [dmOpen, setDmOpen] = useState(false);
    return <DropdownMenu modal>
        <DropdownMenuTrigger asChild>
            <Button variant={"topbar"} size={"icon"} className="opacity-75 flex-shrink-0 rounded-xl text-white/75 hover:text-white bg-neutral-950"><SquarePen size={20}></SquarePen></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-2xl">
            <DropdownMenuItem className="rounded-xl gap-2" onSelect={()=>setDmOpen(true)}><Send size={14}/>Start a direct message</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl gap-2" onSelect={()=>setJoinChannelOpen(true)}><Hash size={14}/>Join or create a channel</DropdownMenuItem>
        </DropdownMenuContent>
        <JoinChannelDialog open={joinChannelOpen} setOpen={setJoinChannelOpen}/>
        <DirectMessageDialog open={dmOpen} setOpen={setDmOpen}/>
    </DropdownMenu>
}