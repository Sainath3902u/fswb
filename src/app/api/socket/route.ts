import { NextRequest, NextResponse } from "next/server";
import { Server as ServerIO } from "socket.io";
import { socketStore } from "@/lib/socketStore";

export async function GET(req: NextRequest) {
  // Check if server is already running in global memory
  if ((global as any).io) {
    return NextResponse.json({ success: true, message: "Socket server already alive" }, { status: 200 });
  }

  console.log("🚀 Instantiating live real-time Socket.IO server context inside Next.js...");

  // Extract the raw Node.js HTTP server out of the runtime environment proxy
  const httpServer = (global as any).server || (req as any).socket?.server;
  
  if (!httpServer) {
    return NextResponse.json({ success: false, error: "Raw HTTP Server context unreachable" }, { status: 500 });
  }

  const io = new ServerIO(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client linked to socket terminal: ${socket.id}`);

    // Join room channel isolated specifically to this student user's ID
    socket.on("join_user_room", (userId: string) => {
      socket.join(userId);
      console.log(`🎯 User joined clean isolated tracking room: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  // Bind references to both scopes to ensure persistent memory access
  (global as any).io = io;
  socketStore.setIo(io);

  return NextResponse.json({ success: true, message: "Socket server instantiated successfully" }, { status: 200 });
}