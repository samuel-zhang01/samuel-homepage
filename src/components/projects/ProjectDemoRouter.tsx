"use client";

import dynamic from "next/dynamic";
import { Component, type ComponentType, type ReactNode } from "react";

import type { ProjectDemoId } from "@/data/projects";
import { translateText, type Locale } from "@/lib/i18n";
import styles from "./ProjectDemoRouter.module.css";
import { ProjectTranslationBoundary, useProjectLocale } from "./ProjectTranslationBoundary";
import { ProjectDemoActivityProvider } from "./ProjectDemoActivityContext";

function DemoLoading() {
  const locale = useProjectLocale();
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <strong>{translateText(locale, "OPENING INTERACTIVE FILE…")}</strong>
      <div className={styles.skeleton} aria-hidden="true">
        <div className={styles.skeletonHeading} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonControls}><i /><i /><i /></div>
        <div className={styles.skeletonPanels}><i /><i /></div>
      </div>
    </div>
  );
}

// Keep a failed lazy chunk or render local to its project. Visitors can still
// use the archive, settings and their other open desktop windows.
class DemoErrorBoundary extends Component<{ locale: Locale; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    const locale = this.props.locale;
    const copy = locale === "zh-CN" ? {
      title: "无法打开此交互演示",
      detail: "其他项目和桌面工具仍可使用。请检查网络连接，再重新加载页面。",
      reload: "重新加载页面",
    } : locale === "zh-TW" ? {
      title: "無法開啟此互動示範",
      detail: "其他專案和桌面工具仍可使用。請檢查網路連線，再重新載入頁面。",
      reload: "重新載入頁面",
    } : {
      title: "This interactive demo could not open",
      detail: "Other projects and desktop tools are still available. Check your connection, then reload the page.",
      reload: "Reload page",
    };
    return <section className={styles.error} role="alert" lang={locale}>
      <h2>{copy.title}</h2>
      <p>{copy.detail}</p>
      <button type="button" className="s7-button" onClick={() => window.location.reload()}>{copy.reload}</button>
    </section>;
  }
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
const VideoMateStudio = dynamic(
  () => import("./VideoMateStudio").then((module) => module.VideoMateStudio),
  { loading: DemoLoading },
);

// Keep selection declarative and exhaustive while preserving each lazy import.
// Search indexing reads this same registry, so routing and search cannot drift.
const demoComponents: Record<ProjectDemoId, ComponentType<{ locale?: Locale }>> = {
  "videomate": VideoMateStudio,
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
  return <ProjectTranslationBoundary locale={locale}><DemoErrorBoundary key={demoId} locale={locale}><ProjectDemoActivityProvider active={active}><Demo locale={locale} /></ProjectDemoActivityProvider></DemoErrorBoundary></ProjectTranslationBoundary>;
}

export default ProjectDemoRouter;
