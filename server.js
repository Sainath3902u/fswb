const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize the Next.js development/production compiler context
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // 📡 Attach a single, permanently active persistent WebSocket instance server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Share this instance context globally so Next.js API routes can access it
  global.io = io;

  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Handle student isolated room routing channels
    socket.on("join_user_room", (userId) => {
      socket.join(userId);
      console.log(`🎯 User room linked up cleanly: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected from gateway: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Stateful Server is running at http://${hostname}:${port}`);
  });
});