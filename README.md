# 🎫 INT TICKET - Event Ticketing Platform

A modern, full-stack event ticketing platform built with React 19, TypeScript, Vite, and Supabase.

## 🚀 Features

### For Event Organizers
- 📅 Create and manage events
- 🎟️ Multiple ticket tiers with custom pricing
- 📊 Real-time analytics dashboard
- ✏️ Edit event details after creation
- 💰 Revenue tracking and reporting

### For Customers
- 🔍 Browse and discover events
- 🎫 Purchase tickets with secure checkout
- 📱 Digital tickets with QR codes
- 👤 Personal dashboard with ticket history
- 📧 Email confirmations and updates

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security

### Development Tools
- **Vitest** - Fast unit testing
- **Testing Library** - React component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account** (optional for demo mode)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd int-ticket
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials (optional)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** The app works in demo mode without Supabase configuration.

### 3. Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

### 4. Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Workflow

### Code Quality
- **ESLint** - Automatic linting on save
- **Prettier** - Code formatting on save
- **Husky** - Pre-commit hooks for quality checks
- **TypeScript** - Compile-time type checking

### Git Hooks
```bash
# Pre-commit automatically runs:
- ESLint --fix
- Prettier --write
- Type checking
```

## 📁 Project Structure

```
int-ticket/
├── components/          # Reusable UI components
│   ├── AuthModal.tsx
│   ├── ErrorBoundary.tsx
│   ├── EventCard.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── EventPage.tsx
│   ├── CreateEventPage.tsx
│   ├── EditEventPage.tsx
│   └── DashboardPage.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   └── useAuth.ts
├── lib/                # Utilities and configurations
│   ├── supabaseClient.ts
│   └── errorHandler.ts
├── src/test/           # Test files
│   ├── setup.ts
│   └── components/
└── types.ts            # TypeScript type definitions
```

## 🎯 User Roles

### Client (Customer)
- Browse events
- Purchase tickets
- View ticket history
- Manage profile

### Organizer
- Create events
- Manage ticket types
- View analytics
- Edit event details

### Super Admin
- System administration
- User management
- Platform oversight

## 🔐 Authentication

The platform supports role-based authentication with:
- Email/password registration
- Secure JWT tokens
- Role-based route protection
- Session management

## 📊 Database Schema

### Core Tables
- `customers` - Customer user data
- `organizers` - Event organizer data
- `events` - Event information
- `ticket_types` - Ticket tiers and pricing
- `tickets` - Purchased tickets
- `speakers` - Event speakers (optional)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

## 🔧 Configuration

### Environment Variables
```env
# Required for production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production
```

### Supabase Setup
1. Create new Supabase project
2. Run database migrations (SQL schema)
3. Configure Row Level Security
4. Set up authentication providers

## 🐛 Error Handling

- **Global Error Boundary** - Catches React errors
- **Error Logging** - Automatic error reporting
- **Graceful Fallbacks** - User-friendly error messages
- **Development Tools** - Detailed error info in dev mode

## 📈 Performance

- **Code Splitting** - Lazy loading of routes
- **Tree Shaking** - Optimized bundle size
- **CDN Assets** - Fast loading of dependencies
- **Caching** - Efficient data fetching

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass
- Follow code style guidelines

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review test examples

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Basic event management
- ✅ Ticket purchasing system
- ✅ User authentication
- ✅ Analytics dashboard
- ✅ Testing framework
- ✅ Error handling
- ✅ Development tools

### Upcoming Features
- 🔄 Advanced search and filtering
- 🔄 Email notifications
- 🔄 Payment integration
- 🔄 Mobile app
- 🔄 Multi-language support
