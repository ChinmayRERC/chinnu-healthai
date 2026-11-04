# Chinnu HealthAI

A privacy-focused health & fitness companion built for real life. Track food, movement, recovery, yoga, workouts, and get AI coaching — all in one app.

## Live Demo

[**https://chinnu-healthai-v2.onrender.com/**](https://chinnu-healthai-v2.onrender.com/)

![Chinnu HealthAI Login Page](login-page.png)

## New Features

- **AI Coach (Chat)** - Conversational health & fitness assistant powered by NVIDIA models via Supabase Edge Functions
- **Real-Time AI Vision Coach** - Camera-based form coaching with live cues during workouts/yoga
- **Food Recognition** - Snap a photo of your meal to instantly get calories, protein, carbs, fat & fiber
- **Supabase Integration** - Auth (Email Magic Link, Google, GitHub), cloud sync, and secure data storage
- **Meals Database** - Track meals with Supabase Postgres storage
- **On-Device Camera Coaching** - Pose tracking with TensorFlow.js/MediaPipe for form analysis
- **Yoga & Guided Workouts** - Built-in library with exercise details, videos, and trainer mode
- **Progress Tracking** - Monitor steps, water, sleep, weight, and workout history
- **PWA Support** - Install as an app on mobile/desktop with offline capabilities
- **Dark/Light Optimized UI** - Clean, modern interface built with React + TypeScript + Vite

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** Supabase (Auth, Postgres, Edge Functions, Storage)
- **AI/ML:** NVIDIA API, TensorFlow.js, MediaPipe
- **Deployment:** Render

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file with the following:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_FUNCTIONS_URL=your_supabase_functions_url
```

## License

MIT
