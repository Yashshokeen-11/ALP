# Extending the AI Learning Platform

This guide explains how to add new subjects, concepts, and customize the platform.

## Adding a New Subject

### 1. Create the Subject

You can add a new subject through the database or using Prisma:

```typescript
// In a script or seed file
const physics = await prisma.subject.create({
  data: {
    name: 'Physics',
    description: 'Learn physics from first principles',
    icon: '⚛️',
  },
});
```

### 2. Add Concepts

Concepts are the building blocks of knowledge. Each concept should include:

- **title**: Clear, descriptive name
- **slug**: URL-friendly identifier (unique per subject)
- **description**: Brief overview
- **intuition**: Intuitive explanation (why it matters)
- **mentalModel**: Simple mental model
- **formalDef**: Formal definition (after intuition)
- **applications**: Real-world uses
- **commonMisconceptions**: JSON array of common mistakes
- **difficulty**: 0.0 (beginner) to 5.0 (expert)
- **estimatedTime**: Minutes to master
- **prerequisites**: Array of concept slugs that must be mastered first

Example:

```typescript
const concept = await prisma.concept.create({
  data: {
    subjectId: physics.id,
    title: 'Force and Motion',
    slug: 'force-motion',
    description: 'Understanding how forces cause motion',
    intuition: 'When you push something, it moves. Force is what causes that push.',
    mentalModel: 'Think of force as a push or pull that changes how something moves',
    formalDef: 'Force is an interaction that causes acceleration (F = ma)',
    applications: 'Driving cars, throwing balls, understanding gravity',
    commonMisconceptions: JSON.stringify([
      'Objects in motion need constant force',
      'Heavier objects fall faster',
    ]),
    difficulty: 2.0,
    estimatedTime: 90,
    prerequisites: {
      connect: [{ slug: 'basic-algebra' }], // If algebra is a prerequisite
    },
  },
});
```

### 3. Establish Prerequisites

Prerequisites create the knowledge graph structure:

```typescript
await prisma.concept.update({
  where: { id: advancedConcept.id },
  data: {
    prerequisites: {
      connect: [
        { id: prerequisite1.id },
        { id: prerequisite2.id },
      ],
    },
  },
});
```

## Customizing the AI Tutor

### Modify Prompt Templates

Edit `lib/engines/ai-tutor.ts` to customize:

1. **System Prompt** (`getSystemPrompt()`): Core tutoring philosophy
2. **Socratic Questions** (`buildSocraticPrompt()`): Question generation style
3. **First-Principles Explanations** (`buildFirstPrinciplesPrompt()`): Explanation structure
4. **Adaptive Explanations** (`buildAdaptivePrompt()`): Depth adjustment logic

### Add Custom Explanation Styles

Extend the `AITutorEngine` class:

```typescript
async explainWithAnalogy(context: TutorContext, analogy: string): Promise<TutorResponse> {
  // Custom explanation method
}
```

## Customizing Assessment

### Question Types

Modify `lib/engines/assessment.ts`:

1. **Question Generation** (`generateQuestion()`): Create different question types
2. **Evaluation** (`evaluateWithLLM()`): Customize scoring logic
3. **Misconception Detection** (`detectMisconceptionFromResponse()`): Add pattern matching

### Add New Question Types

```typescript
// In assessment.ts
async generateMultipleChoice(
  conceptId: string,
  options: QuestionGenerationOptions
): Promise<Question> {
  // Generate multiple choice questions
}
```

## Adjusting Adaptation Logic

### Modify Adaptation Parameters

Edit `lib/engines/adaptation.ts`:

- **Mastery Threshold**: When to consider a concept "mastered" (default: 0.7)
- **Review Threshold**: When to trigger review (default: 0.6)
- **Pace Adjustment**: How to adjust learning speed
- **Depth Adjustment**: When to use surface vs deep explanations

### Custom Adaptation Rules

```typescript
// In adaptation.ts
private customAdaptationRule(
  userId: string,
  conceptId: string
): Promise<AdaptationResult> {
  // Your custom logic
}
```

## Adding New Features

### 1. Spaced Repetition

The `AdaptationLoop` has placeholder methods for spaced repetition. Implement:

```typescript
// In lib/engines/adaptation.ts
async scheduleReview(userId: string, conceptId: string, days: number) {
  // Integrate with a spaced repetition algorithm (e.g., SM-2)
}
```

### 2. Social Learning

Add collaboration features:

```typescript
// New model in schema.prisma
model StudyGroup {
  id        String   @id @default(uuid())
  name      String
  members   User[]
  // ...
}
```

### 3. Gamification

Add achievements and progress tracking:

```typescript
model Achievement {
  id          String   @id @default(uuid())
  userId      String
  type        String   // 'mastery', 'streak', 'completion'
  // ...
}
```

## Database Migrations

When adding new features:

1. Update `prisma/schema.prisma`
2. Create migration: `npm run db:migrate`
3. Update TypeScript types: `npm run db:generate`

## Environment Variables

Add new services in `.env`:

```bash
# Vector database for embeddings
VECTOR_DB_URL=your_vector_db_url

# Analytics service
ANALYTICS_API_KEY=your_key
```

## Frontend Customization

### Add New Pages

1. Create page in `app/` directory
2. Add route handlers in `app/api/` if needed
3. Create components in `components/`

### Customize UI

- **Colors**: Edit `tailwind.config.ts`
- **Components**: Modify components in `components/`
- **Layout**: Update `app/layout.tsx`

## Testing

### Unit Tests

Create tests for engines:

```typescript
// __tests__/engines/knowledge-graph.test.ts
import { KnowledgeGraphEngine } from '@/lib/engines/knowledge-graph';

describe('KnowledgeGraphEngine', () => {
  // Test cases
});
```

### Integration Tests

Test API routes and database interactions.

## Deployment

1. Set up PostgreSQL database
2. Configure Supabase for authentication
3. Set environment variables
4. Run migrations: `npm run db:migrate`
5. Seed data: `npm run db:seed`
6. Deploy to Vercel/your platform

## Best Practices

1. **Concept Design**:
   - Always include intuition before formal definitions
   - List common misconceptions
   - Connect to real-world applications

2. **Prerequisites**:
   - Keep prerequisite chains shallow when possible
   - Test that paths are accessible
   - Avoid circular dependencies

3. **AI Prompts**:
   - Be specific about pedagogical approach
   - Test prompts with various student responses
   - Iterate based on student feedback

4. **Performance**:
   - Cache learning paths
   - Batch database queries
   - Use vector search for concept similarity

## Support

For questions or issues, refer to:
- Architecture documentation: `ARCHITECTURE.md`
- Database schema: `prisma/schema.prisma`
- Engine implementations: `lib/engines/`

