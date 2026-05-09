import type { Task } from "../models/Task";

import { STORAGE_TYPE } from "../config/storage";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const STORAGE_KEY = "manageme_tasks";

export class TaskService {
  static async getAll(): Promise<Task[]> {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    const snapshot = await getDocs(collection(db, "tasks"));

    return snapshot.docs.map((docItem) => ({
      ...(docItem.data() as Task),
      id: docItem.id,
    }));
  }

  static saveAll(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  static async getByStory(storyId: string): Promise<Task[]> {
    return (await this.getAll()).filter((task) => task.storyId === storyId);
  }

  static async create(task: Task) {
    if (STORAGE_TYPE !== "firebase") {
      const tasks = await this.getAll();
      tasks.push(task);
      this.saveAll(tasks);
      return;
    }

    await addDoc(collection(db, "tasks"), {
      name: task.name,
      description: task.description,
      priority: task.priority,
      storyId: task.storyId,
      estimatedTime: task.estimatedTime,
      status: task.status,
      createdAt: task.createdAt,
      userId: task.userId || null,
      startDate: task.startDate || null,
      endDate: task.endDate || null,
    });
  }

  static async update(updatedTask: Task) {
    if (STORAGE_TYPE !== "firebase") {
      const tasks = (await this.getAll()).map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      this.saveAll(tasks);
      return;
    }

    await updateDoc(doc(db, "tasks", updatedTask.id), {
      name: updatedTask.name,
      description: updatedTask.description,
      priority: updatedTask.priority,
      storyId: updatedTask.storyId,
      estimatedTime: updatedTask.estimatedTime,
      status: updatedTask.status,
      createdAt: updatedTask.createdAt,
      userId: updatedTask.userId || null,
      startDate: updatedTask.startDate || null,
      endDate: updatedTask.endDate || null,
    });
  }

  static async delete(id: string) {
    if (STORAGE_TYPE !== "firebase") {
      const tasks = (await this.getAll()).filter((task) => task.id !== id);
      this.saveAll(tasks);
      return;
    }

    await deleteDoc(doc(db, "tasks", id));
  }
}
