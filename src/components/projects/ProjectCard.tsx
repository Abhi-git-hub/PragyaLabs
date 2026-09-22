import Link from "next/link";
import type { Project } from "@/data/projects";

/**
 * Editorial project row — number, name, category, statement, technology.
 * Hairlines + index numbers, no cards-as-glass.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="VIEW"
      className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-t border-line py-6 transition-colors last:border-b hover:bg-graphite md:gap-8 md:py-8"
      aria-label={`${project.title} — ${project.category}`}
    >
      <span className="meta text-faint">{project.number}</span>
      <span>
        <span className="block font-display text-2xl uppercase leading-none transition-transform duration-300 group-hover:translate-x-2 md:text-4xl">
          {project.title}
        </span>
        <span className="meta mt-2 block">
          {project.category} — {project.year}
        </span>
        <span className="mt-2 block max-w-[62ch] text-sm leading-relaxed text-muted">
          {project.summary}
        </span>
        <span className="meta mt-2 block text-faint">
          {project.technologies.slice(0, 4).join(" / ")}
        </span>
      </span>
      <span className="meta hidden text-faint sm:block">{project.status}</span>
    </Link>
  );
}
