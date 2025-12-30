import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { RequestHandler } from "express";
import { log } from "./index";
import { storage } from "./storage";

interface Collaborator {
  odId: string;
  odName: string;
  odProfileImage?: string;
  cursor?: { x: number; y: number };
  lastActive: number;
  isEditing: boolean;
}

interface Room {
  collaborators: Map<string, Collaborator>;
}

const rooms = new Map<string, Room>();

export function setupRealtime(httpServer: HTTPServer, sessionMiddleware?: RequestHandler) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST"]
    },
    path: "/socket.io"
  });

  if (sessionMiddleware) {
    io.engine.use(sessionMiddleware);
  }

  io.on("connection", (socket) => {
    const req = socket.request as any;
    const sessionUser = req.session?.passport?.user;
    
    if (!sessionUser) {
      log(`Unauthenticated socket connection rejected: ${socket.id}`, "realtime");
      socket.emit("error", { message: "Authentication required" });
      socket.disconnect(true);
      return;
    }
    
    log(`Socket connected: ${socket.id} (user: ${sessionUser.claims?.email || sessionUser.claims?.sub})`, "realtime");
    
    let currentRoomId: string | null = null;
    let currentUser: Collaborator | null = null;

    socket.on("join:room", async (data: { roomId: string; user: { id: string; name: string; profileImage?: string } }) => {
      const { roomId, user } = data;
      
      if (user.id !== sessionUser.claims?.sub) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }
      
      const companyIdMatch = roomId.match(/^valuation-(.+)$/);
      if (!companyIdMatch) {
        log(`Invalid room format rejected: ${roomId}`, "realtime");
        socket.emit("error", { message: "Invalid room format" });
        return;
      }
      
      const companyId = companyIdMatch[1];
      const authenticatedUserId = sessionUser.claims?.sub;
      
      if (!authenticatedUserId) {
        socket.emit("error", { message: "Invalid session" });
        return;
      }
      
      try {
        const company = await storage.getCompany(companyId, authenticatedUserId);
        if (!company) {
          log(`Unauthorized room access attempt: user ${authenticatedUserId} tried to join ${roomId}`, "realtime");
          socket.emit("error", { message: "Access denied to this valuation" });
          return;
        }
      } catch (err) {
        log(`Error verifying room access: ${err}`, "realtime");
        socket.emit("error", { message: "Failed to verify access" });
        return;
      }
      
      if (currentRoomId) {
        socket.leave(currentRoomId);
        removeFromRoom(currentRoomId, socket.id);
      }

      currentRoomId = roomId;
      currentUser = {
        odId: user.id,
        odName: user.name,
        odProfileImage: user.profileImage,
        lastActive: Date.now(),
        isEditing: false
      };

      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { collaborators: new Map() });
      }
      
      rooms.get(roomId)!.collaborators.set(socket.id, currentUser);
      
      const collaborators = getCollaborators(roomId);
      io.to(roomId).emit("presence:update", collaborators);
      
      log(`User ${user.name} joined room ${roomId}`, "realtime");
    });

    socket.on("presence:editing", (isEditing: boolean) => {
      if (currentRoomId && currentUser) {
        currentUser.isEditing = isEditing;
        currentUser.lastActive = Date.now();
        rooms.get(currentRoomId)!.collaborators.set(socket.id, currentUser);
        
        const collaborators = getCollaborators(currentRoomId);
        io.to(currentRoomId).emit("presence:update", collaborators);
      }
    });

    socket.on("presence:cursor", (cursor: { x: number; y: number }) => {
      if (currentRoomId && currentUser) {
        currentUser.cursor = cursor;
        currentUser.lastActive = Date.now();
        socket.to(currentRoomId).emit("cursor:update", {
          odId: currentUser.odId,
          cursor
        });
      }
    });

    socket.on("valuation:update", (data: { field: string; value: any; snapshot?: any }) => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit("valuation:sync", {
          field: data.field,
          value: data.value,
          snapshot: data.snapshot,
          fromUser: currentUser?.odName || "Unknown"
        });
        log(`Valuation update in room ${currentRoomId}: ${data.field}`, "realtime");
      }
    });

    socket.on("disconnect", () => {
      if (currentRoomId) {
        removeFromRoom(currentRoomId, socket.id);
        const collaborators = getCollaborators(currentRoomId);
        io.to(currentRoomId).emit("presence:update", collaborators);
        log(`Socket ${socket.id} disconnected from room ${currentRoomId}`, "realtime");
      }
    });
  });

  function removeFromRoom(roomId: string, socketId: string) {
    const room = rooms.get(roomId);
    if (room) {
      room.collaborators.delete(socketId);
      if (room.collaborators.size === 0) {
        rooms.delete(roomId);
      }
    }
  }

  function getCollaborators(roomId: string): Collaborator[] {
    const room = rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.collaborators.values());
  }

  log("Realtime collaboration server initialized", "realtime");
  
  return io;
}
