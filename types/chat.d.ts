// Chat-related types for customer messages and system events
export interface Attachment {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number; // bytes
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type Sender = 'user' | 'agent' | 'system';

export interface Message {
  id: string;
  content: string;
  sender: Sender;
  timestamp: Date;
  status: MessageStatus;
  attachments?: Attachment[];
  metadata?: {
    editedAt?: Date;
    deletedAt?: Date;
    replyTo?: string;
  };
}

export interface ChatAnalytics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  messages: number;
  responseTime: number; // seconds
  satisfaction?: 1 | 2 | 3 | 4 | 5;
  resolved: boolean;
  tags: string[];
}
