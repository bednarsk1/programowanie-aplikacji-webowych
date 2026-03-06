import { useEffect, useState } from "react";
import type { Project } from "./models/Project";
import { ProjectService } from "./api/ProjectService";
import { UserService } from "./api/UserService";
import { ActiveProjectService } from "./api/ActiveProjectService";
import { StoryService } from "./api/StoryService";
import type { Story } from "./models/Story";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const currentUser = UserService.getCurrentUser();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(ActiveProjectService.getActiveProject());
  const [stories, setStories] = useState<Story[]>([]);
  const [storyName, setStoryName] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [storyPriority, setStoryPriority] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
  if (!activeProjectId) return;

  const projectStories = StoryService.getByProject(activeProjectId);
  setStories(projectStories);
}, [activeProjectId]);

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

  const handleAddStory = () => {
    if (!activeProjectId) return;

    const newStory: Story = {
      id: crypto.randomUUID(),
      name: storyName,
      description: storyDescription,
      priority: storyPriority,
      projectId: activeProjectId,
      createdAt: new Date().toISOString(),
      status: "todo",
      ownerId: currentUser.id,
    };

    StoryService.create(newStory);
    setStories(StoryService.getByProject(activeProjectId));

    setStoryName("");
    setStoryDescription("");
  };

  const handleDeleteStory = (id: string) => {
    StoryService.delete(id);
    if (activeProjectId) {
      setStories(StoryService.getByProject(activeProjectId));
    }
  };

  const handleChangeStatus = (story: Story, status: "todo" | "doing" | "done") => {
    const updatedStory: Story = {
      ...story,
      status,
    };

    StoryService.update(updatedStory);

    if (activeProjectId) {
      setStories(StoryService.getByProject(activeProjectId));
    }
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

      <h2>Historyjki projektu</h2>

      {activeProjectId ? (
        <>
          <input
            type="text"
            placeholder="Nazwa historyjki"
            value={storyName}
            onChange={(e) => setStoryName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Opis historyjki"
            value={storyDescription}
            onChange={(e) => setStoryDescription(e.target.value)}
          />

          <select
            value={storyPriority}
            onChange={(e) => setStoryPriority(e.target.value as "low" | "medium" | "high")}
          >
            <option value="low">Niski priorytet</option>
            <option value="medium">Średni priorytet</option>
            <option value="high">Wysoki priorytet</option>
          </select>

          <button onClick={handleAddStory}>Dodaj historyjkę</button>

          <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>

            <div>
              <h3>TODO</h3>
              {stories
                .filter((story) => story.status === "todo")
                .map((story) => (
                  <div key={story.id} style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "10px" }}>
                    <h4>{story.name}</h4>
                    <p>{story.description}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>Utworzono: {new Date(story.createdAt).toLocaleDateString()}</p>
                    <p>Status: {story.status}</p>

                    <button onClick={() => handleChangeStatus(story, "doing")}>Start</button>
                    <button onClick={() => handleDeleteStory(story.id)}>Usuń</button>
                  </div>
                ))}
            </div>

            <div>
              <h3>DOING</h3>
              {stories
                .filter((story) => story.status === "doing")
                .map((story) => (
                  <div key={story.id} style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "10px" }}>
                    <h4>{story.name}</h4>
                    <p>{story.description}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>Utworzono: {new Date(story.createdAt).toLocaleDateString()}</p>
                    <p>Status: {story.status}</p>

                    <button onClick={() => handleChangeStatus(story, "done")}>Zakończ</button>
                    <button onClick={() => handleDeleteStory(story.id)}>Usuń</button>
                  </div>
                ))}
            </div>

            <div>
              <h3>DONE</h3>
              {stories
                .filter((story) => story.status === "done")
                .map((story) => (
                  <div key={story.id} style={{ border: "1px solid #ccc", padding: "8px", marginBottom: "10px" }}>
                    <h4>{story.name}</h4>
                    <p>{story.description}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>Utworzono: {new Date(story.createdAt).toLocaleDateString()}</p>
                    <p>Status: {story.status}</p>

                    <button onClick={() => handleChangeStatus(story, "todo")}>Przywróć</button>
                    <button onClick={() => handleDeleteStory(story.id)}>Usuń</button>
                  </div>
                ))}
            </div>

          </div>
        </>
      ) : (
        <p>Wybierz projekt aby zobaczyć historyjki</p>
      )}
    </div>
  );
}

export default App;