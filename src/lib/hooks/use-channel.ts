"use client";

import { useParams } from "next/navigation";
import { useChannelQuery } from "./use-channel-query";

export const useChannel = () => {
  const params = useParams<{ id: string }>();
  if (!params) return null;
  const { id } = params;
  const query = useChannelQuery(id);
  return {
    channel: query.data,
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
};
