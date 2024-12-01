import ChatPanel, { ChatView } from "@/components/chat";
import { ChatHeader } from "@/components/chat/chat-header";
import { Sidebar } from "@/components/sidebar";
import { getUser } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const user = await getUser();
  if (!user) return redirect("/login");
  const hostname = headers().get("x-forwarded-host");
  const dev: boolean = process.env.NODE_ENV === "development";
  if (!hostname) return redirect("/login");
  return (
    <div className="w-full h-full absolute flex p-2 gap-2">
      <Sidebar id={params.id} username={user.username} />
      {/*user == null ? <></> : <ChatPanel dev={dev} id={params.id} userId={user.id} hostname={hostname} username={user.username}/>*/}
      <div className="h-full w-full bg-neutral-900/50 rounded-2xl border border-border p-2 overflow-auto">
        <ChatHeader />
        <ChatView />
      </div>
    </div>
  );
}
