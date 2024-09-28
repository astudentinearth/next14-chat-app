import ChatPanel from "@/components/chat";
import { Sidebar } from "@/components/sidebar";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const user = await getUser();
  if(!user) return redirect("/login")
  return (
    <div className="w-full h-full absolute flex p-2 gap-2">
      <Sidebar/>
      <ChatPanel/>
    </div>
  );
}
