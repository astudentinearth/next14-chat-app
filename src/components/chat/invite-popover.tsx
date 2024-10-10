"use client"

import { Link, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { useState } from "react"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { useQuery } from "@tanstack/react-query"
import { createInvite, invalidateInvite, listInvites } from "@/lib/chats/chat.actions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

type DurationsType = "30m" | "1h" | "6h" | "24h" | "never";

export default function InvitePopover({id}: {id: string}){
    const [expire, setExpire] = useState<DurationsType>("6h");
    const [oneTime, setOneTime] = useState(false);
    const durations:DurationsType[] = ["30m" , "1h" , "6h" , "24h" , "never"];
    const {data: invites, isLoading, error, refetch} = useQuery({
        queryFn: async () => await listInvites(id),
        queryKey: ["current-channel-invites"]
    })
    const create = async ()=> {
        const link = await createInvite(id, {expires: expire === "never" ? undefined : expire, singleUse: oneTime});
        if(link?.startsWith("Unauthorized")) {
            alert(link);
            return;
        }
        if(link){
            navigator.clipboard.writeText(link);
            await refetch();
        }

    }
    const calcRemaining = (date: Date) => {
        const diff = date.valueOf() - Date.now();
        if(diff < 0) return "Expired";
        if(diff < 1000 * 60 * 60){ // 60m
            return `${Math.ceil(diff/(1000*60))}m`
        }
        return `${Math.ceil(diff/(1000*60*60))}h`
    }
    const copyLink = (uuid: string)=>{
        navigator.clipboard.writeText(`${location.host}/invite/${uuid}`);
    }
    const renderInvites = ()=>{
        if(isLoading) return "Loading";
        if(error) return "Something went wrong";
        if(invites instanceof Array){
            return invites.map((invite)=><Tooltip delayDuration={400} key={invite.id}>
                <div className="grid grid-cols-[1fr_80px_40px] gap-1 w-[332px] items-center">
                    <TooltipTrigger asChild>
                        <span onClick={()=>copyLink(invite.id)} className="ellipsis overflow-hidden whitespace-nowrap p-2 border border-border rounded-lg select-none cursor-pointer hover:border-primary transition-colors">{invite.id}</span>
                    </TooltipTrigger>
                    <span className="place-self-center">{invite.expires==null ? "Never" : calcRemaining(invite.expires)}</span>
                    <Button onClick={async ()=>{
                        await invalidateInvite(invite.id); 
                        await refetch()}} variant={"ghost"} className="w-10 h-10 p-0 text-secondary-foreground/75 hover:text-secondary-foreground/100"><Trash2 size={18}/></Button>
                </div>
                <TooltipContent  className="bg-neutral-950 rounded-full pointer-events-none link-tooltip border-2 border-border drop-shadow-lg">
                    <p>Click to copy</p>
                </TooltipContent>
            </Tooltip>)
        }
        else return invites;
    }
    return <Popover>
        <PopoverTrigger asChild>
            <Button variant={"topbar"} className="p-0 w-10 h-10 text-white/75 hover:text-white"><Link size={20}/></Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2 rounded-2xl bg-neutral-900/75 backdrop-blur-md p-2 w-fit">
            <h1 className="text-lg font-semibold py-2 pl-1 leading-3">Create invite</h1>
            <label className="pl-1">Expire in</label>
            <div className="grid grid-cols-[60px_60px_60px_60px_60px] gap-2">
                {durations.map((d, i)=><Button key={i} onClick={()=>setExpire(d)} variant={expire === d ? "default" : "secondary"}>{d}</Button>)}
            </div>
            <div className="flex gap-2 items-center pl-1 pt-2">
                <Checkbox checked={oneTime} onCheckedChange={(s)=>setOneTime(s.valueOf() as boolean)} id="single-use-invite-checkbox"></Checkbox>
                <Label htmlFor="single-use-invite-checkbox">Allow this invite to be used just once</Label>
            </div>
            <Button onClick={create} className="gap-2"><Link size={18}/>Create invite</Button>
            <hr/>
            <h1 className="text-lg font-semibold py-2 pl-1 leading-3">Existing invites</h1>
            <div className="grid grid-cols-[1fr_80px_40px] gap-1 w-[332px] items-center pl-1 [&>span]:font-semibold text-center">
                <span>Invite ID</span>
                <span>Expiry</span>
            </div>
            <TooltipProvider>
                {renderInvites()}
            </TooltipProvider>
        </PopoverContent>
    </Popover>
}