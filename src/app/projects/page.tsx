import projects from '../../data/projects.json';
import Image from 'next/image';

interface Project {
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  demo?: string;
  code?: string;
}

export default function Projects() {
  return (
    <div className="projects-container">
      <h1>Projects</h1>
      
      <div className="projects-grid">
        {projects.map((project: Project, index: number) => (
          <div key={index} className="project-card">
            {project.image && (
              <div className="project-image">
                <Image 
                  src={`/images/projects/${project.image}`} 
                  alt={project.title}
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <div className="project-content">
              <h2>{project.title}</h2>
              <p className="project-description">{project.description}</p>
              <div className="project-tech">
                {project.technologies.map((tech: string, i: number) => (
                  <span key={i} className="tech-tag">{tech}</span>
                ))}
              </div>
              <div className="project-links">
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    Live Demo
                  </a>
                )}
                {project.code && (
                  <a href={project.code} target="_blank" rel="noopener noreferrer">
                    Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}