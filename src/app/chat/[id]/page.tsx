import ChatPanel from "@/components/chat";
import { Sidebar } from "@/components/sidebar";
import { getUser } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChatPage({params}: {params: {id: string}}) {
  const user = await getUser();
  if(!user) return redirect("/login")
  const hostname = headers().get("x-forwarded-host");
  if(!hostname) return redirect("/login");
  return (
    <div className="w-full h-full absolute flex p-2 gap-2">
      <Sidebar id={params.id}/>
      {user == null ? <></> : <ChatPanel id={params.id} userId={user.id} hostname={hostname} username={user.username}/>}
    </div>
  );
}
