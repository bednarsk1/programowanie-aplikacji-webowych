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
  static getAll(): Story[] {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    const stories: Story[] = [];

    getDocs(collection(db, "stories")).then((snapshot) => {
      snapshot.forEach((docItem) => {
        stories.push(docItem.data() as Story);
      });
    });

    return stories;
  }

  static saveAll(stories: Story[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }

  static getByProject(projectId: string): Story[] {
    return this.getAll().filter((story) => story.projectId === projectId);
  }

  static create(story: Story) {
    if (STORAGE_TYPE !== "firebase") {
      const stories = this.getAll();
      stories.push(story);
      this.saveAll(stories);
      return;
    }

    addDoc(collection(db, "stories"), { ...story });
  }

  static update(updatedStory: Story) {
    if (STORAGE_TYPE !== "firebase") {
      const stories = this.getAll().map((story) =>
        story.id === updatedStory.id ? updatedStory : story,
      );

      this.saveAll(stories);
      return;
    }

    updateDoc(doc(db, "stories", updatedStory.id), {
      ...updatedStory,
    });
  }

  static delete(id: string) {
    if (STORAGE_TYPE !== "firebase") {
      const stories = this.getAll().filter((story) => story.id !== id);
      this.saveAll(stories);
      return;
    }

    deleteDoc(doc(db, "stories", id));
  }
}
