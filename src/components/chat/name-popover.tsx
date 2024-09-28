"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button";
import { Hash } from "lucide-react";
import { renameChannel } from "@/lib/chats/chat.actions";
import { useQuery } from "@tanstack/react-query";

export default function NamePopover({name, id}: {name: string, isLoading: boolean, id: string}){
    const inpRef = useRef<HTMLInputElement>(null);
    const {isLoading, refetch} = useQuery({queryKey: ["current-channel-info"]})
    const {refetch: reloadChannels} = useQuery({queryKey: ["chat-list"]});
    const [open, setOpen] = useState(false);
    const rename = async () => {
        if(!inpRef.current) return;
        let newName = inpRef.current.value;
        if(newName.trim()==="") newName = "unnamed channel";
        console.log(await renameChannel(id, newName));
        await refetch();
        await reloadChannels();
    }
    return <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button disabled={isLoading} variant={"topbar"} className="p-2 bg-neutral-900 border border-border text-white/75 hover:text-white rounded-lg flex items-center gap-1.5 drop-shadow-lg h-10">
                <Hash size={20}/>
                <span className="font-bold">{isLoading ? "loading" : name}</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 rounded-2xl bg-neutral-900/75 backdrop-blur-md p-2">
            <Input ref={inpRef} defaultValue={name} placeholder="Type a name"/>
            <Button variant={"secondary"} onClick={()=>{setOpen(false); rename()}}>Rename</Button>
        </PopoverContent>
    </Popover>
}