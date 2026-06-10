/**
 * Adapts the browser WebSocket to the core `LiveSocket` interface, converting
 * binary (Blob) frames to text so the shared orchestrator only ever sees
 * JSON strings.
 */

import type { LiveSocket } from '@fluentmap/core/voice';

export function createWebSocketAdapter(url: string): LiveSocket {
  const ws = new WebSocket(url);
  const sock: LiveSocket = {
    send: (data: string) => ws.send(data),
    close: (code?: number, reason?: string) => ws.close(code, reason),
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  };

  ws.onopen = () => sock.onopen?.();
  ws.onmessage = async (ev: MessageEvent) => {
    let data: unknown = ev.data;
    if (data instanceof Blob) data = await data.text();
    sock.onmessage?.({ data });
  };
  ws.onerror = () => sock.onerror?.();
  ws.onclose = (ev: CloseEvent) => sock.onclose?.({ code: ev.code, reason: ev.reason });

  return sock;
}
