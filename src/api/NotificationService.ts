import type { Notification } from "../models/Notification";

const KEY = "manageme_notifications";

export const NotificationService = {
  getAll(): Notification[] {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  },

  getForUser(userId: string): Notification[] {
    return this.getAll().filter((n) => n.recipientId === userId);
  },

  create(notification: Notification) {
    const notifications = this.getAll();
    notifications.push(notification);
    localStorage.setItem(KEY, JSON.stringify(notifications));
  },

  markAsRead(id: string) {
    const notifications = this.getAll().map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );

    localStorage.setItem(KEY, JSON.stringify(notifications));
  },
};
