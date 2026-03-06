const STORAGE_KEY = "active_project";

export class ActiveProjectService {
  static setActiveProject(projectId: string) {
    localStorage.setItem(STORAGE_KEY, projectId);
  }

  static getActiveProject(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  static clearActiveProject() {
    localStorage.removeItem(STORAGE_KEY);
  }
}