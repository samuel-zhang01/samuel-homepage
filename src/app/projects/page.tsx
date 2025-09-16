"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Github,
  Award,
  Users,
  TrendingUp,
  Zap,
  Brain,
  Beaker,
  Home,
  Shield,
  Camera,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Download,
  Heart,
  Music,
  Gamepad2,
  Mountain,
  Code,
  BookOpen
} from "lucide-react";

type Project = {
  id: string;
  title: string;
  category: "Professional" | "Research" | "Personal";
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  description: string;
  achievements: string[];
  technologies: string[];
  duration: string;
  impact?: string;
  links?: { type: string; url: string; label: string }[];
};

const ProjectsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const projects: Project[] = [
    {
      id: "growmat",
      title: "GROWMAT Enterprise Platform",
      category: "Professional",
      icon: TrendingUp,
      color: "text-blue-600",
      bgGradient: "from-blue-500 to-blue-600",
      description: "Mission-critical enterprise resource management and forecasting platform for Pfizer's Global Analytics team. Led full product lifecycle from user research to deployment.",
      achievements: [
        "1200% efficiency improvement across 40+ users",
        "120+ person-hours saved monthly",
        "99.9% system uptime with 3-tier disaster recovery",
        "Department-wide adoption with director commendation",
        "Replaced 15-year-old legacy Excel system"
      ],
      technologies: ["Next.js", "PostgreSQL", "Julia", "Docker", "AWS", "Spotfire", "Agile"],
      duration: "10 months (2024 - Present)",
      impact: "Transformed workflow management for entire analytical department",
      links: [
        { type: "demo", url: "/growmat-case-study.html", label: "View Case Study" },
        { type: "demo", url: "/mckinsey-case-study.html", label: "McKinsey Analysis" }
      ]
    },
    {
      id: "covid-response",
      title: "COVID-19 Emergency Response System",
      category: "Professional",
      icon: Shield,
      color: "text-red-600",
      bgGradient: "from-red-500 to-red-600",
      description: "Developed predictive analytics and automation system for Singapore Civil Defence Force during COVID-19 pandemic, managing operations for 1,000+ frontline responders.",
      achievements: [
        "300% improvement in emergency response time",
        "Automated HR operations for 1,000+ personnel",
        "Real-time COVID-19 transmission modeling",
        "Service Excellence Award recognition",
        "Zero system downtime during critical operations"
      ],
      technologies: ["MATLAB", "Excel VBA", "Access", "Statistical Modeling", "Automation"],
      duration: "2019 - 2021",
      impact: "Enhanced national emergency response capabilities during pandemic"
    },
    {
      id: "drug-discovery",
      title: "Novel Drug Target Design",
      category: "Research",
      icon: Beaker,
      color: "text-purple-600",
      bgGradient: "from-purple-500 to-purple-600",
      description: "Computational drug discovery project using SwissDock and AlphaFold 3 for novel therapeutic target identification and drug-protein interaction analysis.",
      achievements: [
        "Designed innovative computational workflows",
        "Integrated multiple AI/ML models for drug discovery",
        "Applied cutting-edge protein folding predictions",
        "Developed QSAR analysis pipelines",
        "Contributed to pharmaceutical research advancement"
      ],
      technologies: ["SwissDock", "AlphaFold 3", "Python", "Computational Chemistry", "QSAR"],
      duration: "Final Year Project (2025)",
      impact: "Advanced computational approaches to drug discovery"
    },
    {
      id: "molecular-dynamics",
      title: "GPU-Accelerated Molecular Dynamics",
      category: "Research",
      icon: Brain,
      color: "text-green-600",
      bgGradient: "from-green-500 to-green-600",
      description: "Built high-performance computing infrastructure for molecular dynamics simulations, achieving significant performance improvements in protein research.",
      achievements: [
        "70% reduction in simulation computation time",
        "Self-hosted GPU-accelerated infrastructure",
        "Optimized GROMACS workflows",
        "Advanced membrane protein dynamics research",
        "40% improvement in data analysis efficiency"
      ],
      technologies: ["GROMACS", "GPU Computing", "HPC", "MATLAB", "Python", "Linux"],
      duration: "Research Fellowship (2022-2023)",
      impact: "Accelerated computational biology research capabilities"
    },
    {
      id: "home-automation",
      title: "HomeAutomationStack",
      category: "Personal",
      icon: Home,
      color: "text-orange-600",
      bgGradient: "from-orange-500 to-orange-600",
      description: "Comprehensive home automation system running on Raspberry Pi 5, featuring remote control, monitoring, and intelligent automation capabilities.",
      achievements: [
        "Full-stack IoT implementation",
        "32TB NAS with facial recognition",
        "Real-time air quality monitoring",
        "Secure VPN and remote access",
        "Automated disaster recovery system"
      ],
      technologies: ["Raspberry Pi", "Docker", "OpenVPN", "PostgreSQL", "Cloudflare", "IoT Sensors"],
      duration: "Ongoing Personal Project",
      impact: "Complete smart home ecosystem with enterprise-grade features",
      links: [
        { type: "github", url: "https://homepage.samuelzhang.co.uk", label: "View" }
      ]
    },
    {
      id: "fortune-bank-analysis",
      title: "Fortune Bank - Campaign Analysis Dashboard",
      category: "Professional",
      icon: TrendingUp,
      color: "text-green-600",
      bgGradient: "from-green-500 to-green-600",
      description: "Comprehensive financial analytics dashboard showcasing data-driven insights for strategic decision making with interactive visualizations and campaign performance analysis.",
      achievements: [
        "Interactive data visualization with Chart.js integration",
        "Real-time campaign performance tracking",
        "Geographic customer distribution analysis",
        "Loan approval rate optimization insights",
        "Customer satisfaction correlation analysis"
      ],
      technologies: ["JavaScript", "Chart.js", "CSS3", "Data Visualization", "Financial Analytics", "Dashboard Design"],
      duration: "Financial Analytics Project",
      impact: "Demonstrated ability to transform complex financial data into actionable business insights",
      links: [
        { type: "demo", url: "/fortune-bank-dashboard.html", label: "View Dashboard" }
      ]
    },
    {
      id: "chemistry-education",
      title: "Programming Initiative for Chemistry",
      category: "Professional",
      icon: Code,
      color: "text-indigo-600",
      bgGradient: "from-indigo-500 to-indigo-600",
      description: "Founded and led department-wide programming education initiative, designing curriculum and training 80+ students in computational skills.",
      achievements: [
        "Trained 80+ students across 20+ sessions",
        "90% positive feedback rate",
        "Royal Society endorsement and sponsorship",
        "Comprehensive curriculum development",
        "Sustainable program implementation"
      ],
      technologies: ["Python", "Excel", "Data Analysis", "Scientific Computing", "Curriculum Design"],
      duration: "2022 - Present",
      impact: "Enhanced computational literacy across chemistry department"
    }
  ];

  const interests = [
    {
      icon: Mountain,
      title: "Outdoor Adventures",
      description: "Hiking, climbing, and exploring nature's computational patterns",
      color: "text-green-600"
    },
    {
      icon: Camera,
      title: "Photography",
      description: "Digital photography and visual storytelling, with technical focus on post-processing",
      color: "text-blue-600"
    },
    {
      icon: Music,
      title: "Music",
      description: "Member of KCL Brass Band, combining musical expression with mathematical precision",
      color: "text-purple-600"
    },
    {
      icon: BookOpen,
      title: "Continuous Learning",
      description: "Always exploring new technologies, methodologies, and interdisciplinary approaches",
      color: "text-orange-600"
    },
    {
      icon: Gamepad2,
      title: "Gaming & Tech",
      description: "Interested in game mechanics, AI applications, and emerging technologies",
      color: "text-red-600"
    },
    {
      icon: Heart,
      title: "Community Impact",
      description: "STEM outreach, mentoring, and helping others discover their potential in technology",
      color: "text-pink-600"
    }
  ];

  const categories = ["All", "Professional", "Research", "Personal"];

  const filteredProjects = selectedCategory === "All"
    ? projects
    : projects.filter(project => project.category === selectedCategory);

  const ProjectCard = ({ project }: { project: Project }) => {
    const Icon = project.icon;

    return (
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-start space-x-4 mb-6">
          <div className={`p-4 bg-gradient-to-br ${project.bgGradient} rounded-xl`}>
            <Icon className="text-white" size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                project.category === 'Professional' ? 'bg-blue-100 text-blue-800' :
                project.category === 'Research' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {project.category}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{project.duration}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6 leading-relaxed">{project.description}</p>

        {project.impact && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-900 mb-1">Impact</p>
            <p className="text-gray-700">{project.impact}</p>
          </div>
        )}

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Award className="mr-2" size={16} />
            Key Achievements
          </h4>
          <ul className="space-y-2">
            {project.achievements.slice(0, 3).map((achievement, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <span className={`w-1.5 h-1.5 bg-gradient-to-r ${project.bgGradient} rounded-full mt-2 flex-shrink-0`}></span>
                <span>{achievement}</span>
              </li>
            ))}
            {project.achievements.length > 3 && (
              <li className="text-sm text-gray-500 ml-4">
                +{project.achievements.length - 3} more achievements
              </li>
            )}
          </ul>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {project.links && (
          <div className="flex space-x-3">
            {project.links.map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${project.bgGradient} text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.type === 'github' ? <Github size={16} /> : <ExternalLink size={16} />}
                <span>{link.label}</span>
              </motion.a>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const InterestCard = ({ interest }: { interest: { icon: React.ElementType; title: string; description: string; color: string } }) => {
    const Icon = interest.icon;

    return (
      <motion.div
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <div className={`inline-flex p-4 ${interest.color} bg-gray-50 rounded-full mb-4`}>
            <Icon size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{interest.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{interest.description}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Projects & Experience</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A showcase of impactful projects across professional, research, and personal domains,
            demonstrating technical expertise and innovative problem-solving.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>

        {/* Interests Section */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Interests & Hobbies</h2>
            <p className="text-xl text-gray-600">
              Beyond professional work, these interests fuel creativity and provide fresh perspectives
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interests.map((interest, index) => (
              <motion.div
                key={interest.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <InterestCard interest={interest} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Hire Me Section */}
        <section className="mb-20">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">Why Hire Samuel?</h2>
              <p className="text-xl text-blue-100">
                Unique combination of technical depth and business acumen
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                  <Zap className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Proven Impact</h3>
                <p className="text-blue-100">
                  Delivered measurable results: 1200% efficiency improvements, 120+ hours saved monthly,
                  and enterprise-wide digital transformation success.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                  <Users className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cross-Functional Leader</h3>
                <p className="text-blue-100">
                  Successfully led teams across technical, business, and research domains,
                  with experience managing 1000+ person operations.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                  <Brain className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation Mindset</h3>
                <p className="text-blue-100">
                  Currently pursuing AI Applications at Imperial College London, constantly learning
                  and applying cutting-edge technologies to solve real-world problems.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Let&apos;s Connect</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <motion.a
                href="mailto:sam.xiaojian.zhang@outlook.com"
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
                whileHover={{ y: -5 }}
              >
                <div className="p-4 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <Mail className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 text-sm">sam.xiaojian.zhang@outlook.com</p>
              </motion.a>

              <motion.a
                href="tel:+447502118207"
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
                whileHover={{ y: -5 }}
              >
                <div className="p-4 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                  <Phone className="text-green-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600 text-sm">07502 118207</p>
              </motion.a>

              <motion.a
                href="https://linkedin.com/in/samuel-xj-zhang/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
                whileHover={{ y: -5 }}
              >
                <div className="p-4 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <Linkedin className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">LinkedIn</h3>
                <p className="text-gray-600 text-sm">Connect professionally</p>
              </motion.a>

              <motion.div
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100"
              >
                <div className="p-4 bg-purple-100 rounded-full mb-4">
                  <MapPin className="text-purple-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600 text-sm">London, UK<br />Flexible to relocate</p>
              </motion.div>
            </div>

            <motion.div
              className="bg-gray-50 rounded-xl p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Make an Impact?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Whether you&apos;re looking for a product manager, AI engineer, digital consultant, or someone who
                can bridge technical and business domains, I&apos;m excited to discuss how we can work together
                to create meaningful solutions.
              </p>
              <div className="flex justify-center space-x-4">
                <motion.a
                  href="mailto:sam.xiaojian.zhang@outlook.com?subject=Opportunity Discussion"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start a Conversation
                </motion.a>
                <motion.button
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open('/cv-samuel-zhang.pdf', '_blank')}
                >
                  <Download size={16} />
                  <span>Download CV</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default ProjectsPage;