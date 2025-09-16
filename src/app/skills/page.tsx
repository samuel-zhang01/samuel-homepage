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
  Activity
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
    title: "Product Manager",
    icon: Briefcase,
    color: "text-blue-600",
    bgGradient: "from-blue-500 to-blue-600",
    description: "End-to-end product development leadership with proven track record of delivering enterprise solutions that drive measurable business impact.",
    keyStrengths: [
      "User Research & Requirements Gathering",
      "Cross-functional Team Leadership",
      "Agile & Scrum Methodologies",
      "Product Roadmap Development",
      "Stakeholder Management",
      "Data-Driven Decision Making"
    ],
    experience: "2.5 years at Pfizer leading GROWMAT development - enterprise resource management platform serving 40+ users",
    achievements: [
      "Led end-to-end development of mission-critical enterprise platform",
      "Achieved 1200% efficiency improvement through user-centered design",
      "Saved 120+ person-hours monthly through process optimization",
      "99.9% system uptime with comprehensive disaster recovery",
      "Director-level commendation for solving operational challenges"
    ],
    technologies: ["Agile/Scrum", "Jira", "User Stories", "Wireframing", "A/B Testing", "KPI Analytics"],
    projects: ["GROWMAT Enterprise Platform", "COVID-19 Emergency Response System", "Department Programming Initiative"]
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    icon: Brain,
    color: "text-purple-600",
    bgGradient: "from-purple-500 to-purple-600",
    description: "Specialized in AI/ML applications with focus on computational modeling, predictive analytics, and real-world business implementation.",
    keyStrengths: [
      "Machine Learning & Deep Learning",
      "Predictive Analytics & Modeling",
      "Computational Chemistry & Biology",
      "Data Pipeline Architecture",
      "Scientific Programming",
      "AI Product Development"
    ],
    experience: "Currently pursuing MSc AI Applications at Imperial College London, with practical experience from research and industry projects",
    achievements: [
      "Built GPU-accelerated HPC infrastructure reducing computation time by 70%",
      "Developed predictive models for COVID-19 resource planning",
      "Created drug discovery workflows using SwissDock and AlphaFold 3",
      "Optimized molecular dynamics simulations using GROMACS",
      "Led AI venture development projects with business case creation"
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "Julia", "GROMACS", "MATLAB", "Docker", "AWS"],
    projects: ["Drug Discovery Modeling", "COVID-19 Predictive Analytics", "Molecular Dynamics Simulations", "AI Venture Development"]
  },
  {
    id: "digital-consultancy",
    title: "Digital Consultancy",
    icon: TrendingUp,
    color: "text-green-600",
    bgGradient: "from-green-500 to-green-600",
    description: "Digital transformation expertise combining technical implementation with strategic business consulting to modernize legacy systems.",
    keyStrengths: [
      "Digital Transformation Strategy",
      "Legacy System Modernization",
      "Process Automation & Optimization",
      "Change Management",
      "Technology Implementation",
      "ROI Analysis & Business Cases"
    ],
    experience: "Led digital transformation initiatives at Pfizer and Singapore Civil Defence Force, impacting 1000+ users",
    achievements: [
      "Replaced 15-year-old Excel system with modern web platform",
      "Automated operations for 1,000+ frontline responders",
      "300% improvement in emergency response time through digitization",
      "Comprehensive change management across multiple business restructures",
      "Created scalable solutions with 3-tier disaster recovery"
    ],
    technologies: ["Next.js", "React", "PostgreSQL", "Docker", "AWS", "Process Mining", "Workflow Optimization"],
    projects: ["GROWMAT Digital Platform", "Emergency Response Automation", "Workflow Management Systems"]
  },
  {
    id: "analytical-chemist",
    title: "Analytical Chemist",
    icon: Beaker,
    color: "text-orange-600",
    bgGradient: "from-orange-500 to-orange-600",
    description: "Pharmaceutical analytical chemistry expertise with focus on computational methods, drug discovery, and quality assurance in regulated environments.",
    keyStrengths: [
      "Pharmaceutical Analysis & QA",
      "Computational Chemistry",
      "Drug Discovery & Development",
      "Regulatory Compliance (GMP)",
      "Spectroscopic Analysis",
      "Risk Assessment & Validation"
    ],
    experience: "1st Class Honours Chemistry degree with industry placement at Pfizer Analytical R&D, plus research fellowships",
    achievements: [
      "1st Class Honours with Royal Society of Chemistry Accreditation",
      "Drug discovery project using SwissDock and AlphaFold 3 modeling",
      "Research fellowships in computational chemistry and spectroscopy",
      "GMP-compliant analytical method development",
      "Hazard assessment and risk management in synthetic chemistry"
    ],
    technologies: ["SwissDock", "AlphaFold", "Spectroscopy", "HPLC", "Mass Spectrometry", "GROMACS", "Chemical Informatics"],
    projects: ["Novel Drug Target Design", "Protein-Lipid Co-Assembly Research", "Odorant-Receptor Interaction Studies"]
  },
  {
    id: "finance",
    title: "Finance",
    icon: DollarSign,
    color: "text-indigo-600",
    bgGradient: "from-indigo-500 to-indigo-600",
    description: "Financial analysis and data-driven insights with experience in resource planning, budgeting, and ROI optimization for technical projects.",
    keyStrengths: [
      "Financial Modeling & Analysis",
      "ROI & Cost-Benefit Analysis",
      "Resource Planning & Allocation",
      "Budget Management",
      "Performance Metrics & KPIs",
      "Data-Driven Financial Insights"
    ],
    experience: "Financial oversight of technical projects, resource management for large teams, and data-driven decision making",
    achievements: [
      "Managed resource allocation for 1,000+ person organization",
      "Developed cost-benefit analyses for digital transformation projects",
      "Created financial models for emergency response planning",
      "Optimized resource utilization achieving 300% efficiency gains",
      "Built ROI tracking systems for technology investments"
    ],
    technologies: ["Excel", "Financial Modeling", "Power BI", "Statistical Analysis", "Cost Analysis", "Budget Planning"],
    projects: ["Emergency Resource Planning", "Digital Transformation ROI Analysis", "Technology Investment Modeling"]
  }
];

const SkillsPage = () => {
  const [selectedSkill, setSelectedSkill] = useState<SkillCard | null>(null);

  const SkillCardComponent = ({ skill }: { skill: SkillCard }) => {
    const Icon = skill.icon;

    return (
      <motion.div
        className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 cursor-pointer group overflow-hidden"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        onClick={() => setSelectedSkill(skill)}
      >
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${skill.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-4 bg-gradient-to-br ${skill.bgGradient} rounded-xl`}>
              <Icon className="text-white" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{skill.title}</h3>
              <p className="text-gray-600">Click to explore expertise</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {skill.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {skill.keyStrengths.slice(0, 3).map((strength, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {strength}
                </span>
              ))}
              {skill.keyStrengths.length > 3 && (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                  +{skill.keyStrengths.length - 3} more
                </span>
              )}
            </div>

            <motion.div
              className={`p-2 ${skill.color} group-hover:translate-x-1 transition-transform`}
              whileHover={{ scale: 1.1 }}
            >
              <ChevronRight size={20} />
            </motion.div>
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
          <div className={`bg-gradient-to-r ${skill.bgGradient} text-white p-8 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Icon className="text-white" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{skill.title}</h2>
                  <p className="text-xl text-white/90">Detailed Expertise Overview</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Overview</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{skill.description}</p>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="mr-2" size={20} />
                Experience
              </h3>
              <p className="text-gray-700 leading-relaxed">{skill.experience}</p>
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
                    <div className={`w-2 h-2 ${skill.bgGradient} bg-gradient-to-r rounded-full`}></div>
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
                    <h4 className="font-semibold text-gray-900 mb-1">{project}</h4>
                    <p className="text-sm text-gray-600">Applied {skill.title.toLowerCase()} expertise</p>
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
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Skills & Expertise</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive expertise across five key domains, combining technical depth with business acumen
            to drive meaningful impact. Click on each card to explore detailed capabilities and achievements.
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
              Let&apos;s discuss how these diverse skills can contribute to your next project or organization.
            </p>
            <motion.button
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/projects'}
            >
              View Projects & Contact
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