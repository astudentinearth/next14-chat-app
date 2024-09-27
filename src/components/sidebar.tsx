"use client"

import { Button } from "./ui/button"
import {Settings, SquarePen} from "lucide-react"

export function Sidebar(){
    return <div className="h-full bg-neutral-900 w-72 rounded-2xl flex flex-col p-1 gap-1">
    <div className="flex items-center flex-shrink-0">
        <h1 className="font-bold text-xl pl-2 flex-shrink-0 opacity-85">My Chats</h1>
        <div className="w-full"></div>
        <Button variant={"ghost"} size={"icon"} className="opacity-75 flex-shrink-0 rounded-xl"><SquarePen></SquarePen></Button>
    </div>
    <div className="h-full"></div>
    <Button className="gap-2 justify-start rounded-xl pl-2" variant={"ghost"}><Settings size={20}/>Account and settings</Button>
  </div>
}