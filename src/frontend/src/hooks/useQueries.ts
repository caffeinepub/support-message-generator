import { useMutation, useQuery } from "@tanstack/react-query";
import { Role } from "../backend.d";
import { useActor } from "./useActor";

export function useCreateSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createSession();
    },
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      sessionId,
      message,
    }: { sessionId: string; message: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addUserMessageWithResponse(sessionId, message);
    },
  });
}

export function useSessionMessages(sessionId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["session-messages", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return [];
      return actor.getSessionMessages(sessionId);
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export { Role };
