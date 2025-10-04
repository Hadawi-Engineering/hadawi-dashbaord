# 🎉 Hadawi Admin Dashboard

Modern admin dashboard built with React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **React Query** - Data Fetching
- **Recharts** - Charts & Analytics
- **Lucide React** - Icons

## 📦 Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your API URL in .env
VITE_API_URL=http://localhost:3000
```

## 🏃‍♂️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run on `http://localhost:3001`

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # UI components (Button, Card, Table, etc.)
│   ├── Layout.tsx      # Main layout with sidebar
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   └── ...
├── services/           # API services
│   └── adminService.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css

## 🔐 Authentication

The dashboard uses JWT token authentication. Admin credentials are required to access the system.

Default login:
- Email: `admin@hadawi.com`
- Password: (provided by backend team)

## 🎨 Features

### ✅ Implemented
- Authentication system with JWT
- Protected routes
- Responsive sidebar navigation
- TypeScript types for all API responses
- Reusable UI components
- Layout structure

### 🚧 In Progress
- Dashboard page with statistics
- Users management (CRUD)
- Occasions management
- Payments management
- Promo codes management
- Banners management
- Withdrawal requests
- Delivery partners
- Analytics & Reports
- Settings

## 📚 API Documentation

Refer to the following guides:
- `ADMIN_API_QUICK_REFERENCE.md` - Quick API reference
- `ADMIN_DASHBOARD_INTEGRATION_GUIDE.md` - Complete integration guide
- `ADMIN_INTEGRATION_PACKAGE.md` - Full package documentation

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Hadawi Admin Dashboard
```

## 🎯 Development Guidelines

### Component Structure
- Use functional components with TypeScript
- Export types alongside components
- Use Tailwind CSS for styling
- Follow the existing UI component patterns

### API Integration
- All API calls go through `adminService.ts`
- Use React Query for data fetching when possible
- Handle loading and error states

### Code Style
- Use TypeScript strict mode
- Define proper interfaces for all data structures
- Use meaningful variable and function names
- Add comments for complex logic

## 🐛 Known Issues

None at the moment. Report issues to the development team.

## 📝 License

Proprietary - Hadawi Platform

## 👥 Team

Backend API: [Team Name]
Frontend Dashboard: [Team Name]

---

**Status:** 🚧 In Development  
**Version:** 1.0.0  
**Last Updated:** October 2025

