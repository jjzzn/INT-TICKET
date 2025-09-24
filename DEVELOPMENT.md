# 🛠️ Development Guide - INT TICKET

## 🚀 Quick Start for Developers

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- VS Code (recommended)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd int-ticket

# Install dependencies
npm install

# Setup git hooks
npm run prepare

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

## 📁 Project Architecture

### Folder Structure
```
int-ticket/
├── components/          # Reusable UI components
│   ├── AuthModal.tsx
│   ├── ErrorBoundary.tsx
│   ├── EventCard.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Loading.tsx
│   ├── SearchFilter.tsx
│   └── PerformanceDashboard.tsx
├── pages/              # Page-level components
│   ├── HomePage.tsx
│   ├── EventPage.tsx
│   ├── CreateEventPage.tsx
│   ├── EditEventPage.tsx
│   ├── DashboardPage.tsx
│   ├── ClientDashboard.tsx
│   ├── OrganizerDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── ForOrganizersPage.tsx
│   └── BuyTicketPage.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── usePerformance.ts
├── lib/                # Utilities and configurations
│   ├── supabaseClient.ts
│   └── errorHandler.ts
├── src/                # Source files
│   ├── test/           # Test files
│   │   ├── setup.ts
│   │   └── components/
│   └── types/
│       └── vitest.d.ts
├── .github/            # GitHub workflows
│   └── workflows/
│       └── ci.yml
└── types.ts            # TypeScript definitions
```

### Component Patterns

#### 1. Page Components
```tsx
// Pattern for page components
import React, { useState, useEffect } from 'react';
import { usePerformance } from '../hooks/usePerformance';
import Loading from '../components/Loading';

const MyPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { measureRender } = usePerformance('MyPage');

  useEffect(() => {
    // Load data
    measureRender();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page content */}
    </div>
  );
};

export default MyPage;
```

#### 2. Reusable Components
```tsx
// Pattern for reusable components
import React from 'react';

interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  onAction?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({
  title,
  children,
  className = '',
  onAction
}) => {
  return (
    <div className={`base-classes ${className}`}>
      <h2>{title}</h2>
      {children}
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
};

export default MyComponent;
```

## 🧪 Testing Strategy

### Test Structure
```
src/test/
├── setup.ts           # Test configuration
├── components/        # Component tests
│   ├── EventCard.test.tsx
│   └── SearchFilter.test.tsx
├── pages/            # Page tests
│   └── HomePage.test.tsx
├── hooks/            # Hook tests
│   └── useAuth.test.ts
└── utils/            # Utility tests
    └── errorHandler.test.ts
```

### Writing Tests
```tsx
// Component test example
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../MyComponent';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithRouter(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockAction = vi.fn();
    renderWithRouter(<MyComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalled();
  });
});
```

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🎨 Styling Guidelines

### Tailwind CSS Classes
```tsx
// Consistent spacing and sizing
const spacing = {
  xs: 'p-2',      // 8px
  sm: 'p-4',      // 16px
  md: 'p-6',      // 24px
  lg: 'p-8',      // 32px
  xl: 'p-12'      // 48px
};

// Color system
const colors = {
  primary: 'text-primary bg-primary border-primary',
  secondary: 'text-secondary bg-secondary border-secondary',
  surface: 'bg-surface',
  card: 'bg-card',
  border: 'border-border',
  textPrimary: 'text-text-primary',
  textSecondary: 'text-text-secondary'
};

// Responsive breakpoints
const responsive = {
  mobile: 'sm:',      // 640px+
  tablet: 'md:',      // 768px+
  desktop: 'lg:',     // 1024px+
  wide: 'xl:'         // 1280px+
};
```

### Component Styling Patterns
```tsx
// Button variants
const buttonVariants = {
  primary: 'px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors',
  secondary: 'px-6 py-3 bg-surface text-text-primary border border-border rounded-lg hover:bg-border transition-colors',
  ghost: 'px-6 py-3 text-text-primary hover:bg-surface rounded-lg transition-colors'
};

// Card layouts
const cardStyles = 'bg-card p-6 rounded-xl border border-border shadow-sm';

// Form inputs
const inputStyles = 'w-full px-3 py-2 bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-colors';
```

## 🔧 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/my-feature
```

### Commit Message Format
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Build process or auxiliary tool changes

Examples:
- feat(auth): add login functionality
- fix(events): resolve date formatting issue
- docs(readme): update installation guide
```

### Code Quality Checks
```bash
# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check

# Type checking
npx tsc --noEmit

# Run all checks
npm run lint && npm run format:check && npx tsc --noEmit
```

## 🚀 Performance Guidelines

### Component Performance
```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependency]);
```

### Performance Monitoring
```tsx
// Use performance hooks
import { usePerformance, useApiPerformance } from '../hooks/usePerformance';

const MyComponent = () => {
  const { measureRender } = usePerformance('MyComponent');
  const { measureApiCall } = useApiPerformance();

  const fetchData = async () => {
    await measureApiCall('fetchEvents', async () => {
      return await api.getEvents();
    });
  };

  useEffect(() => {
    measureRender();
  });
};
```

## 🐛 Error Handling

### Error Boundaries
```tsx
// Wrap components with ErrorBoundary
<ErrorBoundary 
  onError={(error, errorInfo) => {
    console.error('Component error:', error);
  }}
>
  <MyComponent />
</ErrorBoundary>
```

### Manual Error Reporting
```tsx
import { reportError } from '../lib/errorHandler';

try {
  // Risky operation
} catch (error) {
  reportError('Operation failed', {
    operation: 'fetchData',
    userId: user?.id,
    timestamp: new Date().toISOString()
  });
}
```

## 📊 State Management

### Context Pattern
```tsx
// Create context
const MyContext = createContext<MyContextType | undefined>(undefined);

// Provider component
export const MyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  const value = useMemo(() => ({
    state,
    actions: {
      updateState: setState
    }
  }), [state]);

  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
};

// Custom hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

## 🔐 Security Best Practices

### Environment Variables
```bash
# Never commit sensitive data
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# Use different configs for environments
NODE_ENV=development
```

### Input Validation
```tsx
// Validate user inputs
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize data before display
const sanitizeHtml = (html: string): string => {
  // Use a proper sanitization library in production
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

## 📱 Mobile Development

### Responsive Design
```tsx
// Mobile-first approach
<div className="
  w-full p-4                    // Mobile
  sm:w-1/2 sm:p-6              // Tablet
  lg:w-1/3 lg:p-8              // Desktop
  xl:w-1/4 xl:p-12             // Large screens
">
  Content
</div>

// Touch-friendly interactions
<button className="
  min-h-[44px] min-w-[44px]    // Minimum touch target
  active:scale-95               // Touch feedback
  transition-transform
">
  Button
</button>
```

## 🚀 Deployment

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Setup
```bash
# Production environment variables
VITE_SUPABASE_URL=production_url
VITE_SUPABASE_ANON_KEY=production_key
NODE_ENV=production
```

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)

### Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Supabase Dashboard](https://app.supabase.com)

## 🤝 Contributing

1. Read the development guide
2. Follow coding standards
3. Write tests for new features
4. Update documentation
5. Submit pull request

## 📞 Support

- Create GitHub issues for bugs
- Use discussions for questions
- Check existing documentation first
- Follow the issue templates
