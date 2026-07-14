// Singleton to share the WebSocket instance safely across Next.js internal server compilation threads
export const socketStore = {
  io: null as any,
  setIo(ioInstance: any) {
    this.io = ioInstance;
    console.log("🎯 Socket.IO successfully bound to the shared singleton store");
  },
  getIo() {
    return this.io;
  }
};