"use client";

import { Link } from "lucide-react";
import { Button } from "../ui/button";
import { OptionsPopover } from "./options-popover";
import NamePopover from "./name-popover";
import { useChannel } from "@/lib/hooks/use-channel";
import { MembersPopover } from "./members-popover";

export function ChatHeader() {
  const q = useChannel();
  if (!q) return <></>;
  const { channel, isPending } = q;
  return (
    <div className="sticky top-0 flex">
      <div className="bg-neutral-900 border border-border rounded-lg drop-shadow-lg flex-shrink-0 flex">
        <OptionsPopover />
        <Button
          variant={"ghost"}
          className="p-0 w-10 h-10 text-white/75 hover:text-white"
        >
          <Link size={20} />
        </Button>
        {channel && (
          <NamePopover
            id={channel.id}
            isLoading={isPending}
            name={channel.name ?? ""}
          />
        )}
      </div>
      <div className="flex-grow"></div>
      <div className="bg-neutral-900 border border-border rounded-lg drop-shadow-lg flex-shrink-0 flex">
        {channel && <MembersPopover channel={channel} />}
      </div>
    </div>
  );
}
