"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Brain,
  TrendingUp,
  Beaker,
  DollarSign,
  Target,
  Code,
  ChevronRight,
  X,
  Award,
  Activity,
} from "lucide-react";

type SkillCard = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  description: string;
  keyStrengths: string[];
  experience: string;
  achievements: string[];
  technologies: string[];
  projects: string[];
};

const skillsData: SkillCard[] = [
  {
    id: "product-manager",
    title: "Product Management",
    icon: Briefcase,
    color: "text-blue-600",
    bgGradient: "from-blue-500 to-blue-600",
    description:
      "End-to-end product development leadership with proven track record of delivering enterprise solutions that drive measurable business impact.",
    keyStrengths: [
      "User Research & Requirements Definition",
      "Enterprise Product Development",
      "Cross-functional Agile Team Leadership",
      "Process Automation & optimisation",
      "Data Analytics & Real-time KPI Implementation",
      "Digital Transformation Leadership",
      "Technical Documentation & User Training",
      "Stakeholder Management Across Restructuring",
    ],
    experience:
      "Product owner at Pfizer leading GROWMAT development - enterprise resource management platform serving department-wide adoption",
    achievements: [
      "Led end-to-end development of mission-critical enterprise platform",
      "Achieved 1200% efficiency improvement through user-centered design",
      "Saved 120+ person-hours monthly through process optimisation",
      "99.9% system uptime with 80% performance improvement",
      "Director-level commendation for solving operational challenges",
      "Successfully managed product through multiple business restructuring events",
    ],
    technologies: [
      "Agile/Scrum",
      "MATLAB",
      "Real-time Analytics",
      "KPI Dashboards",
      "Technical Documentation",
      "User Training",
    ],
    projects: [
      "GROWMAT Enterprise Platform",
      "COVID-19 Emergency Response System",
      "Department Programming Initiative",
    ],
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    icon: Brain,
    color: "text-purple-600",
    bgGradient: "from-purple-500 to-purple-600",
    description:
      "Specialized in AI/ML applications with focus on computational modeling, predictive analytics, and real-world pharmaceutical/scientific implementation.",
    keyStrengths: [
      "Machine Learning & Deep Learning",
      "Evolutionary Algorithms & Parameter Optimization",
      "Real-time Forecasting & Predictive Analytics",
      "Computational Chemistry & Drug Discovery",
      "Scientific Programming & HPC Systems",
      "AI Product Development & Business Cases",
    ],
    experience:
      "Imperial College London MSc AI student with hands-on pharmaceutical ML experience at Pfizer, specializing in drug solubility modeling and parameter estimation",
    achievements: [
      "Built GPU-accelerated HPC infrastructure reducing computation time by 70%",
      "Developed drug solubility models using PC-SAFT equation of state theory",
      "Implemented evolutionary algorithms for pharmaceutical parameter estimation",
      "Created real-time forecasting systems with 99.9% uptime",
      "Applied Taguchi experimental design for ML algorithm optimization",
      "Developed COVID-19 predictive models using Monte Carlo simulations",
    ],
    technologies: [
      "Python",
      "Julia",
      "BlackBoxOptim.jl",
      "Metaheuristics.jl",
      "PostgreSQL",
      "MATLAB",
      "Slurm HPC",
      "Docker",
    ],
    projects: [
      "Drug Discovery Modeling",
      "COVID-19 Predictive Analytics",
      "Molecular Dynamics Simulations",
      "AI Venture Development",
    ],
  },
  {
    id: "digital-consultancy",
    title: "Digital Consultancy",
    icon: TrendingUp,
    color: "text-green-600",
    bgGradient: "from-green-500 to-green-600",
    description:
      "Strategic digital transformation consultant specializing in organisational change, stakeholder alignment, and business process optimization across complex enterprise environments.",
    keyStrengths: [
      "Strategic Business Analysis & Process Optimization",
      "Stakeholder Engagement & Relationship Management",
      "Organisational Change Management & Training",
      "Cross-functional Team Leadership",
      "Client Communication & Executive Presentations",
      "Risk Assessment & Business Continuity Planning",
    ],
    experience:
      "Proven track record leading organisational transformations across pharmaceutical, government, and academic sectors with focus on stakeholder buy-in and sustainable change",
    achievements: [
      "Successfully convinced entire departments to adopt new systems through strategic influence",
      "Led cross-functional teams during organisational restructuring periods",
      "Designed and delivered training programs with 90% positive stakeholder feedback",
      "Managed complex stakeholder relationships across multiple business units",
      "Developed crisis management protocols and contingency planning frameworks",
      "Facilitated knowledge transfer and change adoption for 1000+ end users",
      "Secured long-term client relationships through exceptional performance delivery",
    ],
    technologies: [
      "Business Process Modeling",
      "Stakeholder Analysis Tools",
      "Project Management (Agile/Kanban)",
      "Data Analytics & Reporting",
      "Training & Documentation Platforms",
      "Change Management Frameworks",
    ],
    projects: [
      "Enterprise Digital Transformation",
      "Organisational Change Initiatives",
      "Training & Development Programs",
    ],
  },
  {
    id: "analytical-chemist",
    title: "Analytical Chemist",
    icon: Beaker,
    color: "text-orange-600",
    bgGradient: "from-orange-500 to-orange-600",
    description:
      "Comprehensive analytical chemistry expertise spanning pharmaceutical R&D, computational method development, and biochemical analysis with strong regulatory compliance and risk assessment capabilities.",
    keyStrengths: [
      "Multi-technique Analytical Methods (NMR, HPLC, FTIR, UV-Vis)",
      "Computational Chemistry & Molecular Dynamics",
      "Biochemical Laboratory Techniques & Genetic Engineering",
      "GMP Compliance & Quality Assurance",
      "Risk Assessment & Technical Reporting",
      "Scientific Communication & Training Delivery",
    ],
    experience:
      "1st Class Honours Chemistry graduate with Pfizer pharmaceutical R&D experience, research fellowships, and extensive teaching background across 80+ students",
    achievements: [
      "1st Class Honours (78%) with Royal Society of Chemistry Accreditation",
      "Developed ML-powered solubility models using statistical thermodynamics at Pfizer",
      "Built GPU-accelerated computational infrastructure reducing analysis time by 70%",
      "Successfully trained 80+ students in scientific computing and data analysis",
      "Engineered novel drug targets using SwissDock and AlphaFold 3 modeling",
      "Implemented robust data processing pipelines improving workflow efficiency by 40%",
      "Secured Royal Society sponsorship for educational initiatives",
    ],
    technologies: [
      "NMR/HPLC/FTIR/UV-Vis Spectroscopy",
      "GROMACS/SwissDock/AlphaFold",
      "PCR/Cell Culture/Genetic Engineering",
      "Python/MATLAB Data Analysis",
      "Statistical Thermodynamics",
      "Lab Inventory Management Systems",
    ],
    projects: [
      "Novel Drug Target Design",
      "Molecular Dynamics Simulations",
      "Pharmaceutical Solubility Modeling",
      "Scientific Computing Education Program",
    ],
  },
  {
    id: "finance",
    title: "Finance",
    icon: DollarSign,
    color: "text-indigo-600",
    bgGradient: "from-indigo-500 to-indigo-600",
    description:
      "Financial analysis and data-driven insights with experience in resource planning, budgeting, and ROI optimization for technical projects.",
    keyStrengths: [
      "Financial Modeling & Analysis",
      "ROI & Cost-Benefit Analysis",
      "Resource Planning & Allocation",
      "Budget Management",
      "Performance Metrics & KPIs",
      "Data-Driven Financial Insights",
    ],
    experience:
      "Financial oversight of technical projects, resource management for large teams, and data-driven decision making",
    achievements: [
      "Managed resource allocation for 1,000+ person organization",
      "Developed cost-benefit analyses for digital transformation projects",
      "Created financial models for emergency response planning",
      "Optimized resource utilization achieving 300% efficiency gains",
      "Built ROI tracking systems for technology investments",
    ],
    technologies: [
      "Excel",
      "Financial Modeling",
      "Power BI",
      "Statistical Analysis",
      "Cost Analysis",
      "Budget Planning",
    ],
    projects: [
      "Emergency Resource Planning",
      "Digital Transformation ROI Analysis",
      "Technology Investment Modeling",
    ],
  },
];

const SkillsPage = () => {
  const [selectedSkill, setSelectedSkill] = useState<SkillCard | null>(null);

  const SkillCardComponent = ({ skill }: { skill: SkillCard }) => {
    const Icon = skill.icon;

    return (
      <motion.div
        className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 cursor-pointer group overflow-hidden"
        whileHover={{
          y: -8,
          boxShadow: "0 12px 24px rgba(0,0,0,0.08)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => setSelectedSkill(skill)}
      >
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <motion.div
              className={`p-4 bg-gradient-to-br ${skill.bgGradient} rounded-xl`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="text-white" size={32} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {skill.title}
              </h3>
              <p className="text-gray-600">Professional expertise</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {skill.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {skill.keyStrengths.slice(0, 3).map((strength, index) => (
              <motion.span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                {strength}
              </motion.span>
            ))}
            {skill.keyStrengths.length > 3 && (
              <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                +{skill.keyStrengths.length - 3} more
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <p className="text-gray-500 text-sm flex items-center space-x-1">
              <span>Click to learn more</span>
              <ChevronRight size={14} />
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const DetailModal = ({ skill }: { skill: SkillCard }) => {
    const Icon = skill.icon;

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedSkill(null)}
      >
        <motion.div
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`bg-gradient-to-r ${skill.bgGradient} text-white p-8 rounded-t-2xl`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Icon className="text-white" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{skill.title}</h2>
                  <p className="text-xl text-white/90">
                    Detailed Expertise Overview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Overview
              </h3>
              <p className="text-gray-700 leading-relaxed text-lg">
                {skill.description}
              </p>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="mr-2" size={20} />
                Experience
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {skill.experience}
              </p>
            </div>

            {/* Key Strengths */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="mr-2" size={20} />
                Key Strengths
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {skill.keyStrengths.map((strength, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`w-2 h-2 ${skill.bgGradient} bg-gradient-to-r rounded-full`}
                    ></div>
                    <span className="text-gray-800">{strength}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2" size={20} />
                Key Achievements
              </h3>
              <div className="space-y-3">
                {skill.achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-800">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="mr-2" size={20} />
                Technologies & Tools
              </h3>
              <div className="flex flex-wrap gap-3">
                {skill.technologies.map((tech, index) => (
                  <motion.span
                    key={index}
                    className={`px-4 py-2 bg-gradient-to-r ${skill.bgGradient} text-white rounded-lg font-medium`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="mr-2" size={20} />
                Notable Projects
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {skill.projects.map((project, index) => (
                  <motion.div
                    key={index}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {project}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Applied {skill.title.toLowerCase()} expertise
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Skills & Expertise
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive expertise across five key domains, combining technical
            depth with business acumen to drive meaningful impact. Click on each
            card to explore detailed capabilities and achievements.
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {skillsData.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <SkillCardComponent skill={skill} />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Collaborate?</h2>
            <p className="text-xl text-blue-100 mb-6">
              Let&apos;s discuss how these diverse skills can contribute to your
              next project or organization.
            </p>
            <motion.button
              className="relative inline-flex items-center px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg cursor-pointer border-2 border-transparent hover:border-blue-300"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 0.5, -0.5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{
                scale: 1.15,
                rotate: 0,
                background: "white",
                color: "#2563eb",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.8)"
              }}
              whileTap={{
                scale: 0.9,
                rotate: 0
              }}
              style={{
                filter: "drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))"
              }}
              onClick={() => (window.location.href = "/projects")}
            >
              <span className="relative z-10 text-lg">✨ View Projects & Contact ✨</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSkill && <DetailModal skill={selectedSkill} />}
      </AnimatePresence>
    </div>
  );
};

export default SkillsPage;
