"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import type { Message } from "@/types/chat";

interface ChatState {
  isOpen: boolean;
  minimized: boolean;
  unread: number;
  messages: Message[];
}

type ChatAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "MINIMIZE"; payload: boolean }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_UNREAD"; payload: number };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true, minimized: false, unread: 0 };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "MINIMIZE":
      return { ...state, minimized: action.payload };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        unread: state.isOpen ? state.unread : state.unread + 1,
      };
    case "SET_UNREAD":
      return { ...state, unread: action.payload };
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, {
    isOpen: false,
    minimized: false,
    unread: 0,
    messages: [],
  });

  // Persistent chat (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("chat_state");
      if (raw) {
        const parsed = JSON.parse(raw) as ChatState;
        // Avoid unused variable warnings by dispatching sync
        if (parsed.isOpen) dispatch({ type: "OPEN" });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("chat_state", JSON.stringify(state));
    } catch {}
  }, [state]);

  const open = useCallback(() => dispatch({ type: "OPEN" }), []);
  const close = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const minimize = useCallback((on: boolean) => dispatch({ type: "MINIMIZE", payload: on }), []);
  const addMessage = useCallback((m: Message) => dispatch({ type: "ADD_MESSAGE", payload: m }), []);

  return useMemo(
    () => ({
      ...state,
      open,
      close,
      minimize,
      addMessage,
    }),
    [state, open, close, minimize, addMessage]
  );
}
