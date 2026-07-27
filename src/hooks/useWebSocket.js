import { useEffect, useRef, useState } from 'react';
import { config } from '../config/env';

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

function getWsUrl() {
  const apiUrl = config.apiUrl;
  if (apiUrl.startsWith('http')) {
    return apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '/ws');
  }
  const loc = window.location;
  const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${loc.host}/ws`;
}

export function useWebSocket(onNotification) {
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const [connected, setConnected] = useState(false);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  const connectRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (wsRef.current && wsRef.current.readyState <= 1) return;

      const ws = new WebSocket(`${getWsUrl()}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'notification') {
            onNotificationRef.current?.(msg.data);
          }
        } catch { /* silent */ }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimer.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectRef.current?.();
          }, RECONNECT_DELAY);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectRef.current = connect;
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
    };
  }, []);

  return { connected };
}
