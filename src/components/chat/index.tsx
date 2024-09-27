"use client"

import { Hash, Link, Send, Settings2, Users } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import useEmptyInput from "@/lib/hooks/useEmptyInput"
import { useRef } from "react"

export default function ChatPanel(){
    const msgbox = useRef<HTMLInputElement>(null);
    const {isEmpty} = useEmptyInput(msgbox);
    return  <div className="h-full w-full bg-neutral-900/50 rounded-2xl border border-border p-2 flex flex-col">
        <div className="flex gap-2 [&>button]:flex-shrink-0">
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Settings2 size={20}/></Button>
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Link size={20}/></Button>
            <Button variant={"topbar"} className="p-2 bg-neutral-900 border border-border text-white/75 hover:text-white rounded-lg flex items-center gap-1.5 drop-shadow-lg h-10">
                <Hash size={20}/>
                <span className="font-bold">channel name</span>
            </Button>
            <div className="flex-grow"></div>
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Users size={20}/></Button>
        </div>
        <div className="h-full"></div>
        <div className="flex gap-2">
            <Input ref={msgbox} aria-label="message" id="message-input" type="text" placeholder="Type a message" className="rounded-lg bg-neutral-900 border border-border"/>
            <Button disabled={isEmpty} variant={"default"} className="p-0 w-10 h-10 text-primary-foreground rounded-lg flex-shrink-0"><Send size={20}/></Button>
        </div>
    </div>
}