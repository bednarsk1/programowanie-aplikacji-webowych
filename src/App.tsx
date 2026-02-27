import { useEffect, useState } from "react";
import type { Project } from "./models/Project";
import { ProjectService } from "./api/ProjectService";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const storedProjects = ProjectService.getAll();
    setProjects(storedProjects);
  }, []);

  return (
    <div>
      <h1>ManageMe</h1>

      {projects.length === 0 && <p>Brak projektów</p>}

      {projects.map((project) => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
}

export default App;