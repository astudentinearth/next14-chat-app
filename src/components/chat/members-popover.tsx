"use client"

import { Channel } from "@/lib/db/schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useQuery } from "@tanstack/react-query";
import { getChannelParticipants } from "@/lib/chats/chat.actions";
import { Crown, LoaderCircle, Users } from "lucide-react";
import { Button } from "../ui/button";

export function MembersPopover({channel}: {channel: Channel}){
    const {data, isLoading} = useQuery({
        queryKey: ["channel-members", channel.id],
        queryFn: async ()=>await getChannelParticipants(channel.id)
    })
    return <Popover>
        <PopoverTrigger asChild>
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Users size={20}/></Button>
        </PopoverTrigger>
        <PopoverContent asChild className="p-1 rounded-xl">
            <div>
                {isLoading ? <LoaderCircle size={32} className="opacity-50 animate-spin"/> : 
                (Array.isArray(data) ? data.map((m)=><div key={m.id} className="p-2 hover:bg-secondary/50 rounded-lg flex items-center gap-2">
                    {m.username} {(channel.owner === m.id) && <Crown className="inline" size={16}/>}
                </div>) : data)}
            </div>
        </PopoverContent>
    </Popover>
}