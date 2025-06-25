# 🧠 AI Candidate Screening Dashboard

A modern, high-performance frontend application for AI-powered candidate screening and evaluation. Built with Next.js, React, and PostgreSQL, featuring real-time updates, interactive data visualizations, and a recruiter-friendly interface.

![AI Screening Dashboard](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

## 🎯 Features

### Core Functionality
- **AI-Powered Analysis**: Integrates with n8n backend workflow for intelligent resume parsing and evaluation
- **Real-time Progress Tracking**: WebSocket-based live updates during analysis
- **Interactive Visualizations**: Multiple chart types for comprehensive candidate insights
- **Dark Mode Support**: Full theme switching capability
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Key Components
- **Job Intake Form**: Submit requirements via job title or full description
- **Progress Tracker**: Real-time analysis status with step-by-step progress
- **Candidate Dashboard**: Comprehensive view with filtering and sorting
- **Comparison Tool**: Side-by-side comparison of up to 3 candidates
- **Interview Scheduler**: Built-in calendar integration
- **Error Monitoring**: Track and retry failed analyses

### Data Visualizations
- 📊 **Skill Radar Chart**: Multi-dimensional skill comparison
- 📈 **Candidate Bar Chart**: Rankings and score breakdowns
- 🗺️ **Skill Heatmap**: Supply vs demand analysis
- 🫧 **Persona Bubble Chart**: Candidate archetype mapping
- 📉 **Score Distribution**: Statistical insights
- 🌳 **Treemap**: Hierarchical data representation

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL 13+ database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/ai-candidate-screening.git
cd ai-candidate-screening
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Set up the database**
```bash
# Run the PostgreSQL schema from pgadmin4.sql
psql -U your_user -d your_database -f pgadmin4.sql
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
/frontend-ui
├── /components          # Reusable React components
│   ├── Header.jsx      # Navigation header with dark mode
│   ├── InputForm.jsx   # Job requirement input form
│   ├── ProgressBar.jsx # Real-time progress tracking
│   ├── CandidateCard.jsx # Individual candidate display
│   └── Chart*.jsx      # Various chart components
├── /pages              # Next.js pages (routes)
│   ├── index.js        # Home page with job intake
│   ├── dashboard.js    # Main analysis dashboard
│   ├── /candidates     # Candidate-related pages
│   └── /interviews     # Interview scheduling pages
├── /services           # API and database services
│   ├── api.js          # Backend API integration
│   └── dbAdapter.js    # PostgreSQL connection
├── /styles             # Global styles and Tailwind config
└── /utils              # Helper functions and utilities
```

## 🎨 Design System

### Color Palette
- **Sakura**: `#DFB1B6` - Primary accent
- **Astral Ink**: `#101E42` - Dark backgrounds
- **Cold Current**: `#234272` - Secondary accent
- **Spooled White**: `#F5EAE3` - Light backgrounds
- **Pink Ballad**: `#A6427C` - Interactive elements

### Typography
- **Display Font**: Outfit (headings)
- **Body Font**: Inter (content)

## 🔧 Configuration

### Database Schema
The application uses a comprehensive PostgreSQL schema including:
- `analysis_jobs` - Job tracking and status
- `candidates` - Candidate information
- `candidate_evaluations` - AI evaluation results
- `job_requirements` - Role specifications
- `interview_schedules` - Interview management
- And more...

### API Integration
The frontend integrates with:
- **Webhook**: `POST /webhook/submit-resume-analysis`
- **WebSocket**: Real-time progress updates
- **REST API**: Data fetching and mutations

## 📊 Key Features Explained

### 1. Job Intake
Users can submit job requirements either by:
- Entering a job title (triggers JD search in backend)
- Pasting a full job description

### 2. Real-time Progress
- WebSocket connection for live updates
- Visual progress bar with step indicators
- Statistics on candidates processed/skipped

### 3. Interactive Dashboard
- Filter candidates by skills
- Sort by various criteria
- Export data to Excel
- Compare multiple candidates

### 4. Chart Interactions
- Click on chart segments to filter data
- Hover for detailed tooltips
- Toggle between different view modes

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed sample data
```

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Tailwind CSS for styling

## 🚢 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Ensure all production environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL

### Deployment Platforms
Compatible with:
- Vercel (recommended for Next.js)
- AWS Amplify
- Netlify
- Docker containers

## 📈 Performance Optimization

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Using Next.js Image component
- **Lazy Loading**: Components loaded on demand
- **Debounced Filters**: Prevents excessive re-renders
- **React Query**: Intelligent caching and refetching

## 🔒 Security Considerations

- Environment variables for sensitive data
- SQL injection prevention via parameterized queries
- XSS protection with React's built-in escaping
- CORS configuration for API requests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern HR tech platforms
- Chart.js for powerful data visualizations
- Framer Motion for smooth animations
- Tailwind CSS for rapid UI development

## 📞 Support

For support, email support@fourentech.ai or open an issue in the repository.

---

Built with ❤️ by the FourenTech AI Team