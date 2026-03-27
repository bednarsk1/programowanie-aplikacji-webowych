import { useEffect, useState } from "react";
import type { Project } from "./models/Project";
import { ProjectService } from "./api/ProjectService";
import { UserService } from "./api/UserService";
import { ActiveProjectService } from "./api/ActiveProjectService";
import { StoryService } from "./api/StoryService";
import type { Story } from "./models/Story";
import "./App.css";
import { TaskService } from "./api/TaskService";
import type { Task } from "./models/Task";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const currentUser = UserService.getCurrentUser();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    ActiveProjectService.getActiveProject(),
  );
  const [stories, setStories] = useState<Story[]>([]);
  const [storyName, setStoryName] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [storyPriority, setStoryPriority] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const users = UserService.getAll();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [taskEstimatedTime, setTaskEstimatedTime] = useState(1);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!activeProjectId) return;

    const projectStories = StoryService.getByProject(activeProjectId);
    setStories(projectStories);
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeStoryId) return;

    const storyTasks = TaskService.getByStory(activeStoryId);
    setTasks(storyTasks);
  }, [activeStoryId]);

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

  const handleChangeStatus = (
    story: Story,
    status: "todo" | "doing" | "done",
  ) => {
    const updatedStory: Story = {
      ...story,
      status,
    };

    StoryService.update(updatedStory);

    if (activeProjectId) {
      setStories(StoryService.getByProject(activeProjectId));
    }
  };

  const handleAddTask = () => {
    if (!activeStoryId) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName,
      description: taskDescription,
      priority: taskPriority,
      storyId: activeStoryId,
      estimatedTime: taskEstimatedTime,
      status: "todo",
      createdAt: new Date().toISOString(),
    };

    TaskService.create(newTask);
    setTasks(TaskService.getByStory(activeStoryId));

    setTaskName("");
    setTaskDescription("");
  };

  const handleAssignUser = (task: Task) => {
    if (!selectedUserId) return;

    const updatedTask: Task = {
      ...task,
      userId: selectedUserId,
      status: "doing",
      startDate: new Date().toISOString(),
    };

    TaskService.update(updatedTask);

    if (activeStoryId) {
      setTasks(TaskService.getByStory(activeStoryId));
    }

    // update story if needed
    const story = stories.find((s) => s.id === activeStoryId);
    if (story && story.status === "todo") {
      handleChangeStatus(story, "doing");
    }
  };

  const handleFinishTask = (task: Task) => {
    const updatedTask: Task = {
      ...task,
      status: "done",
      endDate: new Date().toISOString(),
    };

    TaskService.update(updatedTask);

    if (activeStoryId) {
      const updatedTasks = TaskService.getByStory(activeStoryId);
      setTasks(updatedTasks);

      // if all tasks done → update story
      const allDone = updatedTasks.every((t) => t.status === "done");
      if (allDone) {
        const story = stories.find((s) => s.id === activeStoryId);
        if (story) {
          handleChangeStatus(story, "done");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white p-6">
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded shadow"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
      <p>
        Zalogowany użytkownik: {currentUser.firstName} {currentUser.lastName} (
        {currentUser.role})
      </p>
      <h1>ManageMe</h1>
      <p>
        Aktywny projekt:{" "}
        {activeProject
          ? `${activeProject.name} (ID: ${activeProject.id})`
          : "brak"}
      </p>

      <h2>Dodaj projekt</h2>

      <input
        type="text"
        placeholder="Nazwa projektu"
        value={name}
        className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Opis projektu"
        value={description}
        className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleAddProject}
      >
        {editingId ? "Zapisz zmiany" : "Dodaj"}
      </button>

      {projects.length === 0 && <p>Brak projektów</p>}

      {projects.map((project) => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleSelectProject(project.id)}
          >
            Wybierz projekt
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleDeleteProject(project.id)}
          >
            Usuń
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleEditProject(project)}
          >
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
            className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
            onChange={(e) => setStoryName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Opis historyjki"
            value={storyDescription}
            className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
            onChange={(e) => setStoryDescription(e.target.value)}
          />

          <select
            value={storyPriority}
            onChange={(e) =>
              setStoryPriority(e.target.value as "low" | "medium" | "high")
            }
          >
            <option value="low">Niski priorytet</option>
            <option value="medium">Średni priorytet</option>
            <option value="high">Wysoki priorytet</option>
          </select>

          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleAddStory}
          >
            Dodaj historyjkę
          </button>

          <div className="flex gap-6">
            <div>
              <h3>TODO</h3>
              {stories
                .filter((story) => story.status === "todo")
                .map((story) => (
                  <div
                    key={story.id}
                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
                  >
                    <h4>{story.name}</h4>
                    <p>{story.description}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>
                      Utworzono:{" "}
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                    <p>Status: {story.status}</p>
                    <p>Właściciel: {story.ownerId}</p>
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setActiveStoryId(story.id)}
                    >
                      Wybierz story
                    </button>

                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleChangeStatus(story, "doing")}
                    >
                      Start
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleDeleteStory(story.id)}
                    >
                      Usuń
                    </button>
                  </div>
                ))}
            </div>

            <div>
              <h3>DOING</h3>
              {stories
                .filter((story) => story.status === "doing")
                .map((story) => (
                  <div
                    key={story.id}
                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
                  >
                    <h4>{story.name}</h4>
                    <p>{story.description}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>
                      Utworzono:{" "}
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                    <p>Status: {story.status}</p>
                    <p>Właściciel: {story.ownerId}</p>
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setActiveStoryId(story.id)}
                    >
                      Wybierz story
                    </button>

                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleChangeStatus(story, "done")}
                    >
                      Zakończ
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleDeleteStory(story.id)}
                    >
                      Usuń
                    </button>
                  </div>
                ))}
            </div>

            <div>
              <h3>DONE</h3>
              {stories
                .filter((story) => story.status === "done")
                .map((story) => (
                  <div
                    key={story.id}
                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
                  >
                    <h4>{story.name}</h4>
                    <p>{story.description}</p>
                    <p>Priorytet: {story.priority}</p>
                    <p>
                      Utworzono:{" "}
                      {new Date(story.createdAt).toLocaleDateString()}
                    </p>
                    <p>Status: {story.status}</p>
                    <p>Właściciel: {story.ownerId}</p>
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setActiveStoryId(story.id)}
                    >
                      Wybierz story
                    </button>

                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleChangeStatus(story, "todo")}
                    >
                      Przywróć
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleDeleteStory(story.id)}
                    >
                      Usuń
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <h2>Zadania</h2>

          {activeStoryId ? (
            <>
              <input
                type="text"
                placeholder="Nazwa zadania"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
              />

              <input
                type="text"
                placeholder="Opis zadania"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
              />

              <select
                value={taskPriority}
                onChange={(e) =>
                  setTaskPriority(e.target.value as "low" | "medium" | "high")
                }
                className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Niski priorytet</option>
                <option value="medium">Średni priorytet</option>
                <option value="high">Wysoki priorytet</option>
              </select>

              <input
                type="number"
                value={taskEstimatedTime}
                onChange={(e) => setTaskEstimatedTime(Number(e.target.value))}
                className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Czas (h)"
              />

              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleAddTask}
              >
                Dodaj zadanie
              </button>

              <div className="flex gap-6">
                <div>
                  <h3>TODO</h3>
                  {tasks
                    .filter((task) => task.status === "todo")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
                      >
                        <h4>{task.name}</h4>
                        <p>{task.description}</p>
                        <p>Priorytet: {task.priority}</p>
                        <p>Czas: {task.estimatedTime}h</p>
                        <p>Status: {task.status}</p>
                        <p>Przypisany: {task.userId ?? "brak"}</p>

                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="border p-2 rounded bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Wybierz użytkownika</option>
                          {users
                            .filter(
                              (u) =>
                                u.role === "developer" || u.role === "devops",
                            )
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.firstName} ({u.role})
                              </option>
                            ))}
                        </select>

                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => handleAssignUser(task)}
                        >
                          Przypisz
                        </button>
                      </div>
                    ))}
                </div>

                <div>
                  <h3>DOING</h3>
                  {tasks
                    .filter((task) => task.status === "doing")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
                      >
                        <h4>{task.name}</h4>
                        <p>{task.description}</p>
                        <p>Priorytet: {task.priority}</p>
                        <p>Czas: {task.estimatedTime}h</p>
                        <p>Status: {task.status}</p>
                        <p>Przypisany: {task.userId ?? "brak"}</p>

                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => handleFinishTask(task)}
                        >
                          Zakończ
                        </button>
                      </div>
                    ))}
                </div>

                <div>
                  <h3>DONE</h3>
                  {tasks
                    .filter((task) => task.status === "done")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow"
                      >
                        <h4>{task.name}</h4>
                        <p>{task.description}</p>
                        <p>Priorytet: {task.priority}</p>
                        <p>Czas: {task.estimatedTime}h</p>
                        <p>Status: {task.status}</p>
                        <p>Przypisany: {task.userId ?? "brak"}</p>
                      </div>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <p>Wybierz story aby zobaczyć zadania</p>
          )}
        </>
      ) : (
        <p>Wybierz projekt aby zobaczyć historyjki</p>
      )}
    </div>
  );
}

export default App;
