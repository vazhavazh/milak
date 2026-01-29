# MilaK Platform - AI Knowledge Management System

AI-powered platform for biotech data integration and knowledge management.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Anthropic Claude API key ([Get one here](https://console.anthropic.com/))

### Setup Instructions

1. **Install dependencies:**
```bash
npm install
```

2. **Start PostgreSQL database:**
```bash
docker-compose up -d
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

4. **Setup database:**
```bash
npm run db:push
npm run db:seed
```

5. **Start development server:**
```bash
npm run dev
```

6. **Open browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Test Credentials

```
Email: admin@milak.com
Password: password123
```

## 📄 Features

### 1. **Chat with AI** (`/chat`)
- Ask questions about your documents
- Get answers with citations
- Claude AI powered RAG system

### 2. **Documents** (`/documents`)
- Upload PDF, DOCX, TXT files
- Automatic text extraction
- View all uploaded documents

### 3. **Proteins** (`/proteins`)
- View all proteins with status
- Gap analysis for IP readiness
- Evidence and process tracking

### 4. **Protein Details** (`/proteins/[id]`)
- Complete protein information
- Gap analysis dashboard
- Linked processes, evidence, documents
- Recommendations for IP filing

## 🗄️ Database Schema

The platform includes:
- **Users** - Authentication
- **Documents** - Uploaded files with extracted text
- **Proteins** - Protein information
- **Processes** - Production processes
- **Evidence** - Scientific evidence
- **ProteinProcess** - Links proteins to processes
- **Queries** - AI chat history

## 🌱 Seed Data

The seed includes realistic test data:
- 3 Proteins (X, Y, Z) with different maturity levels
- 3 Production processes
- 6 Evidence items
- 5 Detailed scientific documents
- Realistic content for testing RAG

## 📁 Project Structure

```
milak-platform/
├── app/
│   ├── api/              # API routes
│   ├── (auth)/           # Auth pages (login)
│   ├── (dashboard)/      # Main app pages
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # UI components (shadcn/ui)
├── lib/
│   ├── prisma.ts         # Database client
│   ├── claude.ts         # Claude API wrapper
│   ├── auth.ts           # JWT authentication
│   └── gap-analysis.ts   # Gap analysis logic
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── docker-compose.yml    # PostgreSQL container
```

## 🛠️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Apply Prisma schema to database
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset database and reseed
npm run db:studio    # Open Prisma Studio (database GUI)
```

## 🔧 Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT authentication

**AI/ML:**
- Claude API (Anthropic)
- Simple semantic search (LIKE queries)
- RAG (Retrieval-Augmented Generation)

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL 16

## 📊 How It Works

### RAG Pipeline

1. User asks a question in the chat
2. System searches documents for relevant content (LIKE search)
3. Top 5 relevant documents are retrieved
4. Content is sent to Claude API with the question
5. Claude generates an answer with citations
6. Answer is displayed with source documents

### Gap Analysis

For each protein, the system checks:
- **Process Data**: ≥1 production process
- **Evidence**: ≥3 evidence items
- **Documents**: ≥5 supporting documents

Status:
- ✅ **READY_FOR_IP**: All requirements met
- ⚠️ **IN_PROGRESS**: Some requirements met
- ❌ **NOT_STARTED**: No requirements met

## 🐛 Troubleshooting

**Database connection error:**
```bash
# Restart PostgreSQL
docker-compose restart

# Check if running
docker-compose ps
```

**Seed fails:**
```bash
# Reset and try again
npm run db:reset
```

**Claude API errors:**
- Check your API key in `.env`
- Ensure you have API credits
- Check rate limits

## 📝 Notes

- This is an MVP (Minimum Viable Product)
- Semantic search uses simple LIKE queries (pgvector not implemented yet)
- No Apache AGE graph database (uses Prisma relations instead)
- No React Flow visualization (lists instead)
- Focus: Working RAG system with Claude API

## 🎯 Next Steps (Phase 2)

Potential enhancements:
- [ ] Add pgvector for better semantic search
- [ ] Implement React Flow graph visualization
- [ ] Add Apache AGE for complex graph queries
- [ ] Generate DOCX/PDF reports
- [ ] Add more evidence types
- [ ] Batch document upload
- [ ] User management (admin panel)

## 📄 License

Proprietary - MilaK Platform

## 🆘 Support

For issues or questions, check:
1. This README
2. Console logs (`npm run dev`)
3. Database logs (`docker-compose logs`)
4. Prisma Studio (`npm run db:studio`)

---

**Created:** January 2026  
**Version:** 1.0.0 (MVP)
