"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Briefcase,
  Code,
  Database,
  Brain,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Calendar,
  Clock
} from "lucide-react";
import Image from "next/image";

const calculatePfizerExperience = (): string => {
  const startDate = new Date('2023-09-01');
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears.toFixed(1);
};

const calculateDuration = (dateRange: string): string => {
  const [startStr, endStr] = dateRange.split(' – ');

  // Parse dates
  const parseDate = (dateStr: string): Date => {
    if (dateStr === 'Present') return new Date();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [monthStr, year] = dateStr.split(' ');
    const monthIndex = months.indexOf(monthStr);
    return new Date(parseInt(year), monthIndex);
  };

  const startDate = parseDate(startStr);
  const endDate = parseDate(endStr);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);

  // Add 1 month to include the starting month
  // diffMonths += 1;

  if (diffMonths < 12) {
    return `${Math.round(diffMonths)} months`;
  } else {
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = Math.round(diffMonths % 12);
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  }
};


const TimelineExperienceCard = ({
  role,
  company,
  date,
  location,
  achievements,
  index,
  isLast
}: {
  role: string;
  company: string;
  date: string;
  location: string;
  achievements: string[];
  index: number;
  isLast: boolean;
}) => {
  const duration = calculateDuration(date);
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      className={`flex items-center w-full mb-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
    >
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg z-10"></div>
        {!isLast && (
          <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500 to-purple-600 mt-2"></div>
        )}
      </div>

      {/* Content card */}
      <div className={`flex-1 max-w-lg ${isLeft ? 'md:ml-8 ml-4' : 'md:mr-8 mr-4'}`}>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Briefcase className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{role}</h3>
              <p className="text-blue-600 font-medium mb-1">{company}</p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-gray-600 text-sm">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span className="break-all">{date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>{duration}</span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1">{location}</p>
            </div>
          </div>

          <ul className="space-y-1 text-gray-700 text-sm">
            {achievements.map((achievement: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span dangerouslySetInnerHTML={{ __html: achievement.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Hero = () => (
  <motion.section
    className="relative py-12 sm:py-16 lg:py-20 px-4 text-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white w-full overflow-x-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <div className="max-w-4xl mx-auto w-full">
      <motion.div
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.8 }}
      >
        <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white/30 shadow-lg">
          <Image
            src="/headshot.jpeg"
            alt="Samuel X.J. Zhang"
            width={160}
            height={160}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Samuel X.J. Zhang</h1>
        <p className="text-lg sm:text-xl text-blue-100 mb-6">
          Product Manager • AI Engineer • Digital Consultant • Analytical Chemist
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-blue-100 text-sm sm:text-base">
          <div className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>London, UK</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone size={16} />
            <span>+44 7502 118207</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail size={16} />
            <span className="break-all">sam.xiaojian.zhang@outlook.com</span>
          </div>
        </div>
      </motion.div>

      <motion.p
        className="text-base sm:text-lg leading-relaxed text-blue-50 max-w-3xl mx-auto px-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Innovative technologist with {calculatePfizerExperience()} years at Pfizer leading digital transformation initiatives.
        Currently pursuing MSc in AI Applications and Innovation at Imperial College London, combining deep technical expertise
        with proven product management skills to drive meaningful and measurable business impact.
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
              <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
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



export default function Home() {
  const router = useRouter();

  const education = [
    {
      title: "MSc Artificial Intelligence Applications and Innovation",
      institution: "Imperial College London",
      date: "Sep 2025 – Sep 2026",
      details: [
        "Delivered through I-X flagship initiative combining **Computing**, **Engineering**, **Mathematics**, and **Business** departments",
        "**Entrepreneurship-focused** curriculum with **AI venture** module working with **cross-multidisciplinary** teams developing AI solutions with comprehensive business cases and **investor pitch** presentations",
        "**Industry partnership** opportunities for real-world **AI product** development through internships (May 2026 – Sept 2026)"
      ],
      achievements: ["Python", "Deep Learning", "Machine Learning","Innovation Management", "ML for Climate Change", "Generative Modelling", "AI in Medical Imaging"]
    },
    {
      title: "BSc Chemistry with Biomedicine with Placement",
      institution: "King's College London",
      date: "Sept 2021 – May 2025",
      details: [
        "Final Project: Designed innovative **drug discovery solutions** using **computational modeling** (SwissDock and AlphaFold 3)",
        "Core Modules: Computational Chemistry, Physical Chemistry, Organic Chemistry, Analytical Chemistry, Computational Structural Biology, Inorganic Chemistry",
        "**Created** Coding Series: **Coding and programming initiative** for department of  Natural Mathematical and Engineering Sciences  (NMES) (Sep 2022 – Apr 2025)",
        "Chemistry Department Student Representative (2021-2023), NMES Department Representative (2023)",
        "Industrial Placement @ Pfizer Sandwich (Sept 2023 – Sept 2024)"
      ],
      achievements: ["1st Class Honours (78%)", "Royal Society of Chemistry Accreditation", "Associate of King's College", "Coding Series"]
    }
  ];

  const experience = [
    {
      role: "Web Application Developer, Product Owner (Contract)",
      company: "Pfizer",
      date: "Oct 2024 – Present",
      location: "London, Remote",
      achievements: [
        "**Product owner** and **fullstack developer** for **GROWMAT** - Pfizer's mission-critical workflow management system",
        "Develop **roadmap**, prioritize features, conduct **A/B testing** to satisfy evolving requirements",
        "Maintain comprehensive **end-user documentation** and stakeholder communication",
        "Lead collaborative development with team and Pfizer management for continuous improvement"
      ]
    },
    {
      role: "Data Analyst Undergraduate in Analytical R&D Informatics Team (Placement)",
      company: "Pfizer",
      date: "Sep 2023 – Sep 2024",
      location: "Sandwich, UK",
      achievements: [
        "**Led development** of **GROWMAT** - department-wide workflow management system facilitating **all preclinical drug testing** for Pfizer",
        "**Architected full-stack solution** using **Next.js**, **Julia**, **PostgreSQL**, and **Spotfire** with real-time visualisations, deployed with **Docker**",
        "Developed Active Pharmaceutical Ingredients **solubility modeling tool** using **PC-SAFT theory** and **machine learning** (Differential Evolution, Evolutionary Centers Algorithm)",
        "Implemented **robust backend** with concurrency protection and **3-tier disaster recovery**",
        "Created comprehensive **documentation and training materials** ensuring long-term sustainability"
      ]
    },
    {
      role: "STEM Outreach Officer & Coding Series Founder (Societies & Initiatives)",
      company: "King's College London Chemistry Society",
      date: "Sep 2022 – Apr 2025",
      location: "London, UK",
      achievements: [
        "**Founded** and led development of **>20 hours** computational skills course for chemistry department",
        "Designed curriculum covering **Excel**, **Python**, **data analysis**, and **scientific computing**",
        "**Trained 80+ students** across 20 sessions, receiving **90% positive feedback**",
        "Secured departmental and **Royal Society Endorsement** for continued support"
      ]
    },
    {
      role: "Royal Society of Chemistry Research Bursary (Research Internship)",
      company: "King's College London",
      date: "May 2023 – Jul 2023",
      location: "London, UK",
      achievements: [
        "Conducted **interdisciplinary research** on biological membrane organisation and **protein-lipid co-assembly**",
        "Applied **molecular dynamics simulations** using **GROMACS** on King's supercomputer",
        "Developed **self-hosted, GPU-accelerated infrastructure**, reducing simulation time by **70%**",
        "Investigated **protein folding mechanisms** during synthesis and lipid bilayer interactions"
      ]
    },
    {
      role: "King's Undergraduate Research Fellowship (Research Internship)",
      company: "King's College London",
      date: "Jun 2022 – Jul 2022",
      location: "London, UK",
      achievements: [
        "Conducted **molecular recognition research** through The King's Undergraduate **Research Fellowship** (KURF)",
        "Investigated structural determination of odorant compounds using chirped-pulse broadband **rotational microwave spectroscopy**",
        "Optimised **data analysis pipelines** using **Excel** and **MATLAB**, improving efficiency by **40%**",
        "Received King's College London **Research Experience Award** (2022)"
      ]
    },
    {
      role: "Personal Assistance to Commander, Personnel Serviceman (National Service)",
      company: "Singapore Civil Defence Force (SCDF)",
      date: "Jul 2019 – Jul 2021",
      location: "Singapore",
      achievements: [
        "Served **dual role** as **Commander's Personal Assistant** and **HR Personnel Officer**",
        "Managed welfare and HR operations for **1,000+ frontline workers**",
        "Developed **predictive models** for **COVID-19 transmission** using **MATLAB**",
        "**Automated and revolutionised** HR operations through Excel, VBA, and MS Access integration, reducing response time by **300%**",
        "Received **Service Excellence Award** and promotion to **Sergeant**"
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      <Hero />

      {/* Education Section */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50 w-full">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Education</h2>
            <p className="text-lg sm:text-xl text-gray-600">Academic foundation in technology and business innovation</p>
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

      {/* Experience Timeline Section */}
      <section className="py-12 sm:py-16 px-4 bg-white w-full">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            className="text-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Professional and Research Experience Timeline</h2>
            <p className="text-lg sm:text-xl text-gray-600">Journey across roles with detailed timelines and impactful achievements</p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {experience.map((exp, index) => (
              <TimelineExperienceCard
                key={index}
                role={exp.role}
                company={exp.company}
                date={exp.date}
                location={exp.location}
                achievements={exp.achievements}
                index={index}
                isLast={index === experience.length - 1}
              />
            ))}
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-8 px-4 bg-white w-full">
        <div className="max-w-4xl mx-auto text-center w-full">
          <p className="text-lg text-gray-700 mb-4">
            View my {""}
            <motion.button
              onClick={() => {
                router.push('/skills');
              }}
              className="relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-lg cursor-pointer border-2 border-transparent hover:border-blue-300"
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
                background: "linear-gradient(to right, #7c3aed, #2563eb)",
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.8)"
              }}
              whileTap={{
                scale: 0.9,
                rotate: 0
              }}
              style={{
                filter: "drop-shadow(0 0 15px rgba(59, 130, 246, 0.4))"
              }}
            >
              <span className="relative z-10 text-lg">✨ Skillsets ✨</span>
            </motion.button>
          </p>
        </div>
      </section>

      {/* Contact Links */}
      <section className="py-8 sm:py-12 px-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white w-full">
        <div className="max-w-4xl mx-auto text-center w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Let&apos;s Connect</h2>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8">
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
