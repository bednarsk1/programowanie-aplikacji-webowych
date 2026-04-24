import type { Notification } from "../models/Notification";
import { STORAGE_TYPE } from "../config/storage";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

const KEY = "manageme_notifications";

export const NotificationService = {
  getAll(): Notification[] {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(KEY);
      return data ? JSON.parse(data) : [];
    }

    const notifications: Notification[] = [];

    getDocs(collection(db, "notifications")).then((snapshot) => {
      snapshot.forEach((docItem) => {
        notifications.push(docItem.data() as Notification);
      });
    });

    return notifications;
  },

  getForUser(userId: string): Notification[] {
    return this.getAll().filter((n) => n.recipientId === userId);
  },

  create(notification: Notification) {
    if (STORAGE_TYPE !== "firebase") {
      const notifications = this.getAll();
      notifications.push(notification);
      localStorage.setItem(KEY, JSON.stringify(notifications));
      return;
    }

    addDoc(collection(db, "notifications"), { ...notification });
  },

  markAsRead(id: string) {
    if (STORAGE_TYPE !== "firebase") {
      const notifications = this.getAll().map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );

      localStorage.setItem(KEY, JSON.stringify(notifications));
      return;
    }

    const notification = this.getAll().find((n) => n.id === id);

    if (!notification) return;

    updateDoc(doc(db, "notifications", id), {
      ...notification,
      isRead: true,
    });
  },
};
