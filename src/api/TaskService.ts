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
  static getAll(): Task[] {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    const tasks: Task[] = [];

    getDocs(collection(db, "tasks")).then((snapshot) => {
      snapshot.forEach((docItem) => {
        tasks.push(docItem.data() as Task);
      });
    });

    return tasks;
  }

  static saveAll(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  static getByStory(storyId: string): Task[] {
    return this.getAll().filter((task) => task.storyId === storyId);
  }

  static create(task: Task) {
    if (STORAGE_TYPE !== "firebase") {
      const tasks = this.getAll();
      tasks.push(task);
      this.saveAll(tasks);
      return;
    }

    addDoc(collection(db, "tasks"), { ...task });
  }

  static update(updatedTask: Task) {
    if (STORAGE_TYPE !== "firebase") {
      const tasks = this.getAll().map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      this.saveAll(tasks);
      return;
    }

    updateDoc(doc(db, "tasks", updatedTask.id), {
      ...updatedTask,
    });
  }

  static delete(id: string) {
    if (STORAGE_TYPE !== "firebase") {
      const tasks = this.getAll().filter((task) => task.id !== id);
      this.saveAll(tasks);
      return;
    }

    deleteDoc(doc(db, "tasks", id));
  }
}
