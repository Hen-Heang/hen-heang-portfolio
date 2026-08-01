import { ExternalLink, FileText, Rocket } from "lucide-react"
import { GithubIcon } from "@/src/components/icons/social"
import { CVSection } from "./CVSection"
import type { CVData } from "@/data/cv-data"

export function CVProjects({ cv }: { cv: CVData }) {
  return (
    <CVSection title="Selected Projects" icon={Rocket}>
      <div className="space-y-5">
        {cv.projects.map((project) => (
          <div
            key={project.name}
            className="print:break-inside-avoid p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all print:p-0 print:border-0 print:hover:shadow-none"
          >
            <div className="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1 mb-1.5">
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-slate-900 text-[15px] hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                {project.category && (
                  <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wide">
                    {project.category}
                  </span>
                )}
              </div>

              <div className="flex gap-3 print:hidden">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} source code on GitHub`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <GithubIcon size={12} brand={false} /> Code
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} live demo`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    <ExternalLink size={12} aria-hidden /> Live
                  </a>
                )}
                {project.caseStudy && (
                  <a
                    href={project.caseStudy}
                    aria-label={`${project.name} case study`}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <FileText size={12} aria-hidden /> Case Study
                  </a>
                )}
              </div>
            </div>

            <p className="text-[13px] text-slate-600 leading-relaxed mb-2">{project.description}</p>

            {project.bullets && project.bullets.length > 0 && (
              <ul className="space-y-1 mb-2.5">
                {project.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-[13px] text-slate-600 leading-relaxed">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-300 print:hidden" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-[10.5px] font-medium rounded bg-slate-50 text-slate-500 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CVSection>
  )
}
