"use client"

import { Hash, Settings, UserRound } from "lucide-react"
import JoinChannelDialog from "./dialog/compose-dialog"
import { Button } from "./ui/button"
import { useQuery } from "@tanstack/react-query"
import { getChannels } from "@/lib/chats/chat.actions"
import { useRouter } from "next/navigation"
import NewChatDropdown from "./dialog/new-chat-dropdown"

export function Sidebar(){
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
		<Button className="gap-2 justify-start rounded-xl pl-2 h-10 text-white/75 hover:text-white" variant={"ghost"}><Settings size={20}/>Account and settings</Button>
		<div className="h-full">
			{isLoading ? "Loading" : 
			data?.map((c)=><Button key={c.id} onClick={()=>{nav.push(`/chat/${c.id}`)}}
			className="gap-2 justify-start rounded-xl pl-2 w-full h-10 text-white/75 hover:text-white" 
			variant={"ghost"}>{c.isDirectMessage ? <UserRound size={20}/> : <Hash size={20}/>}{c.name}</Button>)
			}
			
		</div>
	</div>
}