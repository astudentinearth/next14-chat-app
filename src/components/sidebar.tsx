"use client"

import { getChannels } from "@/lib/chats/chat.actions"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Hash, LoaderCircle, LogOut, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import NewChatDropdown from "./dialog/new-chat-dropdown"
import { Button } from "./ui/button"

export function Sidebar({id}: {id?: string}){
	const {data, isLoading, error} = useQuery({
		queryFn: async ()=>{return await getChannels()},
		queryKey: ["chat-list"]
	});
	const nav = useRouter();
	return <div className="h-full bg-neutral-900 w-72 rounded-2xl flex flex-col p-2 gap-1 border border-border flex-shrink-0">
		<div className="flex items-center flex-shrink-0">
			<h1 className="font-bold text-xl pl-2 flex-shrink-0 opacity-85">Chat</h1>
			<div className="w-full"></div>
			<NewChatDropdown/>
		</div>
		<div className={cn("h-full flex gap-1 flex-col overflow-y-auto scroll-view", isLoading && "justify-center items-center")}>
			{isLoading ? <LoaderCircle size={32} className="opacity-50 animate-spin"/> : 
			Array.isArray(data) && data.map((c)=><Button key={c.id} onClick={()=>{nav.push(`/chat/${c.id}`)}}
			className={cn("gap-2 justify-start rounded-xl pl-2 w-full h-10 text-white/75 hover:text-white", id===c.id && "bg-secondary/50")}
			variant={"ghost"}>{c.isDirectMessage ? <UserRound size={20}/> : <Hash size={20}/>}{c.name}</Button>)
			}
			
		</div>
		<Button className="gap-2 justify-start rounded-xl pl-2 h-10 text-white/75 hover:text-white" onClick={()=>{nav.push("/api/logout")}} variant={"ghost"}><LogOut size={20}/>Sign out</Button>
	</div>
}