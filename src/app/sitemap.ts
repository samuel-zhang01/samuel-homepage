import { projects } from "@/data/projects";
import { localeOptions } from "@/lib/i18n";
import type { MetadataRoute } from "next";

const origin = "https://me.samuelzhang.co.uk";

const sections = [
  "about",
  "contact",
  "coverd",
  "desk",
  "documents",
  "education",
  "experience",
  "games",
  "interests",
  "lab",
  "orbitals",
  "projects",
  "sidequest",
  "skills",
] as const;

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
): MetadataRoute.Sitemap[number] {
  return {
    url: `${origin}${path}`,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const rootRoutes = [
    entry("/", 1, "monthly"),
    ...sections.map((section) => entry(`/${section}`, section === "projects" ? 0.95 : 0.7, "monthly")),
  ];

  const localisedRoutes = localeOptions.flatMap((locale) => [
    entry(`/${locale.slug}`, 0.8, "monthly"),
    ...sections.map((section) => entry(
      `/${locale.slug}/${section}`,
      section === "projects" ? 0.9 : 0.65,
      "monthly",
    )),
  ]);

  const projectRoutes = projects.flatMap((project) => {
    const query = `?project=${encodeURIComponent(project.slug)}`;
    return [
      entry(`/projects${query}`, project.featured ? 0.9 : 0.75, "monthly"),
      ...localeOptions.map((locale) => entry(
        `/${locale.slug}/projects${query}`,
        project.featured ? 0.85 : 0.7,
        "monthly",
      )),
    ];
  });

  return [...rootRoutes, ...localisedRoutes, ...projectRoutes];
}
