"use client";

import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatWidget() {
  const { isOpen, minimized, unread, open, close, minimize } = useChat();

  if (!isOpen) {
    return (
      <button
        aria-label="Open chat"
        onClick={open}
        className="right-4 bottom-4 z-50 fixed rounded-full bg-primary text-primary-foreground shadow-lg p-4 hover:scale-105 transition-transform"
      >
        <div className="relative">
          <ChatBubbleIcon className="w-6 h-6" />
          {unread > 0 && (
            <span className="-top-2 -right-2 absolute rounded-full bg-destructive text-destructive-foreground text-xs px-2 py-0.5">
              {unread}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="right-4 bottom-4 z-50 fixed w-[360px] h-[560px] max-w-[90vw] max-h-[80vh]">
      <Card className="flex flex-col w-full h-full">
        <CardHeader className="flex items-center justify-between py-3">
          <CardTitle className="text-base">Live Chat</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => minimize(!minimized)}>
              {minimized ? "Expand" : "Minimize"}
            </Button>
            <Button size="sm" variant="ghost" onClick={close}>
              Close
            </Button>
          </div>
        </CardHeader>
        {!minimized && (
          <CardContent className="flex flex-col gap-2 overflow-hidden h-full">
            <div className="flex-1 overflow-auto rounded-md bg-muted/30 p-3">
              {/* Message list placeholder */}
              <p className="text-muted-foreground text-sm">How can we help you?</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border-input bg-background text-sm rounded-md border px-3 py-2"
                aria-label="Chat message"
              />
              <Button>Send</Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
