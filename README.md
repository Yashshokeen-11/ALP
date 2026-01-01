# AI Learning Platform (ALP)

A production-grade AI-powered EdTech application that takes students from absolute beginner to expert through first-principles thinking, Socratic questioning, and adaptive personalized learning.

## 🎯 Core Vision

ALP acts as a personal mentor rather than a content delivery system:
- **First-Principles Learning**: Teaches "why" before "what", intuition before formulas
- **Adaptive Personalization**: Continuously adapts to student's understanding, pace, and mistakes
- **Concept-Level Mastery**: Tracks and personalizes at the concept level, not chapter level
- **Socratic Tutoring**: Uses questioning to guide discovery rather than direct answers
- **Mistake-Driven Learning**: Identifies and fixes conceptual gaps automatically

## 🏗 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture.

### Core Modules

1. **User Profiling Engine**: Tracks concept-wise mastery, learning patterns, mistake types
2. **Knowledge Graph Engine**: Graph-based representation with prerequisite-aware paths
3. **AI Tutor Engine**: LLM-based tutor with Socratic questioning and first-principles explanations
4. **Assessment Engine**: Conceptual questions with misconception detection
5. **Adaptation Loop**: Real-time personalization and curriculum reordering

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Supabase account (for authentication)
- OpenAI API key (for AI tutoring)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/alp?schema=public"

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Set up database**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed sample data (Mathematics subject)
   npm run db:seed
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ALP/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── learn/             # Learning interface
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── TutorChat.tsx     # AI tutor chat interface
│   ├── LearningPathView.tsx
│   └── SignInForm.tsx
├── lib/
│   ├── engines/           # Core engines
│   │   ├── ai-tutor.ts   # AI tutoring logic
│   │   ├── assessment.ts # Assessment generation
│   │   ├── adaptation.ts # Adaptation loop
│   │   ├── knowledge-graph.ts
│   │   └── user-profiling.ts
│   ├── db.ts             # Prisma client
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── ARCHITECTURE.md        # System architecture
└── EXTENDING.md           # Extension guide
```

## 🎓 Features

### For Students

- **Personalized Learning Paths**: Automatically generated based on mastery
- **AI Tutor Chat**: Socratic questioning and first-principles explanations
- **Concept Mastery Tracking**: Visual progress for each concept
- **Adaptive Assessments**: Questions that test understanding, not memorization
- **Gap Detection**: Automatically identifies and fills prerequisite gaps

### For Educators/Developers

- **Extensible Subject System**: Easy to add new subjects and concepts
- **Knowledge Graph**: Prerequisite-aware concept relationships
- **Customizable AI Prompts**: Adjust tutoring style and depth
- **Analytics**: Track learning velocity, mistake patterns, confusion signals

## 🔧 Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Push schema changes (dev only)
npm run db:push

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📚 Adding New Subjects

See [EXTENDING.md](./EXTENDING.md) for detailed instructions on:
- Adding new subjects and concepts
- Customizing AI tutor prompts
- Adjusting adaptation logic
- Adding new features

### Quick Example

```typescript
// Add a new subject
const physics = await prisma.subject.create({
  data: {
    name: 'Physics',
    description: 'Learn physics from first principles',
  },
});

// Add a concept
const concept = await prisma.concept.create({
  data: {
    subjectId: physics.id,
    title: 'Force and Motion',
    slug: 'force-motion',
    intuition: 'When you push something, it moves...',
    // ... other fields
  },
});
```

## 🧠 Pedagogical Approach

### First Principles

Every concept includes:
1. **Intuition**: Why it matters, real-world connection
2. **Mental Model**: Simple framework for understanding
3. **Prerequisites**: What you need to know first
4. **Formal Definition**: Only after intuition is clear
5. **Applications**: Real-world uses
6. **Common Misconceptions**: What to watch out for

### Socratic Method

The AI tutor:
- Asks leading questions before explaining
- Refuses direct answers until reasoning is attempted
- Builds on student's thinking (even if partially correct)
- Guides discovery rather than delivering facts

### Adaptive Learning

- **Mastery-Based**: Can't proceed until prerequisites are mastered
- **Mistake-Driven**: Errors trigger targeted remediation
- **Pace-Adjusted**: Learning speed adapts to student velocity
- **Depth-Adjusted**: Explanation depth matches understanding level

## 🔐 Authentication

Uses Supabase for authentication. Set up:
1. Create a Supabase project
2. Get your project URL and anon key
3. Add to `.env` file
4. Configure authentication providers in Supabase dashboard

## 🤖 AI Integration

Currently uses OpenAI's GPT-4. The system is designed to be provider-agnostic:
- Abstract LLM calls in `AITutorEngine`
- Easy to switch providers or use local models
- Prompt templates are modular and customizable

## 📊 Database Schema

Key models:
- **User**: Student profiles and preferences
- **Subject**: Learning domains (Mathematics, Physics, etc.)
- **Concept**: Individual concepts with full pedagogical metadata
- **UserProfile**: Concept-wise mastery tracking
- **LearningSession**: Chat sessions with AI tutor
- **Assessment**: Evaluations and feedback
- **Question**: Assessment questions

See `prisma/schema.prisma` for full schema.

## 🚢 Deployment

1. Set up PostgreSQL database (e.g., Supabase, Railway, Neon)
2. Configure environment variables
3. Run migrations: `npm run db:migrate`
4. Seed data: `npm run db:seed`
5. Deploy to Vercel or your preferred platform

## 📝 License

See [LICENSE](./LICENSE) file.

## 🤝 Contributing

This is a production-grade template. To extend:
1. Read [EXTENDING.md](./EXTENDING.md)
2. Follow the architecture patterns
3. Maintain pedagogical principles
4. Test thoroughly

## 🎯 Roadmap

Potential enhancements:
- [ ] Vector embeddings for concept similarity
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Social learning features
- [ ] Gamification and achievements
- [ ] Mobile app
- [ ] Offline support
- [ ] Multi-language support

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [EXTENDING.md](./EXTENDING.md) - Guide to extending the platform
- [prisma/schema.prisma](./prisma/schema.prisma) - Database schema

## 💡 Key Design Decisions

1. **Graph-Based Learning**: Concepts are nodes, prerequisites are edges
2. **Mastery Threshold**: 0.7 (70%) to proceed to next concept
3. **Provider-Agnostic AI**: Easy to switch LLM providers
4. **Clean Architecture**: Modular engines, clear separation of concerns
5. **First-Principles First**: Always intuition before formal definitions

---

Built with ❤️ for deep, conceptual learning.
