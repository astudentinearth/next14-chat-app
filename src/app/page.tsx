import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function Home() {
  const user = getUser();
  if(!user) return redirect("/login")
  return (
    <div className="">
      Main page
    </div>
  );
}
