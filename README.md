# AI Questionnaire

A full-stack AI-powered questionnaire platform built with Next.js, NestJS, and generative AI capabilities. This application enables users to create, manage, and analyze intelligent surveys and questionnaires powered by Google's Generative AI and OpenAI.

🌐 **Live Demo:** [https://ai-questionnaire-sepia.vercel.app](https://ai-questionnaire-sepia.vercel.app)

## Features

- **AI-Powered Question Generation**: Automatically generate survey questions using Google Generative AI or OpenAI
- **Questionnaire Management**: Create, edit, and delete questionnaires with ease
- **User Authentication**: Secure authentication powered by Better Auth
- **File Upload & Processing**: Support for CSV, Excel, PDF, and Word documents
- **Email Notifications**: Send surveys via email using Nodemailer and Resend
- **Real-time Updates**: Socket-ready architecture with Redis support
- **Payment Integration**: Stripe integration for premium features
- **Responsive Design**: Beautiful UI built with TailwindCSS and Framer Motion
- **Database**: PostgreSQL with Prisma ORM for reliable data management

## Tech Stack

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4, PostCSS
- **UI Components**: Lucide React, Framer Motion
- **State Management**: Zustand
- **API Calls**: Axios
- **Search**: Fuse.js
- **Notifications**: Sonner

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **API Docs**: Swagger
- **Authentication**: JWT, Passport
- **Database**: PostgreSQL with Prisma
- **Job Queue**: BullMQ with Redis
- **File Processing**: Multer, Mammoth, PDF-Parse, XLSX, CSV-Parse
- **Testing**: Jest

### DevOps & Deployment
- **Frontend Deployment**: Vercel
- **Containerization**: Docker Compose
- **Database**: PostgreSQL
- **Caching**: Redis
- **Email Services**: Nodemailer, Resend

## Project Structure

```
ai-questionnaire/
├── app/                      # Next.js frontend (App Router)
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   ├── auth/             # Authentication
│   │   └── common/           # Shared utilities
│   └── prisma/               # Database schema
├── components/               # React components
├── lib/                       # Utilities and helpers
├── public/                    # Static assets
├── docker-compose.yml        # Local development setup
├── package.json              # Root dependencies
└── tsconfig.json             # TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+
- Redis (optional, for job queue)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/eyob13-coder/AI-Questionnaire.git
   cd AI-Questionnaire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create `.env.local` in the root directory
   - Create `.env` in the `backend/` directory
   
   Required variables:
   ```bash
   # Backend
   DATABASE_URL=postgresql://user:password@localhost:5432/ai_questionnaire
   JWT_SECRET=your_jwt_secret
   GOOGLE_API_KEY=your_google_generative_ai_key
   OPENAI_API_KEY=your_openai_key
   STRIPE_SECRET_KEY=your_stripe_key
   EMAIL_FROM=noreply@example.com
   ```

4. **Initialize the database**
   ```bash
   npm run build
   ```

### Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000

**Individual commands:**
- Frontend only: `npm run dev:frontend`
- Backend only: `npm run dev:backend`
- Redis: `npm run dev:redis`

### Building for Production

```bash
npm run build
npm start
```

## Available Scripts

### Root Level
- `npm run dev` - Start development servers (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Backend (cd backend/)
- `npm run dev` - Start NestJS in watch mode
- `npm run build` - Build the NestJS app
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run lint` - Fix linting issues

## Docker Setup

Start the full stack with Docker:

```bash
docker-compose up
```

This will spin up:
- PostgreSQL database
- Redis cache
- Backend API
- Frontend application

## API Documentation

Once the backend is running, access the Swagger API documentation at:
```
http://localhost:4000/api/docs
```

## Features in Detail

### AI Question Generation
- Leverage Google Generative AI or OpenAI to automatically generate relevant survey questions
- Customize tone, difficulty, and question types

### File Processing
- Upload and parse CSV, Excel, PDF, and Word documents
- Extract data and generate surveys based on document content

### Email Integration
- Send surveys to respondents via email
- Track email delivery and opens
- Automated reminders and follow-ups

### User Authentication
- Secure signup and login with Better Auth
- Social login support
- JWT-based session management

### Payment Processing
- Stripe integration for premium features
- Subscription management
- Usage tracking and billing

## Environment Variables

See `.env.example` files in root and `backend/` directories for all available configuration options.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is currently unlicensed. See LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub or visit the [live demo](https://ai-questionnaire-sepia.vercel.app).

## Author

Created by [eyob13-coder](https://github.com/eyob13-coder)

---

**Made with ❤️ using Next.js, NestJS, and AI**
