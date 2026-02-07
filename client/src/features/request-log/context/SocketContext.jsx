import { useState, useEffect } from 'react';
import { getSocket } from '../../../lib/socket';
import { SOCKET_EVENTS } from '../../../constants';
import { SocketContext } from './socketContext';

export function SocketProvider({ children }) {
  const [socket] = useState(() => getSocket());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      socket.emit(SOCKET_EVENTS.SUBSCRIBE_LOGS);
    }

    function onDisconnect() {
      setConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}
