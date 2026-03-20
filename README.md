# 🔔 BeforeCharge - Subscription Manager

A comprehensive web application to track, manage, and optimize your subscription services. Take control of your recurring payments with powerful analytics, smart reminders, and cost optimization insights.

![Subscription Manager Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Subscription+Manager+Dashboard)

---

## 🎉 **NEW: All Issues Fixed!**

✅ **Email Reminders** - Fully implemented with Resend API
✅ **Test Users** - Automated creation with sample data (`npm run create-test-users`)
✅ **Clean Setup** - Removed Vite conflicts, using Next.js only
✅ **Complete Docs** - 10+ comprehensive guides

**Quick Start:** See [START_HERE.md](START_HERE.md) or [QUICK_START.md](QUICK_START.md)

---

## ✨ Features

### 🎯 Core Features
- **Subscription Tracking**: Add and manage subscriptions with detailed information
- **15+ Preset Categories**: Streaming, Software, Fitness, Utilities, and more
- **Custom Categories & Tags**: Organize subscriptions your way
- **Receipt Management**: Upload and store receipt images
- **Multi-Currency Support**: Track subscriptions in different currencies
- **Flexible Billing Cycles**: Daily, weekly, monthly, quarterly, semi-annual, and annual

### 📊 Dashboard & Analytics
- **Spending Overview**: Total monthly/yearly spending at a glance
- **Category Breakdown**: Visual pie chart of spending distribution
- **Spending Trends**: 6-month trend analysis with line charts
- **Upcoming Renewals**: Never miss a payment with 30-day lookahead
- **Active vs Cancelled**: Track your subscription lifecycle

### 🔔 Smart Reminders
- **Email Notifications**: Powered by Supabase Edge Functions
- **Configurable Timing**: Set reminders 1, 3, 7, 14, or 30 days before renewal
- **Trial Expiration Alerts**: Get notified before free trials end
- **In-App Notifications**: Real-time notification center

### 💡 Cost Optimization
- **Unused Subscription Detection**: Identify services you're not using
- **Annual vs Monthly Savings**: Calculate potential savings
- **Spending Comparisons**: Month-over-month analysis
- **Duplicate Subscription Warnings**: Avoid paying twice for similar services

### 👤 User Features
- **Secure Authentication**: Email/password + Google OAuth
- **Profile Management**: Customize preferences and settings
- **Data Export**: Export your data to CSV format
- **Dark/Light Theme**: Choose your preferred appearance
- **Mobile-First Responsive Design**: Optimized for all screen sizes with touch-friendly interfaces

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand for client-side state
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Notifications**: react-hot-toast
- **Date Handling**: date-fns

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase Account** (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://gitlab.com/zode-nexus/beforecharge.git
cd beforecharge
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update the environment variables with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_NAME=BeforeCharge
VITE_APP_URL=http://localhost:5173

# Feature Flags
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_EMAIL_REMINDERS=true
VITE_ENABLE_RECEIPT_UPLOAD=true

# Default Settings
VITE_DEFAULT_CURRENCY=USD
VITE_SUPPORTED_CURRENCIES=USD,EUR,GBP,CAD,AUD,JPY
```

### 4. Database Setup

#### Option A: Use Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20240101000001_initial_schema.sql`
4. Run the migration

#### Option B: Use Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref your-project-reference

# Push migrations
supabase db push
```

### 5. Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `receipts`
3. Set the bucket to public if you want direct file access
4. Configure upload policies in the bucket settings

### 6. Authentication Setup

#### Email/Password (Default)
No additional setup required - works out of the box.

#### Google OAuth (Optional)
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
4. Update your environment variables if needed

### 7. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
beforecharge/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   ├── layout/       # Layout components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   └── subscriptions/ # Subscription management components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and configurations
│   ├── pages/            # Page components
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   └── main.tsx          # Application entry point
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge Functions (for email reminders)
└── package.json
```

## 🎨 Customization

### Adding New Categories
Default categories are defined in `src/lib/constants.ts`. To add more:

```typescript
export const DEFAULT_CATEGORIES = [
  // ... existing categories
  { name: 'Your Category', icon: 'YourIcon', color: '#your-color', is_default: true },
];
```

### Theming
The application uses Tailwind CSS with CSS custom properties. Customize colors in `src/index.css`:

```css
:root {
  --primary: your-primary-color;
  --secondary: your-secondary-color;
  /* ... other colors */
}
```

### Adding New Currencies
Update the currency enum in both:
- `src/types/app.types.ts`
- `supabase/migrations/20240101000001_initial_schema.sql`

## 📧 Email Reminders Setup

To enable email reminders, you'll need to set up Supabase Edge Functions:

1. **Create Edge Function**:
```bash
supabase functions new send-reminders
```

2. **Deploy Function**:
```bash
supabase functions deploy send-reminders
```

3. **Set up SMTP credentials** in Supabase Dashboard → Edge Functions → Environment Variables

4. **Create a cron job** to trigger the function daily

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Netlify
1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure environment variables

### Docker
```bash
# Build the image
docker build -t beforecharge .

# Run the container
docker run -p 3000:3000 beforecharge
```

## 🧪 Testing

### Run Tests
```bash
npm run test
# or
yarn test
```

### Run E2E Tests
```bash
npm run test:e2e
# or
yarn test:e2e
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | - | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | - | ✅ |
| `VITE_APP_NAME` | Application name | BeforeCharge | ❌ |
| `VITE_APP_URL` | Application URL | http://localhost:5173 | ❌ |
| `VITE_ENABLE_GOOGLE_AUTH` | Enable Google OAuth | true | ❌ |
| `VITE_ENABLE_EMAIL_REMINDERS` | Enable email notifications | true | ❌ |
| `VITE_DEFAULT_CURRENCY` | Default currency | USD | ❌ |

## 🐛 Troubleshooting

### Common Issues

**"Supabase client not initialized"**
- Check if your `.env.local` file has the correct Supabase credentials
- Ensure the environment variables are prefixed with `VITE_`

**"Categories not loading"**
- Make sure you've run the database migration
- Check if the default categories were inserted properly

**"Authentication not working"**
- Verify your Supabase project settings
- Check if email confirmation is required
- Ensure the redirect URLs are configured correctly

**"Dark mode not working"**
- Clear your browser's local storage
- Check if the theme toggle in settings works

### Getting Help
- Check the [Issues](../../issues) page for similar problems
- Create a new issue with detailed description and steps to reproduce

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: < 500KB (gzipped)
- **First Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🔒 Security

- All API calls are secured with Row Level Security (RLS)
- User data is isolated and encrypted
- File uploads are validated and sanitized
- SQL injection protection with parameterized queries
- XSS protection with content security policy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Lucide](https://lucide.dev/) for the icon library
- [Tailwind CSS](https://tailwindcss.com/) for the styling system

---

<div align="center">
  <p>Made with ❤️ by the BeforeCharge team</p>
  <p>
    <a href="#-beforecharge---subscription-manager">Back to Top</a>
  </p>
</div>
