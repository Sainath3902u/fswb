import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";
import { NextResponse } from "next/server";

declare global {
  // Attach socket.io server instance to global to persist across hot-reloads
  // in dev environment without TypeScript errors.
  // eslint-disable-next-line no-var
  var io: ServerIO | undefined;
}

// Failsafe configuration instance hook mapping rules
export async function GET(req: any) {
  if (global.io) {
    return NextResponse.json({ success: true, message: "Socket already active" });
  }

  // Fallback binding mapping sockets on top of your local dev runtime environment process
  console.log("🚀 Initializing live WebSockets handler server...");
  const io = new ServerIO({
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // Room registration logic
    socket.on("join_user_room", (userId) => {
      socket.join(userId);
      console.log(`👤 Student joined isolated socket channel room: ${userId}`);
    });
  });

  global.io = io;
  return NextResponse.json({ success: true, message: "Socket server instantiated" });
}