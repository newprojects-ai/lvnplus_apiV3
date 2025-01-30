import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function loadMasterData() {
  try {
    // Create exam boards
    const examBoards = [
      { name: 'AQA', description: 'Assessment and Qualifications Alliance' },
      { name: 'Edexcel', description: 'Pearson Edexcel Examinations' },
      { name: 'OCR', description: 'Oxford, Cambridge and RSA Examinations' },
      { name: 'WJEC', description: 'Welsh Joint Education Committee' }
    ];

    console.log('Loading exam boards...');
    for (const board of examBoards) {
      await prisma.exam_boards.upsert({
        where: { name: board.name },
        update: { description: board.description },
        create: board
      });
    }

    // Create main subjects
    const subjects = [
      { name: 'Mathematics', description: 'Core mathematics curriculum' },
      { name: 'English', description: 'English language and literature' },
      { name: 'Science', description: 'Combined and separate sciences' }
    ];

    console.log('Loading subjects...');
    const createdSubjects = await Promise.all(
      subjects.map(async (subject) => {
        return await prisma.subjects.upsert({
          where: { name: subject.name },
          update: { description: subject.description },
          create: subject
        });
      })
    );

    // Create topics and subtopics for Mathematics
    const mathsTopics = [
      {
        name: 'Number',
        description: 'Number operations and properties',
        subtopics: [
          'Integers and place value',
          'Decimals',
          'Fractions',
          'Percentages',
          'Ratio and proportion'
        ]
      },
      {
        name: 'Algebra',
        description: 'Algebraic operations and equations',
        subtopics: [
          'Expressions and formulae',
          'Equations and inequalities',
          'Sequences',
          'Linear graphs',
          'Quadratic equations'
        ]
      },
      {
        name: 'Geometry',
        description: 'Shapes, space and measures',
        subtopics: [
          'Properties of shapes',
          'Angles',
          'Area and perimeter',
          'Volume and surface area',
          'Transformations'
        ]
      }
    ];

    console.log('Loading mathematics topics and subtopics...');
    const mathsSubject = createdSubjects.find(s => s.name === 'Mathematics');
    if (mathsSubject) {
      for (const topic of mathsTopics) {
        const createdTopic = await prisma.topics.upsert({
          where: {
            name_subject_id: {
              name: topic.name,
              subject_id: mathsSubject.subject_id
            }
          },
          update: { description: topic.description },
          create: {
            name: topic.name,
            description: topic.description,
            subject_id: mathsSubject.subject_id
          }
        });

        // Create subtopics
        for (const subtopicName of topic.subtopics) {
          await prisma.subtopics.upsert({
            where: {
              name_topic_id: {
                name: subtopicName,
                topic_id: createdTopic.topic_id
              }
            },
            update: {},
            create: {
              name: subtopicName,
              topic_id: createdTopic.topic_id
            }
          });
        }
      }
    }

    // Create topics and subtopics for English
    const englishTopics = [
      {
        name: 'Reading',
        description: 'Comprehension and analysis',
        subtopics: [
          'Understanding texts',
          'Language analysis',
          'Structure analysis',
          'Comparison skills',
          'Critical evaluation'
        ]
      },
      {
        name: 'Writing',
        description: 'Written communication',
        subtopics: [
          'Creative writing',
          'Descriptive writing',
          'Persuasive writing',
          'Technical accuracy',
          'Planning and structure'
        ]
      },
      {
        name: 'Speaking and Listening',
        description: 'Verbal communication',
        subtopics: [
          'Presentation skills',
          'Group discussion',
          'Listening skills',
          'Verbal analysis',
          'Drama and role-play'
        ]
      }
    ];

    console.log('Loading English topics and subtopics...');
    const englishSubject = createdSubjects.find(s => s.name === 'English');
    if (englishSubject) {
      for (const topic of englishTopics) {
        const createdTopic = await prisma.topics.upsert({
          where: {
            name_subject_id: {
              name: topic.name,
              subject_id: englishSubject.subject_id
            }
          },
          update: { description: topic.description },
          create: {
            name: topic.name,
            description: topic.description,
            subject_id: englishSubject.subject_id
          }
        });

        // Create subtopics
        for (const subtopicName of topic.subtopics) {
          await prisma.subtopics.upsert({
            where: {
              name_topic_id: {
                name: subtopicName,
                topic_id: createdTopic.topic_id
              }
            },
            update: {},
            create: {
              name: subtopicName,
              topic_id: createdTopic.topic_id
            }
          });
        }
      }
    }

    // Create topics and subtopics for Science
    const scienceTopics = [
      {
        name: 'Biology',
        description: 'Living organisms and life processes',
        subtopics: [
          'Cells and organisation',
          'Photosynthesis',
          'Respiration',
          'Inheritance',
          'Evolution'
        ]
      },
      {
        name: 'Chemistry',
        description: 'Matter and chemical reactions',
        subtopics: [
          'Atomic structure',
          'Chemical reactions',
          'Periodic table',
          'Materials',
          'Rates of reaction'
        ]
      },
      {
        name: 'Physics',
        description: 'Energy, forces and the universe',
        subtopics: [
          'Forces and motion',
          'Energy transfers',
          'Waves',
          'Electricity',
          'Magnetism'
        ]
      }
    ];

    console.log('Loading Science topics and subtopics...');
    const scienceSubject = createdSubjects.find(s => s.name === 'Science');
    if (scienceSubject) {
      for (const topic of scienceTopics) {
        const createdTopic = await prisma.topics.upsert({
          where: {
            name_subject_id: {
              name: topic.name,
              subject_id: scienceSubject.subject_id
            }
          },
          update: { description: topic.description },
          create: {
            name: topic.name,
            description: topic.description,
            subject_id: scienceSubject.subject_id
          }
        });

        // Create subtopics
        for (const subtopicName of topic.subtopics) {
          await prisma.subtopics.upsert({
            where: {
              name_topic_id: {
                name: subtopicName,
                topic_id: createdTopic.topic_id
              }
            },
            update: {},
            create: {
              name: subtopicName,
              topic_id: createdTopic.topic_id
            }
          });
        }
      }
    }

    console.log('Master data loaded successfully!');
  } catch (error) {
    console.error('Error loading master data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export { loadMasterData };
