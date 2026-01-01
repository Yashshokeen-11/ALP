# AI Learning Platform - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                         │
│  Next.js App Router + TypeScript + Tailwind CSS              │
│  - AI Tutor Chat Interface                                   │
│  - Learning Path Visualization                               │
│  - Concept Mastery Dashboard                                 │
│  - Assessment Interface                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    API Layer (REST + Server Actions)         │
│  - Authentication Endpoints                                  │
│  - Tutor Chat Endpoints                                     │
│  - Learning Path Endpoints                                  │
│  - Assessment Endpoints                                     │
│  - Analytics Endpoints                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Application Services Layer                │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ User Profiling   │  │ Knowledge Graph  │                 │
│  │ Engine           │  │ Engine           │                 │
│  └──────────────────┘  └──────────────────┘                 │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │ AI Tutor Engine  │  │ Assessment &     │                 │
│  │                  │  │ Feedback Engine  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│  ┌──────────────────┐                                       │
│  │ Adaptation Loop  │                                       │
│  └──────────────────┘                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │ Vector DB    │  │ Supabase     │      │
│  │ (Relational) │  │ (Embeddings) │  │ (Auth)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. User Profiling Engine
- **Purpose**: Maintain dynamic student model
- **Components**:
  - Concept-wise mastery scores (0-1)
  - Learning velocity (concepts/hour)
  - Depth preference (surface vs deep)
  - Mistake patterns (error types, frequency)
  - Confusion signals (hesitation, repeated questions)
  - Learning style (visual, verbal, kinesthetic)

### 2. Knowledge Graph Engine
- **Purpose**: Represent subjects as interconnected concepts
- **Components**:
  - Concept nodes (with metadata: intuition, formal, applications)
  - Prerequisite edges (directed, weighted)
  - Learning path generation (topological sort with mastery)
  - Gap detection (missing prerequisites)
  - Concept embeddings (for similarity search)

### 3. AI Tutor Engine
- **Purpose**: Provide personalized, Socratic tutoring
- **Components**:
  - LLM integration (provider-agnostic)
  - Prompt templates (Socratic, first-principles, intuition)
  - Context retrieval (RAG from knowledge graph)
  - Student context injection
  - Answer refusal logic (force reasoning first)

### 4. Assessment & Feedback Engine
- **Purpose**: Evaluate understanding, detect misconceptions
- **Components**:
  - Conceptual question generation
  - Open-ended response evaluation
  - Misconception detection (pattern matching + LLM)
  - Confidence calibration
  - Adaptive difficulty

### 5. Adaptation Loop
- **Purpose**: Real-time personalization
- **Components**:
  - Post-interaction model update
  - Curriculum reordering (priority queue by gap size)
  - Explanation style selection
  - Pace adjustment
  - Depth adjustment

## Data Flow

1. **Student Interaction**:
   Student → Chat Interface → AI Tutor Engine → LLM → Response

2. **Learning Update**:
   Interaction → Assessment Engine → User Profiling Engine → Adaptation Loop → Updated Path

3. **Path Generation**:
   Request → Knowledge Graph Engine → Prerequisite Check → Gap Analysis → Personalized Path

4. **Concept Learning**:
   Concept Selection → Prerequisite Verification → AI Tutor → Assessment → Mastery Update

## Key Design Decisions

1. **Graph-Based Learning**: Concepts are nodes, prerequisites are edges. Allows non-linear, personalized paths.

2. **Mastery-Based Progression**: Students don't move forward until prerequisites are mastered (configurable threshold).

3. **Mistake-Driven Learning**: Errors update the student model and trigger targeted remediation.

4. **First-Principles First**: AI tutor always explains "why" before "what", intuition before formulas.

5. **Provider-Agnostic AI**: Abstract LLM calls to allow switching providers easily.

6. **Embedding-Based Similarity**: Use vector embeddings for concept similarity and RAG retrieval.

