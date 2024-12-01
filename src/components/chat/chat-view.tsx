"use client";
import { useSocket } from "@/lib/hooks/use-socket";
import { cn } from "@/lib/utils";
import { OptionsPopover } from "./options-popover";

export function ChatView() {
  const { connected } = useSocket();
  return (
    <div
      className={cn(
        "h-full w-full bg-neutral-900/50 rounded-2xl border border-border p-2 overflow-auto"
      )}
    >
      <div className="w-2 h-96 bg-white"></div>
      <div className="w-2 h-96 bg-white"></div>
      <div className="w-2 h-96 bg-white"></div>
      <div className="w-2 h-96 bg-white"></div>
      <div className="w-2 h-96 bg-white"></div>
    </div>
  );
}
