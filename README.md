# Samuel Zhang - Interactive Portfolio

A modern, responsive portfolio website showcasing expertise in Product Management, AI/ML Engineering, Digital Consultancy, Analytical Chemistry, and Finance.

## 🚀 Features

- **Interactive Skills Showcase**: Detailed modal views for each skill area with achievements and technologies
- **Comprehensive Project Portfolio**: Professional, research, and personal projects with filtering
- **Modern UI/UX**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Mobile Responsive**: Optimized for all device sizes
- **SEO Optimized**: Proper metadata and semantic HTML

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Docker with Docker Compose

## 📦 Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### One-Command Deployment

```bash
./deploy.sh
```

This script will:
1. Build the Next.js application
2. Create the Docker image
3. Start the container on port 1111

### Manual Docker Commands

```bash
# Build and start the application
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart the application
docker-compose restart
```

### Access the Application
- **Local**: http://localhost:1111
- **Production**: Replace `localhost` with your server's IP/domain

## 🔧 Development Setup

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
samuel-homepage/
├── src/
│   ├── app/
│   │   ├── page.tsx           # About/CV page
│   │   ├── skills/page.tsx    # Interactive skills showcase
│   │   ├── projects/page.tsx  # Projects and contact
│   │   └── layout.tsx         # Root layout with navigation
│   └── components/
│       └── Navigation.tsx     # Navigation component
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Docker image definition
├── deploy.sh                  # Deployment script
└── next.config.js            # Next.js configuration
```

## 🌟 Key Pages

### 1. About/CV (Homepage)
- Professional summary and contact information
- Education details (Imperial College London, King's College London)
- Professional experience (Pfizer, Singapore Civil Defence Force)
- Technical skills categorization

### 2. Skills Showcase
- **Product Manager**: GROWMAT development, user research, cross-functional leadership
- **ML Engineer**: AI applications, computational modeling, predictive analytics
- **Digital Consultancy**: Digital transformation, process optimization, change management
- **Analytical Chemist**: Pharmaceutical analysis, computational chemistry, drug discovery
- **Finance**: Financial modeling, ROI analysis, resource planning

### 3. Projects & Contact
- Featured projects with detailed descriptions and achievements
- Personal interests and hobbies
- Comprehensive contact information
- "Why hire me" value proposition

## 🚀 Deployment Options

### Docker (Recommended)
```bash
# Using the deployment script
./deploy.sh

# Or manually
docker-compose up -d --build
```

### Traditional Hosting
```bash
npm run build
npm start
```

### Cloud Platforms
- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `out/` folder after running `npm run build`
- **AWS/GCP/Azure**: Use the Docker image with container services

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
# Add other environment variables as needed
```

### Port Configuration
- **Development**: Port 3000
- **Docker**: Port 1111 (mapped from container's 3000)
- **Custom**: Modify `docker-compose.yml` port mapping

## 📱 Responsive Design

The website is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🎨 Customization

### Colors and Theming
The design uses a cohesive color scheme defined in Tailwind classes:
- Primary: Blue gradient (`from-blue-600 to-purple-600`)
- Secondary: Various accent colors for different sections
- Background: Light gradient (`from-slate-50 to-blue-50`)

### Content Updates
- **Personal Information**: Update in `src/app/page.tsx`
- **Skills**: Modify `skillsData` in `src/app/skills/page.tsx`
- **Projects**: Update `projects` array in `src/app/projects/page.tsx`

## 🔍 SEO and Performance

- **Meta Tags**: Comprehensive metadata in `layout.tsx`
- **Semantic HTML**: Proper heading structure and accessibility
- **Image Optimization**: Next.js Image component for optimized loading
- **Performance**: Lighthouse score optimized for Core Web Vitals

## 🤝 Contributing

This is a personal portfolio, but suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Contact

- **Email**: sam.xiaojian.zhang@outlook.com
- **Phone**: 07502 118207
- **LinkedIn**: [samuel-xj-zhang](https://linkedin.com/in/samuel-xj-zhang/)
- **Location**: London, UK (Flexible to relocate)

## 📄 License

This project is for personal portfolio use. Feel free to use as inspiration for your own portfolio.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
