"use client"

import { useEffect, useState } from "react";
import { Button } from "../ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { deleteAccount } from "@/lib/auth/auth.actions";
import { useQuery } from "@tanstack/react-query";

export default function DeleteAccountDialog(){
    const [enabled, setEnabled] = useState(false);
    const [input, setInput] = useState("");
    const { isFetching, refetch } = useQuery({ queryKey: ["deleteAccount"], queryFn: ()=>{deleteAccount()}, enabled: false });
    useEffect(()=>{
        if(input === "delete my account"){
            setEnabled(true);
        } else setEnabled(false);
    }, [input]);
    return <Dialog>
        <DialogTrigger asChild>
            <Button className="w-fit" variant={"secondary"}>Delete Account</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
                <div className="border border-border rounded-md p-2">
                    <span>
                        The following will happen when you proceed:
                        <ul>
                            <li>- Your username will be available for new signups.</li>
                            <li>- Messages you sent will be deleted.</li>
                            <li>- Channels you crated will be deleted and <strong>their members will not be able to access messages in said channels.</strong></li>
                        </ul>
                    </span>
                </div>
                <span className="text-white">
                This action cannot be undone. Type <strong>&quot;delete my account&quot;</strong> below to continue.
                </span>
                <Input value={input} onChange={(e)=>{setInput(e.target.value)}} type="text"/>
            </DialogDescription>
            <DialogFooter>
                <Button onClick={()=>{refetch()}} disabled={!enabled || isFetching} variant={"destructive"}>Delete Account</Button>
                <DialogClose asChild>
                    <Button variant={"secondary"}>Cancel</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}