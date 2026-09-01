"use client";

import dynamic from "next/dynamic";

import type { ProjectDemoId } from "@/data/projects";
import type { Locale } from "@/lib/i18n";
import styles from "./ProjectDemoRouter.module.css";
import { ProjectTranslationBoundary } from "./ProjectTranslationBoundary";

function DemoLoading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span aria-hidden="true" />
      <strong>OPENING INTERACTIVE FILE…</strong>
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

export function ProjectDemoRouter({ demoId, locale = "en-GB" }: { demoId: ProjectDemoId; locale?: Locale }) {
  let demo: React.ReactNode;
  switch (demoId) {
    case "bandits":
      demo = <BanditStudio />;
      break;
    case "finance":
      demo = <FinanceStudio />;
      break;
    case "cv-keywords":
      demo = <CvKeywordStudio />;
      break;
    case "scheduling":
      demo = <SchedulingStudio />;
      break;
    case "insurance-matching":
      demo = <InsuranceMatchingDemo />;
      break;
    case "italian-learning":
      demo = <ItalianLearningStudio />;
      break;
    case "course-recommender":
      demo = <CourseRecommenderStudio />;
      break;
    case "spectroscopy":
      demo = <SpectroscopyStudio />;
      break;
    case "thermodynamics":
      demo = <ThermodynamicsStudio />;
      break;
    case "dl-environment":
      demo = <EnvironmentPlannerStudio />;
      break;
    case "home-lab-topology":
      demo = <HomeLabTopologyStudio />;
      break;
    case "chemistry-coding":
      demo = <ChemistryCodingStudio />;
      break;
    case "stock-market-engine":
      demo = <StockMarketStudio />;
      break;
    case "innovation-models":
      demo = <InnovationModelsStudio />;
      break;
    case "molecular-recognition":
      demo = <MolecularRecognitionStudio />;
      break;
    case "solubility-workflow":
      demo = <DrugSolubilityStudio />;
      break;
    case "venture-reasoning":
      demo = <VentureReasoningStudio />;
      break;
    case "rl-atlas":
      demo = <RlAtlasDemo />;
      break;
    case "microrobot-vision":
      demo = <MicrorobotShowcase locale={locale} />;
      break;
    case "mri-trust":
      demo = <MriTrustStudio />;
      break;
    case "cfd-surrogates":
      demo = <CfdShowcase />;
      break;
    case "reliability":
      demo = <ReliabilityLabDemo />;
      break;
    case "deferral-risk":
      demo = <DeferralRiskStudio />;
      break;
    case "air-quality":
      demo = <AirQualityBudgetDemo />;
      break;
    case "cyber-threshold":
      demo = <CyberThresholdDemo />;
      break;
    case "regularisation":
      demo = <RegularisationLabDemo />;
      break;
    case "causal-ope":
      demo = <CausalOpeDemo />;
      break;
    default: {
      const unhandledDemo: never = demoId;
      demo = unhandledDemo;
    }
  }

  return <ProjectTranslationBoundary locale={locale}>{demo}</ProjectTranslationBoundary>;
}

export default ProjectDemoRouter;
