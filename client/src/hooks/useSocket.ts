import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      socketInstance = io(serverUrl);
      socketInstance.on('connect', () => {
        console.log('✅ Connected to server');
      });
      socketInstance.on('disconnect', () => {
        console.log('❌ Disconnected from server');
      });
    }
    setSocket(socketInstance);
  }, []);

  return socket;
}
