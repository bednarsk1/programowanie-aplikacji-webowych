import type { Story } from "../models/Story";
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

const STORAGE_KEY = "manageme_stories";

export class StoryService {
  static async getAll(): Promise<Story[]> {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    const snapshot = await getDocs(collection(db, "stories"));
    return snapshot.docs.map((docItem) => ({
      ...(docItem.data() as Story),
      id: docItem.id,
    }));
  }

  static saveAll(stories: Story[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }

  static async getByProject(projectId: string): Promise<Story[]> {
    return (await this.getAll()).filter(
      (story) => story.projectId === projectId,
    );
  }

  static async create(story: Story) {
    if (STORAGE_TYPE !== "firebase") {
      const stories = await this.getAll();
      stories.push(story);
      this.saveAll(stories);
      return;
    }

    await addDoc(collection(db, "stories"), {
      name: story.name,
      description: story.description,
      priority: story.priority,
      projectId: story.projectId,
      createdAt: story.createdAt,
      status: story.status,
      ownerId: story.ownerId,
    });
  }

  static async update(updatedStory: Story) {
    if (STORAGE_TYPE !== "firebase") {
      const stories = (await this.getAll()).map((story) =>
        story.id === updatedStory.id ? updatedStory : story,
      );

      this.saveAll(stories);
      return;
    }

    await updateDoc(doc(db, "stories", updatedStory.id), {
      name: updatedStory.name,
      description: updatedStory.description,
      priority: updatedStory.priority,
      projectId: updatedStory.projectId,
      createdAt: updatedStory.createdAt,
      status: updatedStory.status,
      ownerId: updatedStory.ownerId,
    });
  }

  static async delete(id: string) {
    if (STORAGE_TYPE !== "firebase") {
      const stories = (await this.getAll()).filter((story) => story.id !== id);
      this.saveAll(stories);
      return;
    }

    await deleteDoc(doc(db, "stories", id));
  }
}
