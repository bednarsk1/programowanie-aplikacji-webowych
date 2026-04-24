import type { Project } from "../models/Project";
import { STORAGE_TYPE } from "../config/storage";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const STORAGE_KEY = "manageme_projects";

export class ProjectService {
  static getAll(): Project[] {
    if (STORAGE_TYPE !== "firebase") {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    return [];
  }

  static saveAll(projects: Project[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  static create(project: Project) {
    if (STORAGE_TYPE !== "firebase") {
      const projects = this.getAll();
      projects.push(project);
      this.saveAll(projects);
      return;
    }

    addDoc(collection(db, "projects"), { ...project });
  }

  static update(updatedProject: Project) {
    if (STORAGE_TYPE !== "firebase") {
      const projects = this.getAll().map((project) =>
        project.id === updatedProject.id ? updatedProject : project,
      );
      this.saveAll(projects);
      return;
    }

    updateDoc(doc(db, "projects", updatedProject.id), { ...updatedProject });
  }

  static delete(id: string) {
    if (STORAGE_TYPE !== "firebase") {
      const projects = this.getAll().filter((project) => project.id !== id);
      this.saveAll(projects);
      return;
    }

    deleteDoc(doc(db, "projects", id));
  }
}
