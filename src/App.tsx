import { useEffect, useState } from "react";
import type { Project } from "./models/Project";
import { ProjectService } from "./api/ProjectService";
import { UserService } from "./api/UserService";
import { ActiveProjectService } from "./api/ActiveProjectService";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const currentUser = UserService.getCurrentUser();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(ActiveProjectService.getActiveProject());

  useEffect(() => {
    const storedProjects = ProjectService.getAll();
    setProjects(storedProjects);
  }, []);

  const handleAddProject = () => {
    if (!name.trim() || !description.trim()) return;

    if (editingId) {
      const updatedProject: Project = {
        id: editingId,
        name,
        description,
      };

      ProjectService.update(updatedProject);
      setEditingId(null);
    } else {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        description,
      };

      ProjectService.create(newProject);
    }

    setProjects(ProjectService.getAll());
    setName("");
    setDescription("");
  };

  const handleDeleteProject = (id: string) => {
    ProjectService.delete(id);
    setProjects(ProjectService.getAll());
  };

  const handleEditProject = (project: Project) => {
    setName(project.name);
    setDescription(project.description);
    setEditingId(project.id);
  };

  const handleSelectProject = (id: string) => {
    ActiveProjectService.setActiveProject(id);
    setActiveProjectId(id);
  };

  return (
    <div>
      <p>
        Zalogowany użytkownik: {currentUser.firstName} {currentUser.lastName}
      </p>
      <h1>ManageMe</h1>
      <p>Aktywny projekt: {activeProjectId ?? "brak"}</p>

      <h2>Dodaj projekt</h2>

      <input
        type="text"
        placeholder="Nazwa projektu"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Opis projektu"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button onClick={handleAddProject}>
        {editingId ? "Zapisz zmiany" : "Dodaj"}
      </button>

      {projects.length === 0 && <p>Brak projektów</p>}

      {projects.map((project) => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <button onClick={() => handleSelectProject(project.id)}>
            Wybierz projekt
          </button>
          <button onClick={() => handleDeleteProject(project.id)}>
            Usuń
          </button>
          <button onClick={() => handleEditProject(project)}>
            Edytuj
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;