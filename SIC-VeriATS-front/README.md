# SIC-VeriATS Frontend

High-Trust Blind Recruitment Platform - Frontend Application

## 🎨 Design Philosophy

- **Mobile-First**: Designed for vertical mobile screens first, scales to desktop
- **Minimalist & Sterile**: Clean, flat design with NO excessive shadows or gradients
- **High-Trust**: Professional color palette conveying validation and truth
- **Accessibility**: 48px+ touch targets, WCAG compliant, keyboard navigation

## 🎯 Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Headless UI + Custom components
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios with JWT interceptors
- **Routing**: TanStack Router

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **SIC Steel** | `#0F4C81` | Primary brand, buttons, links |
| **SIC Verified** | `#065F46` | Success states, validated claims |
| **SIC Rejected** | `#991B1B` | Error states, rejected claims |
| **SIC Pending** | `#64748B` | Neutral states, pending reviews |
| **SIC Ice** | `#F8FAFC` | Background tint |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running at `http://localhost:8000`

### Installation

```bash
cd SIC-VeriATS-front
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── ui/              # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Avatar.tsx
├── hooks/
│   └── useAuth.ts       # Authentication hook
├── pages/
│   └── Login.tsx        # Login page
├── services/
│   ├── api.ts           # Axios client with interceptors
│   ├── auth.service.ts  # Authentication service
│   ├── fair.service.ts  # Job Fair data service
│   └── candidate.service.ts # Candidate profile service
├── types/
│   ├── auth.ts          # Auth types
│   ├── candidate.ts     # Candidate types
│   └── fair.ts          # Job Fair types
├── utils/
│   ├── cn.ts            # Class name merger
│   └── formatters.ts    # Utility formatters
├── App.tsx              # Main app component
├── main.tsx             # React entry point
└── index.css            # Global styles + Tailwind
```

## 🧩 Component Library

### Button
- **Variants**: primary, secondary, destructive, ghost
- **Sizes**: sm, md (48px), lg
- **Features**: Loading state, full-width, mobile-optimized

### Input
- **Features**: Labels, error states, helper text
- **Mobile**: 48px min-height, correct `inputMode`

### Card
- **Variants**: flat (default), elevated
- **Subcomponents**: CardHeader, CardTitle, CardContent
- **Design**: Minimalist with subtle borders

### Badge
- **Variants**: verified, pending, rejected, neutral
- **Sizes**: sm, md

### Avatar
- **Features**: SIC code display, score-based colors
- **Colors**: Red (0-49%), Yellow (50-79%), Green (80-100%)

## 🔐 Authentication

The app uses JWT authentication with automatic token refresh:

```typescript
const { user, login, logout, isLoading } = useAuth()

// Login
login({ email: 'user@example.com', password: '••••••••' })

// Logout
logout()
```

### Token Storage
- Access token: `localStorage` (short-lived)
- Refresh token: `localStorage` (longer-lived)

## 🎯 API Integration

### Base URL

Development: `http://localhost:8000`

Configure via environment variable:

```bash
# .env
VITE_API_URL=http://localhost:8000
```

### API Client

All API calls use the configured Axios client with automatic:
- JWT token injection
- Token refresh on 401 errors
- Error standardization

Example:

```typescript
import apiClient from '@/services/api'

const candidates = await apiClient.get('/candidates')
```

## 📱 Mobile-First Design

All components follow mobile-first principles:

- **Touch Targets**: Minimum 48×48px (WCAG AA)
- **Breakpoints**: Mobile → md:768px → lg:1024px → xl:1280px
- **Responsive**: Padding, font sizes scale appropriately
- **Thumb Zone**: Primary actions at bottom of screen

## 🧪 Testing

```bash
# Run tests
npm run test

# Build validation
npm run build
```

## 🚢 Deployment

The app is static and can be deployed to:
- Vercel / Netlify (recommended)
- Any static file host
- Docker container with Nginx

### Environment Variables

```bash
VITE_API_URL=https://api.sic-veriats.com
```

## 👥 User Roles

The app supports three roles with automatic routing:

- **Admin** → `/admin/validation` - CV validation dashboard
- **Company** → `/company/candidates` - Blind candidate list
- **Candidate** → `/candidate/fair` - Job Fair Portal & Application tracker

## 📝 Next Steps

1. ✅ **Phase 1 Complete**: Project setup, components, auth
2. ✅ **Phase 2 Complete**: Admin dashboard with PDF viewer (integration ready)
3. ✅ **Phase 3 Complete**: Company blind view with censored data
4. ✅ **Phase 4 Complete**: Candidate Job Fair Portal & Application Tracker
5. ✅ **Phase 5 Complete**: Routing and navigation (TanStack Router)

## 🤝 Contributing

Follow the mobile-first and minimalist design principles:
- NO purple, violet, or neon colors
- NO excessive shadows or gradients
- 48px minimum touch targets
- Flat design aesthetic

## 📄 License

ISC
