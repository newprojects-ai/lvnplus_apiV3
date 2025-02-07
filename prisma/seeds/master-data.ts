import { PrismaClient, exam_boards_input_type } from '@prisma/client';

const prisma = new PrismaClient();

async function loadMasterData() {
  try {
    // Create exam boards
    const examBoards = [
      { board_name: 'AQA', description: 'Assessment and Qualifications Alliance', input_type: exam_boards_input_type.MCQ },
      { board_name: 'Edexcel', description: 'Pearson Edexcel Examinations', input_type: exam_boards_input_type.MCQ },
      { board_name: 'OCR', description: 'Oxford, Cambridge and RSA Examinations', input_type: exam_boards_input_type.MCQ },
      { board_name: 'WJEC', description: 'Welsh Joint Education Committee', input_type: exam_boards_input_type.MCQ }
    ];

    console.log('Loading exam boards...');
    for (const board of examBoards) {
      await prisma.exam_boards.upsert({
        where: { board_name: board.board_name },
        update: { description: board.description },
        create: board
      });
    }

    // Create main subjects
    const subjects = [
      { subject_name: 'Mathematics', description: 'Core mathematics curriculum' },
      { subject_name: 'English', description: 'English language and literature' },
      { subject_name: 'Science', description: 'Combined and separate sciences' }
    ];

    console.log('Loading subjects...');
    const createdSubjects = await Promise.all(
      subjects.map(async (subject) => {
        return await prisma.subjects.upsert({
          where: { subject_name: subject.subject_name },
          update: { description: subject.description },
          create: subject
        });
      })
    );

    // Create topics and subtopics for Mathematics
    const mathsTopics = [
      {
        topic_name: 'Number',
        description: 'Number operations and properties',
        subtopics: [
          'Integers and place value',
          'Decimals',
          'Fractions',
          'Percentages',
          'Powers and roots',
          'Factors and multiples'
        ]
      },
      {
        topic_name: 'Algebra',
        description: 'Algebraic operations and equations',
        subtopics: [
          'Expressions and substitution',
          'Equations and inequalities',
          'Sequences',
          'Graphs',
          'Functions'
        ]
      }
    ];

    console.log('Loading mathematics topics and subtopics...');
    const mathsSubject = createdSubjects.find(s => s.subject_name === 'Mathematics');
    if (!mathsSubject) throw new Error('Mathematics subject not found');

    for (const topic of mathsTopics) {
      await prisma.topics.create({
        data: {
          topic_name: topic.topic_name,
          description: topic.description,
          subject_id: mathsSubject.subject_id,
          subtopics: {
            create: topic.subtopics.map(subtopicName => ({
              subtopic_name: subtopicName,
              description: `${subtopicName} in ${topic.topic_name}`
            }))
          }
        }
      });
    }

    // Create topics and subtopics for English
    const englishTopics = [
      {
        topic_name: 'Reading',
        description: 'Reading comprehension and analysis',
        subtopics: [
          'Understanding texts',
          'Inference and deduction',
          'Language analysis',
          'Structure analysis',
          'Comparison skills'
        ]
      },
      {
        topic_name: 'Writing',
        description: 'Writing skills and techniques',
        subtopics: [
          'Creative writing',
          'Descriptive writing',
          'Persuasive writing',
          'Technical writing',
          'Essay writing'
        ]
      }
    ];

    console.log('Loading English topics and subtopics...');
    const englishSubject = createdSubjects.find(s => s.subject_name === 'English');
    if (!englishSubject) throw new Error('English subject not found');

    for (const topic of englishTopics) {
      await prisma.topics.create({
        data: {
          topic_name: topic.topic_name,
          description: topic.description,
          subject_id: englishSubject.subject_id,
          subtopics: {
            create: topic.subtopics.map(subtopicName => ({
              subtopic_name: subtopicName,
              description: `${subtopicName} in ${topic.topic_name}`
            }))
          }
        }
      });
    }

    // Create topics and subtopics for Science
    const scienceTopics = [
      {
        topic_name: 'Biology',
        description: 'Living organisms and life processes',
        subtopics: [
          'Cells and organization',
          'Photosynthesis',
          'Respiration',
          'Inheritance',
          'Evolution'
        ]
      },
      {
        topic_name: 'Chemistry',
        description: 'Matter, materials and reactions',
        subtopics: [
          'Atomic structure',
          'Chemical reactions',
          'Periodic table',
          'Acids and bases',
          'Energy changes'
        ]
      }
    ];

    console.log('Loading Science topics and subtopics...');
    const scienceSubject = createdSubjects.find(s => s.subject_name === 'Science');
    if (!scienceSubject) throw new Error('Science subject not found');

    for (const topic of scienceTopics) {
      await prisma.topics.create({
        data: {
          topic_name: topic.topic_name,
          description: topic.description,
          subject_id: scienceSubject.subject_id,
          subtopics: {
            create: topic.subtopics.map(subtopicName => ({
              subtopic_name: subtopicName,
              description: `${subtopicName} in ${topic.topic_name}`
            }))
          }
        }
      });
    }

    console.log('Master data loaded successfully');
  } catch (error) {
    console.error('Error loading master data:', error);
    throw error;
  }
}

export { loadMasterData };
