import type { KnowledgeEdge, KnowledgeNode } from "../data/knowledgeGraph";

/** Labels describe the actual direction of a connection. A shared subject is
 * never presented as proof of employment or proficiency. */
export function knowledgeRelationLabel(selected: KnowledgeNode, node: KnowledgeNode, relation: KnowledgeEdge["relation"]): string {
  if (relation === "related-context") return selected.kind === "skill" || node.kind === "skill" ? "Related subject context" : "Related research context";
  if (relation === "evidenced-by") return selected.kind === "skill" ? "Evidence for this skill" : selected.kind === "document" ? "Skill supported by this document" : "Skill demonstrated in this project";
  if (relation === "practised-in") return selected.kind === "skill" ? "Practised in this record" : "Skill practised in this record";
  if (relation === "documents") return selected.kind === "document" ? "Project documented here" : "Document for this project";
  if (relation === "supports-record") return selected.kind === "document" ? "Record supported by this document" : "Document supporting this record";
  if (relation === "covers") return node.kind === "topic" ? "Subject in this record" : "Record covering this subject";
  if (relation === "concerns") return node.kind === "topic" || node.kind === "method" ? "Related subject or method" : "Record connected to this idea";
  if (node.kind === "project") return ["experience", "education"].includes(selected.kind) ? "Project from this experience" : selected.kind === "method" ? "Project using this method" : "Project in this subject";
  if (node.kind === "experience" || node.kind === "education") return "Developed in this context";
  if (node.kind === "method") return selected.kind === "topic" ? "Method in this subject" : "Uses this method";
  return selected.kind === "method" ? "Part of this subject" : "Explores this subject";
}

export const knowledgeGraphExtensionCopy: Record<string, readonly [string, string]> = {
  "Knowledge graph": ["知识关系图", "知識關係圖"],
  "Start with a subject, experience, skill or document. Follow its evidence to the work.": ["从主题、经历、技能或文档出发，沿着依据探索相关工作。", "從主題、經歷、技能或文件出發，沿著依據探索相關工作。"],
  "Find a subject, project, experience, skill or document": ["查找主题、项目、经历、技能或文档", "尋找主題、專案、經歷、技能或文件"],
  "Work experience": ["工作经历", "工作經歷"],
  "Skill": ["技能", "技能"],
  "Skills": ["技能", "技能"],
  "Document": ["文档", "文件"],
  "Documents": ["文档", "文件"],
  "Skills shown here": ["相关技能", "相關技能"],
  "Documents to read": ["相关文档", "相關文件"],
  "Open skill evidence": ["打开技能与依据", "開啟技能與依據"],
  "Open document record": ["打开文档记录", "開啟文件記錄"],
  "Open PDF": ["打开 PDF", "開啟 PDF"],
  "Evidence sources": ["依据来源", "依據來源"],
  "skills": ["项技能", "項技能"],
  "documents": ["份文档", "份文件"],
  "Trace a skill to its evidence": ["查看技能的依据", "查看技能的依據"],
  "Projects, professional records and source documents": ["项目、职业记录与原始文档", "專案、職業記錄與原始文件"],
  "Select a node to read about it and follow its connections.": ["选择一个节点，阅读介绍并沿着关联探索。", "選擇一個節點，閱讀介紹並沿著關聯探索。"],
  "Shared subjects connect ideas. Skills and documents link to named evidence.": ["共同主题连接不同想法；技能和文档关联到明确的依据。", "共同主題連結不同想法；技能與文件關聯到明確的依據。"],
  "Evidence for this skill": ["此技能的依据", "此技能的依據"],
  "Related subject context": ["相关学科背景", "相關學科背景"],
  "Skill supported by this document": ["此文档支持的技能", "此文件支持的技能"],
  "Skill demonstrated in this project": ["此项目展示的技能", "此專案展示的技能"],
  "Practised in this record": ["在此经历中运用", "在此經歷中運用"],
  "Skill practised in this record": ["此经历中运用的技能", "此經歷中運用的技能"],
  "Project documented here": ["此文档记录的项目", "此文件記錄的專案"],
  "Document for this project": ["此项目的文档", "此專案的文件"],
  "Record supported by this document": ["此文档支持的记录", "此文件支持的記錄"],
  "Document supporting this record": ["支持此记录的文档", "支持此記錄的文件"],
  "Subject in this record": ["此经历涉及的主题", "此經歷涉及的主題"],
  "Record covering this subject": ["涉及此主题的经历", "涉及此主題的經歷"],
  "Related subject or method": ["相关主题或方法", "相關主題或方法"],
  "Record connected to this idea": ["与此知识关联的记录", "與此知識關聯的記錄"],
};
