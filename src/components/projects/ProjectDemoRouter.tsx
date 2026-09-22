"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { ProjectDemoId } from "@/data/projects";
import { translateText, type Locale } from "@/lib/i18n";
import { ProjectActivityProvider } from "./ProjectActivity";
import styles from "./ProjectDemoRouter.module.css";
import { ProjectTranslationBoundary, useProjectLocale } from "./ProjectTranslationBoundary";

function DemoLoading() {
  const locale = useProjectLocale();
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span aria-hidden="true" />
      <strong>{translateText(locale, "OPENING INTERACTIVE FILE…")}</strong>
    </div>
  );
}

const BanditStudio = dynamic(
  () => import("./BanditStudio").then((module) => module.BanditStudio),
  { loading: DemoLoading },
);
const FinanceStudio = dynamic(
  () => import("./FinanceStudio").then((module) => module.FinanceStudio),
  { loading: DemoLoading },
);
const RlAtlasDemo = dynamic(
  () => import("./RlAtlasDemo").then((module) => module.RlAtlasDemo),
  { loading: DemoLoading },
);
const CfdShowcase = dynamic(
  () => import("./CfdShowcase").then((module) => module.CfdShowcase),
  { loading: DemoLoading },
);
const MicrorobotShowcase = dynamic(
  () => import("./MicrorobotShowcase").then((module) => module.MicrorobotShowcase),
  { loading: DemoLoading },
);
const MriTrustStudio = dynamic(
  () => import("./MriTrustStudio").then((module) => module.MriTrustStudio),
  { loading: DemoLoading },
);
const ReliabilityLabDemo = dynamic(
  () => import("./ScientificDemos").then((module) => module.ReliabilityLabDemo),
  { loading: DemoLoading },
);
const DeferralRiskStudio = dynamic(
  () => import("./DeferralRiskStudio").then((module) => module.DeferralRiskStudio),
  { loading: DemoLoading },
);
const AirQualityBudgetDemo = dynamic(
  () => import("./DecisionDemos").then((module) => module.AirQualityBudgetDemo),
  { loading: DemoLoading },
);
const CyberThresholdDemo = dynamic(
  () => import("./DecisionDemos").then((module) => module.CyberThresholdDemo),
  { loading: DemoLoading },
);
const RegularisationLabDemo = dynamic(
  () => import("./DecisionDemos").then((module) => module.RegularisationLabDemo),
  { loading: DemoLoading },
);
const CausalOpeDemo = dynamic(
  () => import("./DecisionDemos").then((module) => module.CausalOpeDemo),
  { loading: DemoLoading },
);
const SchedulingStudio = dynamic(
  () => import("./SchedulingStudio").then((module) => module.SchedulingStudio),
  { loading: DemoLoading },
);
const CvKeywordStudio = dynamic(
  () => import("./CvKeywordStudio").then((module) => module.CvKeywordStudio),
  { loading: DemoLoading },
);
const InsuranceMatchingDemo = dynamic(
  () => import("./InsuranceMatchingDemo").then((module) => module.InsuranceMatchingDemo),
  { loading: DemoLoading },
);
const ItalianLearningStudio = dynamic(
  () => import("./ItalianLearningStudio").then((module) => module.ItalianLearningStudio),
  { loading: DemoLoading },
);
const CourseRecommenderStudio = dynamic(
  () => import("./CourseRecommenderStudio").then((module) => module.CourseRecommenderStudio),
  { loading: DemoLoading },
);
const SpectroscopyStudio = dynamic(
  () => import("./SpectroscopyStudio").then((module) => module.SpectroscopyStudio),
  { loading: DemoLoading },
);
const ThermodynamicsStudio = dynamic(
  () => import("./ThermodynamicsStudio").then((module) => module.ThermodynamicsStudio),
  { loading: DemoLoading },
);
const EnvironmentPlannerStudio = dynamic(
  () => import("./EnvironmentPlannerStudio").then((module) => module.EnvironmentPlannerStudio),
  { loading: DemoLoading },
);
const HomeLabTopologyStudio = dynamic(
  () => import("./HomeLabTopologyStudio").then((module) => module.HomeLabTopologyStudio),
  { loading: DemoLoading },
);
const ChemistryCodingStudio = dynamic(
  () => import("./ChemistryCodingStudio").then((module) => module.ChemistryCodingStudio),
  { loading: DemoLoading },
);
const StockMarketStudio = dynamic(
  () => import("./StockMarketStudio").then((module) => module.StockMarketStudio),
  { loading: DemoLoading },
);
const InnovationModelsStudio = dynamic(
  () => import("./InnovationModelsStudio").then((module) => module.InnovationModelsStudio),
  { loading: DemoLoading },
);
const MolecularRecognitionStudio = dynamic(
  () => import("./MolecularRecognitionStudio").then((module) => module.MolecularRecognitionStudio),
  { loading: DemoLoading },
);
const DrugSolubilityStudio = dynamic(
  () => import("./DrugSolubilityStudio").then((module) => module.DrugSolubilityStudio),
  { loading: DemoLoading },
);
const VentureReasoningStudio = dynamic(
  () => import("./VentureReasoningStudio").then((module) => module.VentureReasoningStudio),
  { loading: DemoLoading },
);

// Keep selection declarative and exhaustive while preserving each lazy import.
// Search indexing reads this same registry, so routing and search cannot drift.
const demoComponents: Record<ProjectDemoId, ComponentType<{ locale?: Locale }>> = {
  "bandits": BanditStudio,
  "finance": FinanceStudio,
  "cv-keywords": CvKeywordStudio,
  "scheduling": SchedulingStudio,
  "insurance-matching": InsuranceMatchingDemo,
  "italian-learning": ItalianLearningStudio,
  "course-recommender": CourseRecommenderStudio,
  "spectroscopy": SpectroscopyStudio,
  "thermodynamics": ThermodynamicsStudio,
  "dl-environment": EnvironmentPlannerStudio,
  "home-lab-topology": HomeLabTopologyStudio,
  "chemistry-coding": ChemistryCodingStudio,
  "stock-market-engine": StockMarketStudio,
  "innovation-models": InnovationModelsStudio,
  "molecular-recognition": MolecularRecognitionStudio,
  "solubility-workflow": DrugSolubilityStudio,
  "venture-reasoning": VentureReasoningStudio,
  "rl-atlas": RlAtlasDemo,
  "microrobot-vision": MicrorobotShowcase,
  "mri-trust": MriTrustStudio,
  "cfd-surrogates": CfdShowcase,
  "reliability": ReliabilityLabDemo,
  "deferral-risk": DeferralRiskStudio,
  "air-quality": AirQualityBudgetDemo,
  "cyber-threshold": CyberThresholdDemo,
  "regularisation": RegularisationLabDemo,
  "causal-ope": CausalOpeDemo,
};

export function ProjectDemoRouter({ demoId, locale = "en-GB", active = true }: { demoId: ProjectDemoId; locale?: Locale; active?: boolean }) {
  const Demo = demoComponents[demoId];
  return <ProjectActivityProvider active={active}><ProjectTranslationBoundary locale={locale}><Demo locale={locale} /></ProjectTranslationBoundary></ProjectActivityProvider>;
}

export default ProjectDemoRouter;
