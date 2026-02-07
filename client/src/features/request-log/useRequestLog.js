import { useReducer, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { SOCKET_EVENTS } from '../../constants';

const MAX_LOGS = 200;

const initialState = {
  logs: [],
  selectedLog: null,
};

function requestLogReducer(state, action) {
  switch (action.type) {
    case 'REQUEST_NEW':
      return {
        ...state,
        logs: [action.payload, ...state.logs.slice(0, MAX_LOGS - 1)],
      };
    case 'REQUEST_COMPLETE': {
      const index = state.logs.findIndex(log => log.id === action.payload.id);
      if (index === -1) {
        // Complete arrived before new — insert as already-completed entry
        return {
          ...state,
          logs: [action.payload, ...state.logs.slice(0, MAX_LOGS - 1)],
        };
      }
      const updatedLogs = [...state.logs];
      updatedLogs[index] = { ...updatedLogs[index], ...action.payload };
      return { ...state, logs: updatedLogs };
    }
    case 'SELECT_LOG':
      return {
        ...state,
        selectedLog: action.payload,
      };
    case 'CLOSE_DETAILS':
      return {
        ...state,
        selectedLog: null,
      };
    case 'CLEAR_LOGS':
      return {
        ...state,
        logs: [],
        selectedLog: null,
      };
    default:
      return state;
  }
}

export function useRequestLog() {
  const { socket } = useWebSocket();
  const [state, dispatch] = useReducer(requestLogReducer, initialState);

  useEffect(() => {
    if (!socket) return;

    function onRequestNew(log) {
      dispatch({ type: 'REQUEST_NEW', payload: log });
    }

    function onRequestComplete(log) {
      dispatch({ type: 'REQUEST_COMPLETE', payload: log });
    }

    socket.on(SOCKET_EVENTS.REQUEST_NEW, onRequestNew);
    socket.on(SOCKET_EVENTS.REQUEST_COMPLETE, onRequestComplete);

    return () => {
      socket.off(SOCKET_EVENTS.REQUEST_NEW, onRequestNew);
      socket.off(SOCKET_EVENTS.REQUEST_COMPLETE, onRequestComplete);
    };
  }, [socket]);

  const clearLogs = useCallback(() => dispatch({ type: 'CLEAR_LOGS' }), []);
  const selectLog = useCallback((log) => dispatch({ type: 'SELECT_LOG', payload: log }), []);
  const closeDetails = useCallback(() => dispatch({ type: 'CLOSE_DETAILS' }), []);

  return {
    logs: state.logs,
    selectedLog: state.selectedLog,
    clearLogs,
    selectLog,
    closeDetails,
  };
}
