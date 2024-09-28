"use client"

import { SquarePen } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { useRef } from "react"
import useEmptyInput from "@/lib/hooks/useEmptyInput"
import { createChannel } from "@/lib/chats/chat.actions"

export default function ComposeDialog(){
    const joinInput = useRef<HTMLInputElement>(null);
    const {isEmpty: isJoinEmpty} = useEmptyInput(joinInput);
    async function create(){
        await createChannel("New channel");
    }
    return <Dialog modal>
        <DialogTrigger asChild>
            <Button variant={"topbar"} size={"icon"} className="opacity-75 flex-shrink-0 rounded-xl text-white/75 hover:text-white"><SquarePen size={20}></SquarePen></Button>
        </DialogTrigger>
        <DialogContent>
            <DialogTitle>Join a new chat</DialogTitle>
            <Input ref={joinInput} id="join-chat-input" placeholder="Username, channel ID or invite link"/>
            <Button disabled={isJoinEmpty}>Join chat</Button>
            <hr/>
            <DialogClose asChild>
                <Button variant={"secondary"} onClick={create}>or create a new text channel</Button>
            </DialogClose>
        </DialogContent>
    </Dialog>
}