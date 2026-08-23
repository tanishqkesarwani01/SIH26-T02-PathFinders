import { io } from 'socket.io-client';

// In production, connects to Render backend: https://sih26-t02-pathfinders.onrender.com
// In local development, connects to local backend: http://localhost:5000 (or uses window.location.origin)
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.PROD 
    ? 'https://sih26-t02-pathfinders.onrender.com' 
    : 'http://localhost:5000');

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling']
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

export default socket;
