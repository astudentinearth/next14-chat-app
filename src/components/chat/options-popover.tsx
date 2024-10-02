"use client"

import { Channel } from "@/lib/db/schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { LogOut, Settings2 } from "lucide-react";
import { leaveChannel } from "@/lib/chats/chat.actions";

export function OptionsPopover({channel}: {channel: Channel}){

    return <Popover>
        <PopoverTrigger>
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Settings2 size={20}/></Button>
        </PopoverTrigger>
        <PopoverContent asChild className="p-1 w-fit rounded-xl">
            <div>
                <Button onClick={()=>{leaveChannel(channel.id)}} variant={"secondary"} className="gap-2"><LogOut size={16}/> Leave channel</Button>
            </div>
        </PopoverContent>
    </Popover>
}