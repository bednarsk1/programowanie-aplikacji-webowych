export type NotificationPriority = "low" | "medium" | "high";

export type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: NotificationPriority;
  isRead: boolean;
  recipientId: string;
};
