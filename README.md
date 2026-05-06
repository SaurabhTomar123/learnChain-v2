# LearnChain.in — Developer Roadmap & Learning Platform

A comprehensive, peer-reviewed learning platform providing structured career roadmaps and curated courses for software engineers at every level—from entry-level developers to senior architects.

## 🎯 Platform Overview

LearnChain.in combines the visual clarity of roadmap.sh with the course curation of Class Central, powered by community insights from Reddit, Blind, and LinkedIn. The platform features six primary roadmaps covering diverse career paths in software engineering.

### Available Roadmaps

1. **SDE-1 (Entry-Level)** — 6-12 months, ₹8-20 LPA / $77K-$126K
2. **SDE-2 (Mid-Level)** — 2-4 years, ₹15-40 LPA / $86K-$141K
3. **SDE-3 (Senior Engineer)** — 5+ years, ₹30-60+ LPA / $92K-$152K
4. **Spring Boot Developer** — 3-6 months, ₹12-30 LPA / $80K-$130K
5. **.NET Developer** — 3-6 months, ₹12-30 LPA / $80K-$130K
6. **Junior Developer / Career Switcher** — 6-12 months, ₹6-15 LPA / $60K-$100K

## 🏗️ Architecture

### Layout Structure

- **Left Column (70%):** Main educational content — roadmaps, curated courses, community insights, must-master factors
- **Right Column (30%):** Sticky navigation sidebar with quick-jump links, ad zones, and newsletter signup
- **Mobile:** Responsive stack with collapsible hamburger menu and inline ad placement

### Tech Stack

- **Frontend:** React 19 + Tailwind CSS 4 + Framer Motion
- **Routing:** Wouter (lightweight client-side routing)
- **Components:** shadcn/ui + custom components
- **Comments:** Giscus (GitHub Discussions-powered)
- **Analytics:** Plausible + Google Analytics 4
- **Hosting:** Vercel (or Manus built-in hosting)

## 📁 Project Structure

```
learnchain/
├── client/
│   ├── public/              # Static files (favicon, robots.txt)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── RoadmapCard.tsx
│   │   │   ├── RoadmapModule.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   └── CommunityInsights.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── RoadmapPage.tsx
│   │   │   └── NotFound.tsx
│   │   ├── data/            # Content data
│   │   │   └── roadmaps.json
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── App.tsx          # Root component with routing
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles & design tokens
│   └── index.html           # HTML template
├── server/                  # Express server (static hosting)
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Design System

### Color Palette

- **Primary:** Teal (#0891b2) — CTAs and highlights
- **Accent:** Emerald (#10b981) — Success states and positive indicators
- **Background:** White (#ffffff) — Light theme
- **Foreground:** Deep Slate (#1a2332) — Text and structure
- **Secondary:** Neutral Grays (#f1f5f9 - #e2e8f0) — Backgrounds and subtle divisions

### Typography

- **Display:** Geist (geometric sans-serif) — Titles and headers
- **Body:** Inter — All body text and UI elements

### Components

- **Cards:** Subtle shadows, soft borders, hover lift effect
- **Buttons:** Teal primary, secondary variants
- **Badges:** Hexagonal rating badges, difficulty indicators
- **Roadmap Nodes:** Circular interactive nodes with hover animations
- **Sidebar:** Sticky navigation with smooth scroll behavior

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm check

# Format code
pnpm format
```

### Development

1. Navigate to `http://localhost:3000`
2. The dev server watches for changes and hot-reloads
3. Check `client/src/index.css` for design tokens and global styles

### Content Management

All roadmap and course data is stored in `client/src/data/roadmaps.json`. To add or update content:

1. Edit the JSON file with new roadmaps, modules, or courses
2. The changes will automatically reflect on the corresponding pages
3. No code rebuild required for content updates

## 📊 Content Structure

### Roadmap Data Model

Each roadmap includes:

- **Metadata:** ID, title, role, timeline, difficulty, salary ranges (India & US)
- **Modules:** Learning path with 6-8 structured modules
- **Topics:** Specific skills and concepts within each module
- **Community Insights:** Real quotes from Reddit, Blind, LinkedIn
- **Must-Master Factors:** Non-negotiable skills for the role

### Course Data Model

Each course includes:

- **Platform & Instructor:** Source and creator information
- **Ratings & Reviews:** Star rating, review count, student count
- **Duration & Pricing:** Time commitment and cost tier
- **Community Verdict:** Real feedback from learners
- **Affiliate Link:** Monetization link (clearly marked)

## 💰 Monetization Strategy

### Tier 1 — Passive Revenue

- **Display Ads:** Google AdSense (300x250, 300x600 sticky zones)
- **Affiliate Marketing:** Udemy (7-15%), Coursera (10-45%), Amazon Associates

### Tier 2 — Active Revenue (Future)

- **Sponsored Roadmap Sections:** $500-$5,000 per placement
- **Premium Newsletter:** Weekly job alerts + course discounts ($5-$10/month)
- **Digital Products:** Interview cheat sheets, system design templates

### Tier 3 — Scale Revenue (10K+ email subs)

- **Job Board:** Curated junior/mid-level dev roles
- **Mentorship Matching:** Connect learners with SDE-2/3 mentors
- **White-Label Roadmaps:** License to universities/bootcamps

## 🔍 SEO & Analytics

### URL Structure

- `/` — Home page
- `/roadmap/:roadmapId` — Individual roadmap pages (e.g., `/roadmap/sde-1`)

### Meta Tags

Each page includes:

- Descriptive title with salary ranges and timeline
- Meta description optimized for search
- Open Graph tags for social sharing
- Schema markup (CourseList, FAQPage, HowTo)

### Analytics

- Plausible for privacy-friendly analytics
- Google Analytics 4 for detailed insights
- Track: time on page, roadmap clicks, affiliate click-through rates

## 📱 Responsive Design

- **Mobile:** Stack layout, collapsible sidebar, inline ads
- **Tablet:** Two-column layout with adjusted spacing
- **Desktop:** Full three-column layout (content + sidebar + ads)

## 🔐 Security & Privacy

- No user accounts or authentication (MVP version)
- Giscus comments moderated via GitHub Discussions
- Affiliate links clearly marked as sponsored content
- GDPR-compliant analytics (Plausible)

## 🛠️ Customization

### Adding a New Roadmap

1. Add entry to `roadmaps` array in `client/src/data/roadmaps.json`
2. Define modules, topics, and community insights
3. Add related courses to `courses` array
4. The new roadmap automatically appears on home page and sidebar

### Updating Affiliate Links

Replace placeholder affiliate URLs in `client/src/data/roadmaps.json` with your actual affiliate codes. All links are clearly marked as sponsored content.

### Configuring Giscus Comments

1. Create a GitHub repository for discussions
2. Update `data-repo`, `data-repo-id`, `data-category-id` in `RoadmapPage.tsx`
3. Giscus will automatically moderate comments based on GitHub settings

## 📈 Success Metrics

- **Engagement:** 4+ minutes average time on page
- **Monetization:** 8-12% affiliate click-through rate
- **Community:** High-quality comments, user-generated resources
- **SEO:** Ranking for "[Role] roadmap 2026", "[Role] salary India"

## 🤝 Contributing

To contribute improvements:

1. Create a feature branch
2. Make changes to components or content
3. Test thoroughly on mobile and desktop
4. Submit a pull request

## 📝 License

This project is proprietary. All rights reserved.

## 📧 Support

For questions or feedback, please reach out through the contact form on the website.

---

**Built with ❤️ for developers by developers**
