import Image from "next/image"
import { Mail, Phone, MapPin, Globe } from "lucide-react"
import { GithubIcon, LinkedinIcon } from "@/src/components/icons/social"
import type { CVData } from "@/data/cv-data"

export function CVHeader({ cv }: { cv: CVData }) {
  const { personal } = cv

  return (
    <header className="mb-10 print:mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Profile Photo — web only, hidden on print */}
        {personal.photo && (
          <div className="flex-shrink-0 print:hidden">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-slate-200 shadow-sm">
              <Image
                src={personal.photo}
                alt={`${personal.name} — profile photo`}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Name & Title */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {personal.name}
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-blue-600 mt-1">
            {personal.title}
          </p>

          {personal.subtitle && (
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              {personal.subtitle}
            </p>
          )}

          {/* Contact row */}
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-5 gap-y-2 mt-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate-600">
              <MapPin size={14} className="text-slate-400 print:hidden" aria-hidden />
              {personal.location}
            </span>

            {personal.phone && (
              <span className="flex items-center gap-1.5 text-slate-600">
                <Phone size={14} className="text-slate-400 print:hidden" aria-hidden />
                {personal.phone}
              </span>
            )}

            <a
              href={`mailto:${personal.email}`}
              className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-2 hover:decoration-blue-600"
            >
              <Mail size={14} className="text-slate-400 print:hidden" aria-hidden />
              {personal.email}
            </a>

            {personal.linkedin && (
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${personal.name}'s LinkedIn profile`}
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-2 hover:decoration-blue-600"
              >
                <LinkedinIcon size={14} brand={false} className="text-slate-400 print:hidden" />
                LinkedIn
              </a>
            )}

            {personal.github && (
              <a
                href={personal.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${personal.name}'s GitHub profile`}
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-2 hover:decoration-blue-600"
              >
                <GithubIcon size={14} brand={false} className="text-slate-400 print:hidden" />
                GitHub
              </a>
            )}

            {personal.portfolio && (
              <a
                href={personal.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${personal.name}'s portfolio site`}
                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-2 hover:decoration-blue-600"
              >
                <Globe size={14} className="text-slate-400 print:hidden" aria-hidden />
                Portfolio
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
