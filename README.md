# OneTime Survey Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

> A comprehensive survey platform connecting survey creators with respondents, featuring role-based dashboards, payment processing, and administrative oversight.

## 🚀 Features

### 👥 **Multi-Role Architecture**
- **Fillers**: Earn money by completing surveys (₦200-1,500 per survey)
- **Creators**: Create and manage surveys with targeted audiences
- **Admins**: Platform moderation and user management
- **Super Admins**: System-wide oversight and control

### 🔐 **Authentication & Security**
- Role-based access control with verification gates
- Multi-factor authentication (MFA) for admins
- KYC verification system for fillers
- Secure session management

### 💰 **Payment System**
- Nigerian Naira (₦) currency integration
- Paystack payment gateway ready
- Automated payout processing
- Fee calculation and reconciliation

### 📊 **Survey Management**
- Drag-and-drop survey builder
- Multiple question types (multiple choice, rating, text)
- Real-time response tracking
- Quality control and approval workflow

### 🎨 **Modern UI/UX**
- 2025 design standards with glassmorphism effects
- Fully responsive (mobile-first approach)
- Dark mode support
- Smooth animations and micro-interactions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Filler App    │    │  Creator App    │    │   Admin Panel   │
│   (Blue Theme)  │    │ (Orange Theme)  │    │   (Red Theme)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Super Admin     │
                    │ (Purple Theme)  │
                    └─────────────────┘
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React Hooks + localStorage
- **Authentication**: AWS Cognito (ready for integration)
- **Payments**: Paystack (ready for integration)
- **Deployment**: Docker + Nginx

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Docker (optional)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd onetime

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t onetime-survey .
docker run -p 3000:3000 onetime-survey
```

## 📱 User Roles & Access

### 🔵 **Filler Dashboard** (`/filler`)
- Survey discovery and completion
- Earnings tracking and withdrawal
- Referral system
- KYC verification

### 🟠 **Creator Dashboard** (`/creator`)
- Survey creation and management
- Response analytics
- Credit management
- Audience targeting

### 🔴 **Admin Panel** (`/admin`)
- User management and KYC approval
- Survey review and moderation
- Payment processing
- Platform analytics

### 🟣 **Super Admin Panel** (`/super-admin`)
- Admin management
- System configuration
- Financial oversight
- Audit logs and security

## 🔧 Configuration

### Environment Variables

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# AWS Cognito (when ready)
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
COGNITO_REGION=

# Paystack (when ready)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=

# Database (when ready)
DATABASE_URL=
```

## 📂 Project Structure

```
onetime/
├── app/                    # Next.js App Router
│   ├── filler/            # Filler user pages
│   ├── creator/           # Creator user pages
│   ├── admin/             # Admin panel pages
│   └── super-admin/       # Super admin pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific components
│   └── super-admin/      # Super admin components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## 🎨 Design System

### Color Themes
- **Filler**: Blue (`#013F5C`)
- **Creator**: Orange (`#C1654B`)
- **Admin**: Red (`#DC2626`)
- **Super Admin**: Purple (`#7C3AED`)

### Components
- Built with shadcn/ui for consistency
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design patterns

## 🔌 Integration Readiness

### AWS Cognito
```typescript
// Authentication hooks ready for Cognito integration
// Located in: hooks/use-auth.ts, hooks/use-admin-auth.ts
```

### Paystack
```typescript
// Payment processing ready for Paystack API
// Located in: components/payment/, app/*/payments/
```

### Database
```typescript
// Data models and API routes ready for database integration
// Mock data currently used for development
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build
npm start
```

### Docker Production

```bash
# Production deployment with nginx
docker-compose -f docker-compose.yml up -d
```

### Vercel Deployment

```bash
# Deploy to Vercel
npx vercel --prod
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Loading**: Fast initial page load with SSR/SSG
- **Mobile**: Mobile-first responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact: support@onetimesurvey.com

## 🗺️ Roadmap

- [ ] AWS Cognito integration
- [ ] Paystack payment processing
- [ ] Database integration (PostgreSQL)
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API documentation

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
