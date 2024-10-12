"use client"

import { getChannels } from "@/lib/chats/chat.actions"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { CircleUser, Hash, LoaderCircle, LogOut, Menu, Settings, UserRound } from "lucide-react"
import { useRouter } from "next/navigation"
import NewChatDropdown from "./dialog/new-chat-dropdown"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

export function Sidebar({id, username, mobile, settings, home}: {id?: string, username:string, mobile?: boolean, settings?: boolean, home?:boolean}){
	const {data, isLoading} = useQuery({
		queryFn: async ()=>{return await getChannels()},
		queryKey: ["chat-list"]
	});
	
	const nav = useRouter();

	const SidebarContent = () => <div className="h-full flex flex-col">
		<div className="flex items-center flex-shrink-0">
			<h1 className="font-bold text-xl pl-2 flex-shrink-0 opacity-85">Chat</h1>
			<div className="w-full"></div>
			<NewChatDropdown/>
		</div>
		<div className={cn("h-full flex gap-1 flex-col overflow-y-auto scroll-view", isLoading && "justify-center items-center")}>
			{isLoading ? <LoaderCircle size={32} className="opacity-50 animate-spin"/> : 
			Array.isArray(data) && data.map((c)=><Button key={c.id} onClick={()=>{nav.push(`/chat/${c.id}`)}}
			className={cn("gap-2 justify-start rounded-xl pl-2 w-full h-10 text-white/75 hover:text-white flex-shrink-0", id===c.id && "bg-secondary/50")}
			variant={"ghost"}>{c.isDirectMessage ? <UserRound size={20}/> : <Hash size={20}/>}{c.name}</Button>)
			}
			
		</div>
		<Button className={cn("gap-2 justify-start rounded-xl pl-2 h-10 text-white/75 hover:text-white flex-shrink-0", settings && "bg-secondary/50")} onClick={()=>{nav.push("/settings")}} variant={"ghost"}><Settings size={20}/>Account and settings</Button>
		<div className="flex gap-2 items-center pl-2 text-white/75">
			<CircleUser className="flex-shrink-0" size={20}/>
			<span className="flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap w-[60%]">{username}</span>
			<div className="w-full"></div>
			<Button className="gap-2 justify-center rounded-xl w-10 h-10 p-0  text-white/75 hover:text-destructive-foreground hover:bg-destructive/50 flex-shrink-0" onClick={()=>{nav.push("/api/logout")}} variant={"ghost"}><LogOut size={20}/></Button>
		</div>
	</div>

	return mobile ? 
	<Sheet>
		<SheetTrigger asChild>
			<Button variant={"topbar"} className="w-10 h-10 p-0 sm:hidden"><Menu/></Button>
		</SheetTrigger>
		<SheetContent side={"left"} className="w-72 p-2">
			<div className="flex gap-2 flex-col h-full">
				<SidebarContent/>
			</div>
		</SheetContent>
	</Sheet> : 
	<div className={cn("h-full bg-neutral-900 w-72 rounded-2xl sm:flex flex-col p-2 gap-1 border border-border flex-shrink-0", !home && "hidden", home && "w-full sm:w-72" )}>
		<SidebarContent/>
	</div>
}
