import { useRef } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { loadDirectMessageChannel } from "@/lib/chats/chat.actions";

export default function DirectMessageDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const load = async () => {
    if (!ref.current) return;
    await loadDirectMessageChannel(ref.current.value.trim());
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Start a direct message</DialogTitle>
        <Input
          ref={ref}
          id="join-chat-input"
          name="chat-username"
          placeholder="Enter a username"
        />
        <DialogClose asChild>
          <Button onClick={load}>Begin the conversation</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
