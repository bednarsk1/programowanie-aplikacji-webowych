import type { Task } from "../models/Task";

const STORAGE_KEY = "manageme_tasks";

export class TaskService {
  static getAll(): Task[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveAll(tasks: Task[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  static getByStory(storyId: string): Task[] {
    return this.getAll().filter((task) => task.storyId === storyId);
  }

  static create(task: Task) {
    const tasks = this.getAll();
    tasks.push(task);
    this.saveAll(tasks);
  }

  static update(updatedTask: Task) {
    const tasks = this.getAll().map((task) =>
      task.id === updatedTask.id ? updatedTask : task,
    );
    this.saveAll(tasks);
  }

  static delete(id: string) {
    const tasks = this.getAll().filter((task) => task.id !== id);
    this.saveAll(tasks);
  }
}
