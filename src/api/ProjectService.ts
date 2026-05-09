import type { Project } from "../models/Project";
import { STORAGE_TYPE } from "../config/storage";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";

const STORAGE_KEY = "manageme_projects";

export class ProjectService {
  static async getAll(): Promise<Project[]> {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    const snapshot = await getDocs(collection(db, "projects"));

    return snapshot.docs.map((docItem) => ({
      ...(docItem.data() as Project),
      id: docItem.id,
    }));
  }

  static saveAll(projects: Project[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  static async create(project: Project) {
    if (STORAGE_TYPE !== "firebase") {
      const projects = await this.getAll();
      projects.push(project);
      this.saveAll(projects);
      return;
    }

    await addDoc(collection(db, "projects"), {
      name: project.name,
      description: project.description,
    });
  }

  static async update(updatedProject: Project) {
    if (STORAGE_TYPE !== "firebase") {
      const projects = (await this.getAll()).map((project) =>
        project.id === updatedProject.id ? updatedProject : project,
      );
      this.saveAll(projects);
      return;
    }

    await updateDoc(doc(db, "projects", updatedProject.id), {
      name: updatedProject.name,
      description: updatedProject.description,
    });
  }

  static async delete(id: string) {
    if (STORAGE_TYPE !== "firebase") {
      const projects = (await this.getAll()).filter(
        (project) => project.id !== id,
      );
      this.saveAll(projects);
      return;
    }

    await deleteDoc(doc(db, "projects", id));
  }
}
