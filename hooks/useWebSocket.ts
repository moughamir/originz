"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  url?: string;
  enabled?: boolean;
}

export function useWebSocket(options: Options = {}) {
  const { url = process.env.NEXT_PUBLIC_WS_URL || "", enabled = false } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
    } catch {
      setConnected(false);
    }

    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
      wsRef.current = null;
    };
  }, [url, enabled]);

  return { connected };
}
