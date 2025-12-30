import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";

export interface Collaborator {
  odId: string;
  odName: string;
  odProfileImage?: string;
  cursor?: { x: number; y: number };
  lastActive: number;
  isEditing: boolean;
}

interface ValuationUpdate {
  field: string;
  value: any;
  snapshot?: any;
  fromUser: string;
}

interface UseCollaborationOptions {
  roomId: string | null;
  onValuationUpdate?: (update: ValuationUpdate) => void;
}

export function useCollaboration({ roomId, onValuationUpdate }: UseCollaborationOptions) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastUpdateRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roomId || !user) return;

    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"]
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join:room", {
        roomId,
        user: {
          id: user.id,
          name: user.firstName || user.email?.split("@")[0] || "Anonymous",
          profileImage: user.profileImageUrl
        }
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("presence:update", (collab: Collaborator[]) => {
      const others = collab.filter(c => c.odId !== user.id);
      setCollaborators(others);
    });

    socket.on("valuation:sync", (update: ValuationUpdate) => {
      const updateKey = `${update.field}-${JSON.stringify(update.value)}`;
      if (updateKey !== lastUpdateRef.current) {
        onValuationUpdate?.(update);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, user, onValuationUpdate]);

  const broadcastUpdate = useCallback((field: string, value: any, snapshot?: any) => {
    if (socketRef.current?.connected) {
      lastUpdateRef.current = `${field}-${JSON.stringify(value)}`;
      socketRef.current.emit("valuation:update", { field, value, snapshot });
    }
  }, []);

  const setEditing = useCallback((isEditing: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("presence:editing", isEditing);
    }
  }, []);

  const updateCursor = useCallback((x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("presence:cursor", { x, y });
    }
  }, []);

  return {
    collaborators,
    isConnected,
    broadcastUpdate,
    setEditing,
    updateCursor
  };
}
