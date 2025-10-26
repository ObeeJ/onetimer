# Onetime Survey Platform

A comprehensive survey platform connecting survey creators with respondents, featuring role-based dashboards, payment processing, and administrative oversight.

## 🚀 Features

- **Multi-Role Architecture**: Fillers, Creators, Admins, Super Admins
- **Payment System**: Nigerian Naira integration with Paystack
- **Survey Management**: Advanced builder with multiple question types
- **Analytics Dashboard**: Real-time insights and reporting
- **Security**: Role-based access control with audit logging

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Go (Golang), Fiber framework
- **Database**: Supabase PostgreSQL
- **Payments**: Paystack integration
- **Deployment**: Render platform

## 🚀 Deployment

This project is configured for deployment on Render using the `render.yaml` blueprint.

```

## 📱 User Roles

- **Fillers**: Complete surveys and earn money (₦200-1,500 per survey)
- **Creators**: Create and manage surveys with analytics
- **Admins**: Platform moderation and user management
- **Super Admins**: System oversight and financial management

## 🔧 Local Development

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
go mod tidy
go run main.go
```

## 📄 License

MIT License