# PromptHub

A modern platform for discovering, saving, and sharing AI prompts. Built with React Router v7, TypeScript, Tailwind CSS, and Supabase.

![PromptHub Screenshot](https://via.placeholder.com/800x400?text=PromptHub+Screenshot)

## Features

- **Discover Prompts** - Browse and search through a collection of AI prompts
- **Filter & Sort** - Filter by category, AI platform, input type, and more
- **User Authentication** - Sign up with email or OAuth (Google, GitHub)
- **Create & Share** - Create your own prompts and share them with the community
- **Save Prompts** - Bookmark prompts for quick access later
- **Rate & Review** - Rate prompts with a 5-star system
- **User Profiles** - Public profiles showcasing user's prompts
- **Dark/Light Mode** - Theme toggle for comfortable viewing
- **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

- **Framework:** [React Router v7](https://reactrouter.com/) (Full-stack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** [Supabase](https://supabase.com/) (Auth, Database, Storage)
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prompthub.git
cd prompthub
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Set up Supabase database (see [Supabase Setup](#supabase-setup))

6. Start the development server:
```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

## Supabase Setup

### 1. Create Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- See supabase/migrations/ folder for complete SQL scripts
```

### 2. Enable Authentication Providers

1. Go to Authentication > Providers
2. Enable Email provider
3. (Optional) Enable Google and GitHub OAuth

### 3. Create Storage Bucket

1. Go to Storage
2. Create a new bucket named `avatars`
3. Make it public

### 4. Configure URL Settings

1. Go to Authentication > URL Configuration
2. Add your site URL and redirect URLs

## Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI

# Type checking
npm run typecheck    # Run TypeScript check
```

## Project Structure

```
prompthub/
├── app/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── custom/      # Custom components (StarRating, Pagination)
│   │   ├── layout/      # Layout components (Header, Footer)
│   │   ├── prompt/      # Prompt-related components
│   │   ├── search/      # Search & filter components
│   │   └── auth/        # Auth components
│   ├── routes/          # File-based routing
│   ├── hooks/           # Custom hooks
│   ├── lib/
│   │   ├── api/         # API functions
│   │   ├── supabase/    # Supabase client
│   │   └── utils/       # Utilities
│   ├── context/         # React contexts
│   └── types/           # TypeScript types
├── tests/
│   ├── unit/            # Unit tests
│   ├── e2e/             # E2E tests
│   └── mocks/           # Test mocks
├── docs/                # Documentation
└── supabase/
    └── migrations/      # Database migrations
```

## API Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with prompt list |
| `/auth/login` | Login page |
| `/auth/register` | Registration page |
| `/prompts/:id` | Prompt detail page |
| `/prompts/new` | Create new prompt |
| `/prompts/:id/edit` | Edit prompt |
| `/profile` | Current user's profile |
| `/profile/:username` | Public user profile |
| `/settings` | User settings |

## Categories

- Image Generation
- Programming
- Writing/Content
- Design
- Translation
- Life Coach
- Education
- Business
- Fun/Creative
- Roleplay
- Marketing
- SEO
- Technology
- Science
- Legal
- Finance
- Health
- Trivia
- Academia

## AI Platforms

- ChatGPT
- Claude
- Gemini
- Midjourney
- DALL-E
- Stable Diffusion
- Copilot

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [React Router](https://reactrouter.com/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

Built with love for the AI community.
