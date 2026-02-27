import type { Project } from "../models/Project";

const STORAGE_KEY = "manageme_projects";

export class ProjectService {
  static getAll(): Project[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveAll(projects: Project[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  static create(project: Project) {
    const projects = this.getAll();
    projects.push(project);
    this.saveAll(projects);
  }

  static update(updatedProject: Project) {
    const projects = this.getAll().map((project) =>
      project.id === updatedProject.id ? updatedProject : project
    );
    this.saveAll(projects);
  }

  static delete(id: string) {
    const projects = this.getAll().filter(
      (project) => project.id !== id
    );
    this.saveAll(projects);
  }
}