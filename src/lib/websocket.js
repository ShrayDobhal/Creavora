import { Server } from "socket.io";

export function initWebSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);

    // Join room for specific direct chat or general group conversation
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Leave room
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Typing indicators
    socket.on("typing", ({ roomId, userId, username, isTyping }) => {
      socket.to(roomId).emit("typing_indicator", { roomId, userId, username, isTyping });
    });

    // Read receipts
    socket.on("read_receipt", ({ roomId, messageId, userId }) => {
      socket.to(roomId).emit("message_read", { roomId, messageId, userId });
    });

    // Handle incoming client message and broadcast
    socket.on("send_message", (messagePayload) => {
      const { conversationId } = messagePayload;
      if (conversationId) {
        socket.to(conversationId).emit("new_message", messagePayload);
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket client disconnected:", socket.id);
    });
  });

  global.io = io;
  return io;
}
