// Integration placeholders for Slack/Discord/Teams
export interface SlackNotifyPayload {
  channel: string;
  message: string;
  threadTs?: string;
}

export interface DiscordWebhookEmbed {
  title: string;
  description: string;
  color?: number;
}

export interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordWebhookEmbed[];
}
