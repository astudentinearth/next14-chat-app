"use client"

import { Button } from "./ui/button"
import {Settings, SquarePen} from "lucide-react"

export function Sidebar(){
    return <div className="h-full bg-neutral-900 w-72 rounded-2xl flex flex-col p-2 gap-1 border border-border">
    <div className="flex items-center flex-shrink-0">
        <h1 className="font-bold text-xl pl-2 flex-shrink-0 opacity-85">My Chats</h1>
        <div className="w-full"></div>
        <Button variant={"topbar"} size={"icon"} className="opacity-75 flex-shrink-0 rounded-xl text-white/75 hover:text-white"><SquarePen size={20}></SquarePen></Button>
    </div>
    <div className="h-full"></div>
    <Button className="gap-2 justify-start rounded-xl pl-2 text-white/75 hover:text-white" variant={"ghost"}><Settings size={20}/>Account and settings</Button>
  </div>
}