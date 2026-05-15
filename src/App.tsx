import { useEffect, useState } from "react";
import type { Project } from "./models/Project";
import { ProjectService } from "./api/ProjectService";
import { UserService } from "./api/UserService";
import { ActiveProjectService } from "./api/ActiveProjectService";
import { StoryService } from "./api/StoryService";
import type { Story } from "./models/Story";
import { TaskService } from "./api/TaskService";
import type { Task } from "./models/Task";
import { NotificationService } from "./api/NotificationService";
import type { Notification } from "./models/Notification";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(
    UserService.getCurrentUser(),
  );
  const [showNotifications, setShowNotifications] = useState(false);
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
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<Notification | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [taskEstimatedTime, setTaskEstimatedTime] = useState(1);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);

  const loadProjects = async () => {
    const data = await ProjectService.getAll();
    setProjects(data);
  };

  const loadStories = async (projectId: string) => {
    const data = await StoryService.getByProject(projectId);
    setStories(data);
  };

  const loadTasks = async (storyId: string) => {
    const data = await TaskService.getByStory(storyId);
    setTasks(data);
  };

  const loadUsers = async () => {
    const data = await UserService.getAll();
    setUsers(data);
  };

  useEffect(() => {
    if (!currentUser) return;

    const userNotifications = NotificationService.getForUser(currentUser!.id);
    setNotifications(userNotifications);
  }, [currentUser]);

  useEffect(() => {
    const unread = notifications.find(
      (n) => !n.isRead && (n.priority === "medium" || n.priority === "high"),
    );

    if (unread) {
      setToast(unread);

      setTimeout(() => {
        setToast(null);
      }, 4000);
    }
  }, [notifications]);

  useEffect(() => {
    if (!activeProjectId) return;

    loadStories(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (!activeStoryId) return;

    loadTasks(activeStoryId);
  }, [activeStoryId]);

  useEffect(() => {
    if (currentUser) {
      loadProjects();
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const storedUser = UserService.getCurrentUser();

    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  const handleAddProject = async () => {
    if (!name.trim() || !description.trim()) return;

    try {
      if (editingId) {
        const updatedProject: Project = {
          id: editingId,
          name,
          description,
        };
        await ProjectService.update(updatedProject);

        const updatedProjects = await ProjectService.getAll();

        setProjects([...updatedProjects]);

        setTimeout(async () => {
          const refreshedProjects = await ProjectService.getAll();
          setProjects([...refreshedProjects]);
        }, 300);

        setEditingId(null);
        setName("");
        setDescription("");
        return;
      } else {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name,
          description,
        };
        await ProjectService.create(newProject);
      }

      const updatedProjects = await ProjectService.getAll();
      setProjects([...updatedProjects]);

      setTimeout(async () => {
        const refreshedProjects = await ProjectService.getAll();
        setProjects([...refreshedProjects]);
      }, 300);

      setName("");
      setDescription("");

      NotificationService.create({
        id: crypto.randomUUID(),
        title: "Nowy projekt",
        message: "Utworzono nowy projekt",
        date: new Date().toISOString(),
        priority: "high",
        isRead: false,
        recipientId: currentUser!.id,
      });
      setNotifications(NotificationService.getForUser(currentUser!.id));
    } catch (error) {
      console.error("Błąd podczas zapisywania/edycji:", error);
      alert("Operacja się nie powiodła!");
      const updatedProjects = await ProjectService.getAll();
      setProjects([...updatedProjects]);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await ProjectService.delete(id);

      const updatedProjects = await ProjectService.getAll();

      setProjects([...updatedProjects]);

      setTimeout(async () => {
        const refreshedProjects = await ProjectService.getAll();
        setProjects([...refreshedProjects]);
      }, 300);

      if (activeProjectId === id) {
        setActiveProjectId(null);
        setStories([]);
        setTasks([]);
      }
    } catch (error) {
      console.error("Błąd usuwania projektu:", error);
      alert("Nie udało się usunąć. Prawdopodobnie brak uprawnień Firestore.");

      const updatedProjects = await ProjectService.getAll();
      setProjects([...updatedProjects]);
    }
  };

  const handleEditProject = (project: Project) => {
    setName(project.name);
    setDescription(project.description);
    setEditingId(project.id);
  };

  const handleSelectProject = async (id: string) => {
    ActiveProjectService.setActiveProject(id);

    setActiveProjectId(id);

    const updatedStories = await StoryService.getByProject(id);

    setStories([...updatedStories]);

    setTimeout(async () => {
      const refreshedStories = await StoryService.getByProject(id);
      setStories([...refreshedStories]);
    }, 300);
  };

  const handleAddStory = async () => {
    if (!activeProjectId) return;

    const newStory: Story = {
      id: crypto.randomUUID(),
      name: storyName,
      description: storyDescription,
      priority: storyPriority,
      projectId: activeProjectId,
      createdAt: new Date().toISOString(),
      status: "todo",
      ownerId: currentUser!.id,
    };

    await StoryService.create(newStory);
    const updatedStories = await StoryService.getByProject(activeProjectId);

    setStories([...updatedStories]);

    setTimeout(async () => {
      const refreshedStories = await StoryService.getByProject(activeProjectId);

      setStories([...refreshedStories]);
    }, 300);

    setStoryName("");
    setStoryDescription("");
  };

  const handleDeleteStory = async (id: string) => {
    await StoryService.delete(id);
    if (activeProjectId) {
      const updatedStories = await StoryService.getByProject(activeProjectId);

      setStories([...updatedStories]);
      if (activeStoryId === id) {
        setActiveStoryId(null);
        setTasks([]);
      }
    }
  };

  const handleChangeStatus = async (
    story: Story,
    status: "todo" | "doing" | "done",
  ) => {
    const updatedStory: Story = {
      ...story,
      status,
    };

    await StoryService.update(updatedStory);

    if (activeProjectId) {
      const updatedStories = await StoryService.getByProject(activeProjectId);

      setStories([...updatedStories]);
    }
  };

  const handleAddTask = async () => {
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

    await TaskService.create(newTask);
    const updatedTasks = await TaskService.getByStory(activeStoryId);

    setTasks([...updatedTasks]);
    const story = stories.find((s) => s.id === activeStoryId);
    if (story) {
      NotificationService.create({
        id: crypto.randomUUID(),
        title: "Nowe zadanie",
        message: `Dodano zadanie do historyjki: ${story.name}`,
        date: new Date().toISOString(),
        priority: "medium",
        isRead: false,
        recipientId: story.ownerId,
      });
      setNotifications(NotificationService.getForUser(currentUser!.id));
    }

    setTaskName("");
    setTaskDescription("");
  };

  const handleAssignUser = async (task: Task) => {
    if (!selectedUserId) return;

    const updatedTask: Task = {
      ...task,
      userId: selectedUserId,
      status: "doing",
      startDate: new Date().toISOString(),
    };

    await TaskService.update(updatedTask);

    NotificationService.create({
      id: crypto.randomUUID(),
      title: "Przypisano zadanie",
      message: `Zadanie ${task.name} zostało przypisane`,
      date: new Date().toISOString(),
      priority: "high",
      isRead: false,
      recipientId: selectedUserId,
    });

    const story = stories.find((s) => s.id === activeStoryId);
    if (story) {
      NotificationService.create({
        id: crypto.randomUUID(),
        title: "Zadanie w trakcie",
        message: `Zadanie ${task.name} ma status DOING`,
        date: new Date().toISOString(),
        priority: "low",
        isRead: false,
        recipientId: story.ownerId,
      });
    }

    setNotifications(NotificationService.getForUser(currentUser!.id));

    if (activeStoryId) {
      const updatedTasks = await TaskService.getByStory(activeStoryId);

      setTasks([...updatedTasks]);
    }

    if (story && story.status === "todo") {
      await handleChangeStatus(story, "doing");
    }
  };

  const handleFinishTask = async (task: Task) => {
    const updatedTask: Task = {
      ...task,
      status: "done",
      endDate: new Date().toISOString(),
    };

    await TaskService.update(updatedTask);

    NotificationService.create({
      id: crypto.randomUUID(),
      title: "Zadanie zakończone",
      message: `Zadanie ${task.name} zostało zakończone`,
      date: new Date().toISOString(),
      priority: "medium",
      isRead: false,
      recipientId: currentUser!.id,
    });
    setNotifications(NotificationService.getForUser(currentUser!.id));

    if (activeStoryId) {
      const updatedTasks = await TaskService.getByStory(activeStoryId);

      setTasks([...updatedTasks]);

      const allDone = updatedTasks.every((t) => t.status === "done");

      if (allDone) {
        const story = stories.find((s) => s.id === activeStoryId);

        if (story) {
          await handleChangeStatus(story, "done");
        }
      }
    }
  };
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 border rounded shadow w-80">
          <h2 className="text-xl mb-4">Logowanie</h2>
          <button
            className="w-full bg-blue-500 text-white p-2 rounded"
            onClick={async () => {
              try {
                const result = await signInWithPopup(auth, provider);

                const userEmail = result.user.email;

                if (!userEmail) return;

                const existingUsers = await UserService.getAll();
                const existing = existingUsers.find(
                  (u) => u.email === userEmail,
                );

                const loggedUser = UserService.login(userEmail);
                setCurrentUser(loggedUser || UserService.getCurrentUser());

                if (!existing) {
                  const allUsers = await UserService.getAll();

                  const admins = allUsers.filter((u) => u.role === "admin");

                  admins.forEach((admin) => {
                    NotificationService.create({
                      id: crypto.randomUUID(),
                      title: "Nowy użytkownik",
                      message: `Nowe konto: ${userEmail}`,
                      date: new Date().toISOString(),
                      priority: "high",
                      isRead: false,
                      recipientId: admin.id,
                    });
                  });
                }
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Kontynuuj z Google
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role === "guest") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 border rounded shadow flex flex-col gap-4">
          <h2 className="text-xl mb-2">Oczekiwanie na zatwierdzenie</h2>

          <p>Twoje konto oczekuje na zatwierdzenie przez administratora</p>

          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={async () => {
              try {
                await signOut(auth);
                localStorage.removeItem("manageme_current_user");
                setCurrentUser(null);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Wyloguj
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 border rounded shadow">
          <h2 className="text-xl mb-4">Konto zablokowane</h2>
          <p>Nie masz dostępu do aplikacji</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black text-black dark:text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-end gap-2 mb-4">
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded shadow"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            className="px-4 py-2 bg-red-500 text-white rounded shadow"
            onClick={async () => {
              try {
                await signOut(auth);

                localStorage.removeItem("manageme_current_user");

                setCurrentUser(null);
              } catch (error) {
                console.error(error);
              }
            }}
          >
            Wyloguj
          </button>
        </div>
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div>
            Zalogowany użytkownik: {currentUser!.email} ({currentUser!.role}) (
            {currentUser!.role})
          </div>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
          >
            🔔
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </button>
        </div>

        {showNotifications && (
          <div className="bg-white dark:bg-gray-800 border p-4 rounded shadow mb-4">
            <h3 className="font-bold mb-2">Powiadomienia</h3>

            {notifications.filter((n) => !n.isRead).length === 0 && (
              <p>Brak powiadomień</p>
            )}

            {notifications
              .filter((n) => !n.isRead)
              .map((n) => (
                <div
                  key={n.id}
                  className="p-2 border-b font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setSelectedNotification(n);
                    NotificationService.markAsRead(n.id);
                    setNotifications(
                      NotificationService.getForUser(currentUser!.id),
                    );
                  }}
                >
                  <p>{n.title}</p>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs">{new Date(n.date).toLocaleString()}</p>

                  {!n.isRead && (
                    <button
                      className="text-blue-500 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        NotificationService.markAsRead(n.id);
                        setNotifications(
                          NotificationService.getForUser(currentUser!.id),
                        );
                      }}
                    >
                      Oznacz jako przeczytane
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border shadow-lg p-4 rounded w-80 z-50">
            <h4 className="font-bold">{toast.title}</h4>
            <p className="text-sm">{toast.message}</p>

            <button
              className="text-blue-500 text-sm mt-2"
              onClick={() => {
                NotificationService.markAsRead(toast.id);
                setNotifications(
                  NotificationService.getForUser(currentUser!.id),
                );
                setToast(null);
              }}
            >
              OK
            </button>
          </div>
        )}

        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow w-96">
              <h3 className="text-lg font-bold mb-2">
                {selectedNotification.title}
              </h3>

              <p className="mb-2">{selectedNotification.message}</p>

              <p className="text-sm text-gray-500 mb-4">
                {new Date(selectedNotification.date).toLocaleString()}
              </p>

              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => setSelectedNotification(null)}
              >
                Zamknij
              </button>
            </div>
          </div>
        )}
        <h1 className="text-5xl font-extrabold mb-8 tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          ManageMe
        </h1>

        {currentUser.role === "admin" && (
          <div className="mb-6 p-4 border rounded bg-white dark:bg-gray-800 shadow">
            <h2 className="text-2xl font-bold mb-4">Użytkownicy</h2>

            {users.map((u) => (
              <div
                key={u.id}
                className="border rounded p-4 mb-3 flex flex-col gap-3 bg-gray-100 dark:bg-gray-700"
              >
                <div>
                  <p className="font-semibold text-lg">{u.email}</p>
                  <p>Rola: {u.role}</p>
                  <p>Status: {u.isBlocked ? "Zablokowany" : "Aktywny"}</p>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <select
                    value={u.role}
                    onChange={async (e) => {
                      await UserService.update({
                        ...u,
                        role: e.target.value as any,
                      });

                      await loadUsers();
                    }}
                    className="border p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
                  >
                    <option value="admin">admin</option>
                    <option value="developer">developer</option>
                    <option value="devops">devops</option>
                    <option value="guest">guest</option>
                  </select>

                  <button
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={async () => {
                      await UserService.update({
                        ...u,

                        isBlocked: !u.isBlocked,
                      });

                      await loadUsers();
                    }}
                  >
                    {u.isBlocked ? "Odblokuj" : "Zablokuj"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700">
          <p className="text-lg font-semibold">
            Aktywny projekt:{" "}
            {activeProject
              ? `${activeProject.name} (ID: ${activeProject.id})`
              : "brak"}
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-4">Dodaj projekt</h2>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder="Nazwa projektu"
              value={name}
              className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Opis projektu"
              value={description}
              className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setDescription(e.target.value)}
            />
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
              onClick={handleAddProject}
            >
              {editingId ? "Zapisz zmiany" : "Dodaj"}
            </button>
          </div>
        </div>

        {projects.length === 0 && <p>Brak projektów</p>}

        {projects.map((project) => (
          <div key={project.id}>
            <h3 className="text-xl font-bold mb-4">{project.name}</h3>
            <p>{project.description}</p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
              onClick={() => handleSelectProject(project.id)}
            >
              Wybierz projekt
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
              onClick={() => handleDeleteProject(project.id)}
            >
              Usuń
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
              onClick={() => handleEditProject(project)}
            >
              Edytuj
            </button>
          </div>
        ))}

        <h2 className="text-3xl font-bold mt-10 mb-6">Historyjki projektu</h2>

        {activeProjectId ? (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <input
                  type="text"
                  placeholder="Nazwa historyjki"
                  value={storyName}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setStoryName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Opis historyjki"
                  value={storyDescription}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setStoryDescription(e.target.value)}
                />
                <select
                  value={storyPriority}
                  onChange={(e) =>
                    setStoryPriority(
                      e.target.value as "low" | "medium" | "high",
                    )
                  }
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Niski priorytet</option>
                  <option value="medium">Średni priorytet</option>
                  <option value="high">Wysoki priorytet</option>
                </select>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                  onClick={handleAddStory}
                >
                  Dodaj historyjkę
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <h3 className="text-xl font-bold mb-4">TODO</h3>
                {stories
                  .filter((story) => story.status === "todo")
                  .map((story) => (
                    <div
                      key={story.id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-[1.01] transition"
                    >
                      <h4 className="text-lg font-bold mb-2">{story.name}</h4>
                      <p>{story.description}</p>
                      <p>Priorytet: {story.priority}</p>
                      <p>
                        Utworzono:{" "}
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                      <p>Status: {story.status}</p>
                      <p>Właściciel: {story.ownerId}</p>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => setActiveStoryId(story.id)}
                      >
                        Wybierz story
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => handleChangeStatus(story, "doing")}
                      >
                        Start
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => handleDeleteStory(story.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  ))}
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">DOING</h3>
                {stories
                  .filter((story) => story.status === "doing")
                  .map((story) => (
                    <div
                      key={story.id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-[1.01] transition"
                    >
                      <h4 className="text-lg font-bold mb-2">{story.name}</h4>
                      <p>{story.description}</p>
                      <p>Priorytet: {story.priority}</p>
                      <p>
                        Utworzono:{" "}
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                      <p>Status: {story.status}</p>
                      <p>Właściciell: {story.ownerId}</p>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => setActiveStoryId(story.id)}
                      >
                        Wybierz story
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => handleChangeStatus(story, "done")}
                      >
                        Zakończ
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => handleDeleteStory(story.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  ))}
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">DONE</h3>
                {stories
                  .filter((story) => story.status === "done")
                  .map((story) => (
                    <div
                      key={story.id}
                      className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-[1.01] transition"
                    >
                      <h4 className="text-lg font-bold mb-2">{story.name}</h4>
                      <p>{story.description}</p>
                      <p>Priorytet: {story.priority}</p>
                      <p>
                        Utworzono:{" "}
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                      <p>Status: {story.status}</p>
                      <p>Właściciel: {story.ownerId}</p>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => setActiveStoryId(story.id)}
                      >
                        Wybierz story
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => handleChangeStatus(story, "todo")}
                      >
                        Przywróć
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                        onClick={() => handleDeleteStory(story.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <h2 className="text-3xl font-bold mt-10 mb-6">Zadania</h2>

            {activeStoryId ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                  <div className="flex flex-col md:flex-row gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Nazwa zadania"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Opis zadania"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={taskPriority}
                      onChange={(e) =>
                        setTaskPriority(
                          e.target.value as "low" | "medium" | "high",
                        )
                      }
                      className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Niski priorytet</option>
                      <option value="medium">Średni priorytet</option>
                      <option value="high">Wysoki priorytet</option>
                    </select>
                    <input
                      type="number"
                      value={taskEstimatedTime}
                      onChange={(e) =>
                        setTaskEstimatedTime(Number(e.target.value))
                      }
                      className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Czas (h)"
                    />
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                      onClick={handleAddTask}
                    >
                      Dodaj zadanie
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">TODO</h3>
                    {tasks
                      .filter((task) => task.status === "todo")
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-[1.01] transition"
                        >
                          <h4 className="text-lg font-bold mb-2">
                            {task.name}
                          </h4>
                          <p>{task.description}</p>
                          <p>Priorytet: {task.priority}</p>
                          <p>Czas: {task.estimatedTime}h</p>
                          <p>Status: {task.status}</p>
                          <p>Przypisany: {task.userId ?? "brak"}</p>

                          <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 p-3 rounded-xl bg-white dark:bg-gray-700 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Wybierz użytkownika</option>
                            {users
                              .filter(
                                (u) =>
                                  u.role === "developer" || u.role === "devops",
                              )
                              .map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.email} ({u.role})
                                </option>
                              ))}
                          </select>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                            onClick={() => handleAssignUser(task)}
                          >
                            Przypisz
                          </button>
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-md ml-2"
                            onClick={async () => {
                              await TaskService.delete(task.id);
                              if (activeStoryId) {
                                const updatedTasks =
                                  await TaskService.getByStory(activeStoryId);

                                setTasks([...updatedTasks]);
                              }
                              const story = stories.find(
                                (s) => s.id === activeStoryId,
                              );
                              if (story) {
                                NotificationService.create({
                                  id: crypto.randomUUID(),
                                  title: "Usunięto zadanie",
                                  message: `Zadanie ${task.name} zostało usunięte`,
                                  date: new Date().toISOString(),
                                  priority: "medium",
                                  isRead: false,
                                  recipientId: story.ownerId,
                                });
                                setNotifications(
                                  NotificationService.getForUser(
                                    currentUser.id,
                                  ),
                                );
                              }
                            }}
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">DOING</h3>
                    {tasks
                      .filter((task) => task.status === "doing")
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-[1.01] transition"
                        >
                          <h4 className="text-lg font-bold mb-2">
                            {task.name}
                          </h4>
                          <p>{task.description}</p>
                          <p>Priorytet: {task.priority}</p>
                          <p>Czas: {task.estimatedTime}h</p>
                          <p>Status: {task.status}</p>
                          <p>Przypisany: {task.userId ?? "brak"}</p>

                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md"
                            onClick={() => handleFinishTask(task)}
                          >
                            Zakończ
                          </button>
                        </div>
                      ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">DONE</h3>
                    {tasks
                      .filter((task) => task.status === "done")
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-[1.01] transition"
                        >
                          <h4 className="text-lg font-bold mb-2">
                            {task.name}
                          </h4>
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
    </div>
  );
}

export default App;
