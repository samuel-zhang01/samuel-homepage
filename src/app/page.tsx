"use client";

import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Database,
  Brain,
  MapPin,
  Phone,
  Mail,
  Linkedin
} from "lucide-react";

const Hero = () => (
  <motion.section
    className="relative py-20 px-4 text-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <User size={64} className="text-white" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Samuel X.J. Zhang</h1>
        <p className="text-xl text-blue-100 mb-6">
          Product Manager • AI Engineer • Digital Consultant
        </p>
        <div className="flex items-center justify-center space-x-6 text-blue-100">
          <div className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>London, UK</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone size={16} />
            <span>07502 118207</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail size={16} />
            <span>sam.xiaojian.zhang@outlook.com</span>
          </div>
        </div>
      </motion.div>

      <motion.p
        className="text-lg leading-relaxed text-blue-50 max-w-3xl mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Innovative technologist with 2.5+ years at Pfizer leading digital transformation initiatives.
        Currently pursuing MSc in AI Applications at Imperial College London, combining deep technical expertise
        with proven product management skills to drive meaningful business impact.
      </motion.p>
    </div>
  </motion.section>
);

const EducationCard = ({
  title,
  institution,
  date,
  details,
  achievements
}: {
  title: string;
  institution: string;
  date: string;
  details: string[];
  achievements?: string[];
}) => (
  <motion.div
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start space-x-4">
      <div className="p-3 bg-blue-100 rounded-lg">
        <GraduationCap className="text-blue-600" size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-blue-600 font-medium mb-1">{institution}</p>
        <p className="text-gray-600 text-sm mb-3">{date}</p>
        <ul className="text-gray-700 space-y-1 text-sm">
          {details.map((detail: string, index: number) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
        {achievements && (
          <div className="mt-3 flex flex-wrap gap-2">
            {achievements.map((achievement: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {achievement}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const ExperienceCard = ({
  role,
  company,
  date,
  location,
  achievements
}: {
  role: string;
  company: string;
  date: string;
  location: string;
  achievements: string[];
}) => (
  <motion.div
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start space-x-4">
      <div className="p-3 bg-purple-100 rounded-lg">
        <Briefcase className="text-purple-600" size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{role}</h3>
        <p className="text-purple-600 font-medium mb-1">{company}</p>
        <p className="text-gray-600 text-sm mb-3">{date} • {location}</p>
        <ul className="text-gray-700 space-y-2 text-sm">
          {achievements.map((achievement: string, index: number) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

const SkillCategory = ({
  title,
  icon: Icon,
  skills,
  color
}: {
  title: string;
  icon: React.ElementType;
  skills: string[];
  color: string;
}) => (
  <motion.div
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className={`p-3 ${color} rounded-lg`}>
        <Icon className="text-white" size={24} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill: string, index: number) => (
        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors">
          {skill}
        </span>
      ))}
    </div>
  </motion.div>
);

export default function Home() {
  const education = [
    {
      title: "MSc Artificial Intelligence Applications and Innovation",
      institution: "Imperial College London",
      date: "Sep 2025 – Sep 2026",
      details: [
        "Entrepreneurship-focused curriculum with AI venture development and business case creation",
        "Leading cross-functional teams in developing AI software products with comprehensive business cases",
        "Partnership opportunities with Imperial Business School for real-world AI product development"
      ]
    },
    {
      title: "BSc Chemistry with Biomedicine with Placement",
      institution: "King's College London",
      date: "Sept 2021 – May 2025",
      details: [
        "Final Project: Designed innovative drug discovery solutions using computational modeling (SwissDock and AlphaFold 3)",
        "Core Modules: Computational Chemistry, Physical Chemistry, Computational Structural Biology",
        "Student Representative (2021-2023); Department Representative (2023)"
      ],
      achievements: ["1st Class Honours", "Royal Society of Chemistry Accreditation"]
    }
  ];

  const experience = [
    {
      role: "Product Owner & Technical Lead",
      company: "Pfizer - Digital Solutions, Analytical R&D",
      date: "Sept 2023 – Present",
      location: "Sandwich, UK",
      achievements: [
        "Led end-to-end product development of GROWMAT enterprise resource management platform achieving department-wide adoption",
        "Delivered measurable business impact: 1200% efficiency improvement and 120+ person-hours saved monthly",
        "Created comprehensive technical documentation including user manuals, PDFs, and video tutorials",
        "Built data-driven analytics dashboard with 99.9% uptime and 80% performance improvement"
      ]
    },
    {
      role: "Personal Assistant to Commander",
      company: "Singapore Civil Defence Force (SCDF)",
      date: "Jul 2019 – Jul 2021",
      location: "Singapore",
      achievements: [
        "Led digital transformation initiative for 1,000+ frontline responders",
        "Developed predictive analytics solution using MATLAB for COVID-19 resource planning",
        "Achieved 300% improvement in emergency response time through process automation",
        "Received Service Excellence Award and promotion to Sergeant"
      ]
    }
  ];

  const skillCategories = [
    {
      title: "Programming & Development",
      icon: Code,
      color: "bg-blue-500",
      skills: ["Python", "JavaScript", "TypeScript", "Julia", "React", "Next.js", "Node.js", "Docker"]
    },
    {
      title: "Data & Analytics",
      icon: Database,
      color: "bg-green-500",
      skills: ["PostgreSQL", "SQL", "Power BI", "Spotfire", "MATLAB", "Excel", "Statistical Analysis", "Data Visualization"]
    },
    {
      title: "AI & Machine Learning",
      icon: Brain,
      color: "bg-purple-500",
      skills: ["Machine Learning", "Deep Learning", "AI Applications", "Predictive Analytics", "Computational Modeling", "GROMACS"]
    },
    {
      title: "Product & Business",
      icon: Briefcase,
      color: "bg-orange-500",
      skills: ["Product Strategy", "Agile Methodologies", "Stakeholder Management", "User Research", "Go-to-Market", "KPI Definition"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Education Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Education</h2>
            <p className="text-xl text-gray-600">Academic foundation in technology and business innovation</p>
          </motion.div>

          <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <EducationCard {...edu} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Experience</h2>
            <p className="text-xl text-gray-600">Proven track record of delivering impactful digital solutions</p>
          </motion.div>

          <div className="grid md:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <ExperienceCard {...exp} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technical Skills</h2>
            <p className="text-xl text-gray-600">Comprehensive expertise across technology and business domains</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {skillCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <SkillCategory {...category} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Links */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Let&apos;s Connect</h2>
          <div className="flex justify-center space-x-8">
            <motion.a
              href="https://linkedin.com/in/samuel-xj-zhang/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </motion.a>
            <motion.a
              href="mailto:sam.xiaojian.zhang@outlook.com"
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail size={20} />
              <span>Email</span>
            </motion.a>
          </div>
        </div>
      </section>
    </div>
  );
}
