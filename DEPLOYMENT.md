# 🚀 Deployment Guide - INT TICKET

## 📋 Pre-deployment Checklist

### ✅ Code Quality
- [ ] All tests passing (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code formatted (`npm run format:check`)
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)
- [ ] Build successful (`npm run build`)

### ✅ Environment Setup
- [ ] Production environment variables configured
- [ ] Supabase project setup (if using database)
- [ ] Error tracking service configured (optional)
- [ ] Analytics setup (optional)

### ✅ Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Core Web Vitals checked
- [ ] Mobile responsiveness tested

## 🌐 Deployment Options

### 1. Vercel (Recommended)

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Environment Variables
```bash
# Set environment variables in Vercel dashboard
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NODE_ENV=production
```

#### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Netlify

#### Deploy via Git
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

#### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. GitHub Pages

#### Setup GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

#### Docker Commands
```bash
# Build image
docker build -t int-ticket .

# Run container
docker run -p 3000:80 int-ticket

# Deploy to registry
docker tag int-ticket your-registry/int-ticket:latest
docker push your-registry/int-ticket:latest
```

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref
```

### 2. Database Schema
```sql
-- Create tables (run in Supabase SQL editor)

-- Customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  birthday DATE,
  gender VARCHAR(10),
  country_code VARCHAR(3),
  id_number VARCHAR(50),
  prefix VARCHAR(10),
  supabase_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizers table
CREATE TABLE organizers (
  id SERIAL PRIMARY KEY,
  organizer_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  business_type VARCHAR(100),
  tax_id VARCHAR(50),
  billing_address TEXT NOT NULL,
  invoice_email VARCHAR(255),
  maps_link TEXT,
  additional_notes TEXT,
  supabase_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  venue VARCHAR(255) NOT NULL,
  event_start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  poster_url TEXT,
  organizer_id INTEGER REFERENCES organizers(id),
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  max_attendees INTEGER NOT NULL,
  current_attendees INTEGER DEFAULT 0,
  event_type VARCHAR(100) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  event_info TEXT,
  agenda_url TEXT,
  google_map_link TEXT,
  website_url TEXT,
  facebook_contact TEXT,
  instagram_contact TEXT,
  x_contact TEXT,
  tiktok_contact TEXT,
  youtube_contact TEXT,
  line_contact TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket types table
CREATE TABLE ticket_types (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3),
  quantity INTEGER NOT NULL,
  sold_quantity INTEGER DEFAULT 0,
  benefits TEXT,
  min_per_order INTEGER DEFAULT 1,
  max_per_order INTEGER DEFAULT 10,
  sale_start_date TIMESTAMP WITH TIME ZONE,
  sale_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  event_id INTEGER REFERENCES events(id),
  ticket_type_id INTEGER REFERENCES ticket_types(id),
  ticket_number VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2),
  currency VARCHAR(3),
  qr_code VARCHAR(255) NOT NULL,
  qr_code_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speakers table (optional)
CREATE TABLE speakers (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  company VARCHAR(255),
  bio TEXT,
  image_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own data
CREATE POLICY "Customers can view own data" ON customers
  FOR ALL USING (auth.uid() = supabase_user_id);

-- Organizers can only see their own data
CREATE POLICY "Organizers can view own data" ON organizers
  FOR ALL USING (auth.uid() = supabase_user_id);

-- Events are publicly readable, but only organizers can modify their own
CREATE POLICY "Events are publicly readable" ON events
  FOR SELECT USING (true);

CREATE POLICY "Organizers can manage own events" ON events
  FOR ALL USING (
    organizer_id IN (
      SELECT id FROM organizers WHERE supabase_user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production

# Optional
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_APP_VERSION=1.0.0
```

### Security Configuration
```bash
# Content Security Policy
VITE_CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co"
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```typescript
// Add to production build
if (import.meta.env.PROD) {
  // Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}
```

### Error Tracking (Sentry)
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Production Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Run linting
      run: npm run lint
    
    - name: Type check
      run: npx tsc --noEmit

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint
```

#### Environment Variables Not Loading
```bash
# Verify environment file exists
ls -la .env*

# Check variable names (must start with VITE_)
grep VITE_ .env.local

# Restart development server
npm run dev
```

#### Supabase Connection Issues
```bash
# Test connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://YOUR_PROJECT.supabase.co/rest/v1/

# Check RLS policies
# Verify user authentication
```

### Performance Issues
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for large dependencies
npm ls --depth=0 --long

# Optimize images
# Use WebP format
# Implement lazy loading
```

## 📞 Support

### Deployment Support
- Check deployment logs in platform dashboard
- Verify environment variables are set
- Test build locally before deploying
- Monitor performance after deployment

### Database Support
- Check Supabase dashboard for errors
- Verify RLS policies are correct
- Monitor database performance
- Set up database backups

## 🔄 Updates & Maintenance

### Regular Maintenance
```bash
# Update dependencies
npm update

# Security audit
npm audit
npm audit fix

# Check for outdated packages
npx npm-check-updates
```

### Monitoring Checklist
- [ ] Application uptime
- [ ] Database performance
- [ ] Error rates
- [ ] Core Web Vitals
- [ ] User feedback
- [ ] Security updates
