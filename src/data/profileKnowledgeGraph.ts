import { projects } from "./projects";
import { profileSkills, profileSources } from "./profile";
import { profileProjectOrigins, profileOriginRecords } from "./profileProjectOrigins";
import { getDocumentLibrary } from "./documents";
import { buildKnowledgeGraph, type KnowledgeProfileData } from "./knowledgeGraph";

/** One adapter joins the profile and catalogue. Updating their stable references
 * updates the map, inspector, search and exported graph without hand-written edges. */
export const profileKnowledgeData: KnowledgeProfileData = {
  sources: profileSources,
  skills: profileSkills,
  documents: getDocumentLibrary("en-GB"),
  records: profileOriginRecords,
};

export const portfolioKnowledgeGraph = buildKnowledgeGraph(projects, profileProjectOrigins, profileKnowledgeData);
