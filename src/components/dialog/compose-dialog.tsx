"use client"

import { createChannel, joinChannel } from "@/lib/chats/chat.actions"
import useEmptyInput from "@/lib/hooks/useEmptyInput"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"

export default function JoinChannelDialog({open, setOpen}: {open:boolean, setOpen: (open: boolean)=>void}){
    const joinInput = useRef<HTMLInputElement>(null);
    const {isEmpty: isJoinEmpty} = useEmptyInput(joinInput);
    const nav = useRouter();
    async function create(){
        await createChannel("New channel");
    }
    async function join(){
        if(!joinInput.current) return;
        if(joinInput.current.value.trim() === "") return;
        console.log(await joinChannel(joinInput.current.value.trim()));
    }
    return <Dialog modal open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogTitle>Join a new chat</DialogTitle>
            <Input ref={joinInput} id="join-chat-input" placeholder="Username or invite link"/>
            <DialogClose asChild>
                <Button onClick={join}>Join chat</Button>
            </DialogClose>
            <hr/>
            <DialogClose asChild>
                <Button variant={"secondary"} onClick={create}>or create a new text channel</Button>
            </DialogClose>
        </DialogContent>
    </Dialog>
}