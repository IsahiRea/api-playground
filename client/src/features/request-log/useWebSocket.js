import { useContext } from 'react';
import { SocketContext } from './context/socketContext';

export function useWebSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a SocketProvider');
  }
  return context;
}
