import DeleteAccountDialog from "@/components/dialog/delete-account-dialog";
import { Sidebar } from "@/components/sidebar";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { About } from "./about";

export default async function SettingsPage(){
    const user = await getUser();
    if(!user) return redirect("/login")
    return <div className="w-full h-full absolute flex p-2 gap-2">
        <Sidebar username={user.username} settings/>
        <div className="h-full w-full bg-neutral-900/50 rounded-2xl border border-border p-4 flex gap-2 flex-col">
            <div className="flex items-center gap-2">
                <Sidebar username={user.username} mobile settings/>
                <h1 className="text-bold text-3xl">Settings</h1>
            </div>
            <div className="h-[1px] bg-muted w-full"></div>
            <h2 className="text-xl">Account deletion</h2>
            <p>You can remove yourself from our servers immediately. <strong>This action is not reversible. All messages, channels and invites that belong to you will be deleted.</strong></p>
            <DeleteAccountDialog/>
            <div className="h-8"></div>
            <About/>
        </div>
    </div>

}