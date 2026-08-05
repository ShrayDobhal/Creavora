import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export function useWebSocket(roomId, callbacks = {}) {
  const socketRef = useRef(null);
  const callbacksRef = useRef(callbacks);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    // Connect to websocket server (dynamic host resolution)
    const socket = io(window.location.origin, {
      path: "/api/socket"
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (roomId) {
        socket.emit("join_room", roomId);
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Listeners for message events
    socket.on("new_message", (message) => {
      if (callbacksRef.current.onMessage) {
        callbacksRef.current.onMessage(message);
      }
    });

    socket.on("typing_indicator", ({ userId, username, isTyping }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) {
          next[userId] = username;
        } else {
          delete next[userId];
        }
        return next;
      });
    });

    socket.on("message_read", (payload) => {
      if (callbacksRef.current.onMessageRead) {
        callbacksRef.current.onMessageRead(payload);
      }
    });

    return () => {
      if (roomId) {
        socket.emit("leave_room", roomId);
      }
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (payload) => {
    if (socketRef.current && connected) {
      socketRef.current.emit("send_message", {
        ...payload,
        conversationId: roomId
      });
    }
  };

  const sendTyping = (username, isTyping) => {
    if (socketRef.current && connected) {
      socketRef.current.emit("typing", {
        roomId,
        username,
        isTyping
      });
    }
  };

  return {
    connected,
    sendMessage,
    sendTyping,
    typingUsers: Object.values(typingUsers)
  };
}
