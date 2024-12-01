"use client";

import { useQuery } from "@tanstack/react-query";
import { getChannelInfo } from "../chats/chat.actions";

export const useChannelQuery = (id: string) => {
  const query = useQuery({
    queryKey: ["channel", id],
    queryFn: async () => {
      const data = await getChannelInfo(id);
      if (typeof data === "string") throw new Error(data);
      return data;
    },
  });
  return query;
};
