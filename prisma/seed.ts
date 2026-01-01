/**
 * Database seed script
 * Creates sample subject (Mathematics) with concept graph
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Mathematics subject
  const math = await prisma.subject.upsert({
    where: { name: 'Mathematics' },
    update: {},
    create: {
      name: 'Mathematics',
      description: 'Learn mathematics from first principles, starting with fundamental concepts and building up to advanced topics.',
      icon: '🔢',
    },
  });

  console.log('Created subject: Mathematics');

  // Create concepts with prerequisites
  const concepts = [
    {
      title: 'Numbers and Counting',
      slug: 'numbers-counting',
      description: 'Understanding what numbers are and how to count',
      intuition: 'Numbers are a way to represent quantity. Think of counting apples: 1 apple, 2 apples, 3 apples...',
      mentalModel: 'Numbers are like labels we put on groups of things to say "how many"',
      formalDef: 'A number is a mathematical object used to count, measure, and label.',
      applications: 'Counting items, telling time, measuring distance',
      commonMisconceptions: JSON.stringify([
        'Zero is not a number',
        'Negative numbers don\'t exist in real life',
      ]),
      difficulty: 0.5,
      estimatedTime: 30,
      prerequisites: [],
    },
    {
      title: 'Addition',
      slug: 'addition',
      description: 'Combining quantities together',
      intuition: 'If you have 3 apples and get 2 more, you now have 5 apples. Addition is just combining things.',
      mentalModel: 'Think of addition as "putting together" or "combining" groups',
      formalDef: 'Addition is a binary operation that combines two numbers to produce a sum.',
      applications: 'Calculating totals, combining quantities, measuring growth',
      commonMisconceptions: JSON.stringify([
        'Addition always makes numbers bigger',
        'Order doesn\'t matter (it does, but commutativity applies)',
      ]),
      difficulty: 1.0,
      estimatedTime: 45,
      prerequisites: ['numbers-counting'],
    },
    {
      title: 'Subtraction',
      slug: 'subtraction',
      description: 'Taking away or finding the difference',
      intuition: 'If you have 5 apples and eat 2, you have 3 left. Subtraction is "taking away" or "finding what\'s left".',
      mentalModel: 'Subtraction is the opposite of addition - it\'s "removing" or "finding the difference"',
      formalDef: 'Subtraction is finding the difference between two numbers.',
      applications: 'Calculating change, measuring loss, finding differences',
      commonMisconceptions: JSON.stringify([
        'You can\'t subtract a larger number from a smaller one',
        'Subtraction always makes numbers smaller',
      ]),
      difficulty: 1.5,
      estimatedTime: 45,
      prerequisites: ['numbers-counting', 'addition'],
    },
    {
      title: 'Multiplication',
      slug: 'multiplication',
      description: 'Repeated addition or scaling',
      intuition: 'If you have 3 groups of 4 apples each, you have 12 apples total. Multiplication is "repeated addition" or "scaling".',
      mentalModel: 'Multiplication is like adding the same number multiple times, or making something bigger by a factor',
      formalDef: 'Multiplication is repeated addition or finding the product of two numbers.',
      applications: 'Calculating area, scaling recipes, computing totals of equal groups',
      commonMisconceptions: JSON.stringify([
        'Multiplication always makes numbers bigger',
        'You must memorize all multiplication facts',
      ]),
      difficulty: 2.0,
      estimatedTime: 60,
      prerequisites: ['addition'],
    },
    {
      title: 'Division',
      slug: 'division',
      description: 'Splitting into equal parts or finding how many groups',
      intuition: 'If you have 12 apples and want to share them equally among 3 people, each gets 4. Division is "splitting" or "sharing equally".',
      mentalModel: 'Division is the opposite of multiplication - it\'s "splitting into equal parts" or "finding how many groups"',
      formalDef: 'Division is finding how many times one number fits into another, or splitting into equal parts.',
      applications: 'Sharing equally, calculating rates, finding averages',
      commonMisconceptions: JSON.stringify([
        'You can\'t divide by zero (correct, but often misunderstood why)',
        'Division always makes numbers smaller',
      ]),
      difficulty: 2.5,
      estimatedTime: 60,
      prerequisites: ['multiplication', 'subtraction'],
    },
    {
      title: 'Fractions',
      slug: 'fractions',
      description: 'Parts of a whole',
      intuition: 'If you cut a pizza into 4 equal slices and take 1, you have 1/4 of the pizza. Fractions represent parts of a whole.',
      mentalModel: 'A fraction is like a piece of something that\'s been divided into equal parts',
      formalDef: 'A fraction represents a part of a whole, written as numerator/denominator.',
      applications: 'Measuring parts, calculating percentages, representing ratios',
      commonMisconceptions: JSON.stringify([
        'Larger denominator means larger fraction',
        'Fractions are always less than 1',
      ]),
      difficulty: 3.0,
      estimatedTime: 90,
      prerequisites: ['division'],
    },
    {
      title: 'Decimals',
      slug: 'decimals',
      description: 'Numbers between whole numbers',
      intuition: 'If you have 2.5 apples, you have 2 whole apples and half of another. Decimals let us represent parts of a whole using our number system.',
      mentalModel: 'Decimals are like fractions but written in our base-10 number system',
      formalDef: 'A decimal is a way of writing numbers that includes a decimal point to represent fractional parts.',
      applications: 'Money, measurements, scientific notation',
      commonMisconceptions: JSON.stringify([
        'More decimal places means a larger number',
        '0.5 and 0.50 are different numbers',
      ]),
      difficulty: 2.5,
      estimatedTime: 60,
      prerequisites: ['fractions'],
    },
    {
      title: 'Basic Algebra',
      slug: 'basic-algebra',
      description: 'Using variables to represent unknown values',
      intuition: 'If you know that 3 + something = 7, that "something" is 4. Algebra is about finding unknown values using what we know.',
      mentalModel: 'Think of variables as "mystery numbers" that we can figure out using the relationships we know',
      formalDef: 'Algebra is the branch of mathematics dealing with symbols and the rules for manipulating them.',
      applications: 'Solving problems, modeling real-world situations, finding patterns',
      commonMisconceptions: JSON.stringify([
        'Variables are always letters',
        'x always equals a specific number',
      ]),
      difficulty: 3.5,
      estimatedTime: 120,
      prerequisites: ['addition', 'subtraction', 'multiplication', 'division'],
    },
  ];

  // Create concepts and establish prerequisites
  const createdConcepts: Record<string, any> = {};

  for (const conceptData of concepts) {
    const prereqSlugs = conceptData.prerequisites;
    // Remove prerequisites from conceptData as it's not a direct field
    const { prerequisites, ...conceptCreateData } = conceptData as any;

    const concept = await prisma.concept.upsert({
      where: {
        subjectId_slug: {
          subjectId: math.id,
          slug: conceptData.slug,
        },
      },
      update: {},
      create: {
        ...conceptCreateData,
        subjectId: math.id,
      },
    });

    createdConcepts[conceptData.slug] = concept;
    console.log(`Created concept: ${concept.title}`);
  }

  // Establish prerequisite relationships
  for (const conceptData of concepts) {
    const concept = createdConcepts[conceptData.slug];
    const prereqSlugs = conceptData.prerequisites || [];

    if (prereqSlugs.length > 0) {
      const prereqIds = prereqSlugs
        .map(slug => createdConcepts[slug]?.id)
        .filter(Boolean) as string[];

      if (prereqIds.length > 0) {
        // Create prerequisite relationships using join table
        for (const prereqId of prereqIds) {
          await prisma.conceptPrerequisite.create({
            data: {
              prerequisiteId: prereqId,
              dependentId: concept.id,
            },
          });
        }
        console.log(`Connected prerequisites to ${concept.title}`);
      }
    }
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

