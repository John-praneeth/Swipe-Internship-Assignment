import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.question.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create default users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  const interviewer = await prisma.user.create({
    data: {
      username: 'interviewer',
      email: 'interviewer@demo.com',
      password: hashedPassword,
      role: 'INTERVIEWER'
    }
  });

  const interviewee = await prisma.user.create({
    data: {
      username: 'interviewee',
      email: 'interviewee@demo.com',
      password: hashedPassword,
      role: 'INTERVIEWEE'
    }
  });

  console.log('✅ Created default users');

  // Create sample questions (mix of multiple choice and text)
  const sampleQuestions = [
    // Easy Multiple Choice Questions
    {
      text: 'What does HTML stand for?',
      difficulty: 'EASY',
      timeLimit: 30,
      category: 'Web Fundamentals',
      type: 'MULTIPLE_CHOICE',
      options: JSON.stringify([
        'Hyper Text Markup Language',
        'High Tech Modern Language',
        'Home Tool Markup Language',
        'Hyperlink and Text Markup Language'
      ]),
      correctAnswer: 'Hyper Text Markup Language',
      explanation: 'HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.'
    },
    {
      text: 'Which of the following is NOT a JavaScript data type?',
      difficulty: 'EASY',
      timeLimit: 30,
      category: 'JavaScript Fundamentals',
      type: 'MULTIPLE_CHOICE',
      options: JSON.stringify([
        'String',
        'Boolean',
        'Float',
        'Number'
      ]),
      correctAnswer: 'Float',
      explanation: 'JavaScript has Number type for all numeric values. There is no separate Float type.'
    },
    // Medium Multiple Choice Questions
    {
      text: 'What is the purpose of the useEffect hook in React?',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      category: 'React Hooks',
      type: 'MULTIPLE_CHOICE',
      options: JSON.stringify([
        'To manage component state',
        'To perform side effects in functional components',
        'To create custom hooks',
        'To handle form submissions'
      ]),
      correctAnswer: 'To perform side effects in functional components',
      explanation: 'useEffect is used to perform side effects like API calls, subscriptions, or manually changing the DOM in React functional components.'
    },
    {
      text: 'Which HTTP method is typically used to update existing data?',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      category: 'Web APIs',
      type: 'MULTIPLE_CHOICE',
      options: JSON.stringify([
        'GET',
        'POST',
        'PUT',
        'DELETE'
      ]),
      correctAnswer: 'PUT',
      explanation: 'PUT is typically used to update existing resources, while POST creates new resources.'
    },
    // Hard Multiple Choice Questions
    {
      text: 'What is the time complexity of searching in a balanced binary search tree?',
      difficulty: 'HARD',
      timeLimit: 30,
      category: 'Data Structures & Algorithms',
      type: 'MULTIPLE_CHOICE',
      options: JSON.stringify([
        'O(1)',
        'O(log n)',
        'O(n)',
        'O(n log n)'
      ]),
      correctAnswer: 'O(log n)',
      explanation: 'In a balanced BST, search operations have O(log n) time complexity because we can eliminate half the nodes at each level.'
    },
    {
      text: 'In microservices architecture, what is the purpose of an API Gateway?',
      difficulty: 'HARD',
      timeLimit: 30,
      category: 'System Architecture',
      type: 'MULTIPLE_CHOICE',
      options: JSON.stringify([
        'To store data',
        'To provide a single entry point and handle cross-cutting concerns',
        'To replace databases',
        'To compile code'
      ]),
      correctAnswer: 'To provide a single entry point and handle cross-cutting concerns',
      explanation: 'An API Gateway acts as a single entry point for clients and handles concerns like authentication, rate limiting, and request routing.'
    }
  ];

  for (const questionData of sampleQuestions) {
    await prisma.question.create({
      data: questionData
    });
  }

  console.log('✅ Created sample questions');

  // Create a sample candidate with interview data
  const candidate = await prisma.candidate.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      resumeText: `John Doe
Software Engineer

Experience:
- 3 years of React development
- Node.js backend experience
- Database design and optimization

Skills:
- JavaScript, TypeScript
- React, Node.js
- PostgreSQL, MongoDB
- AWS, Docker`,
      status: 'COMPLETED',
      finalScore: 85,
      summary: 'Strong technical skills with good problem-solving abilities.',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      endTime: new Date(),
      interviewerId: interviewer.id
    }
  });

  console.log('✅ Created sample candidate');

  // Create sample answers for the candidate
  const createdQuestions = await prisma.question.findMany();
  
  for (let i = 0; i < Math.min(3, createdQuestions.length); i++) {
    const question = createdQuestions[i];
    await prisma.answer.create({
      data: {
        candidateId: candidate.id,
        questionId: question.id,
        answer: `This is a sample answer for question: ${question.text}. The candidate provided a comprehensive response demonstrating good understanding of the topic.`,
        timeSpent: Math.floor(Math.random() * question.timeLimit),
        difficulty: question.difficulty,
        score: Math.floor(Math.random() * 20) + 15 // Score between 15-35
      }
    });
  }

  console.log('✅ Created sample answers');

  // Create sample chat messages
  await prisma.chatMessage.create({
    data: {
      candidateId: candidate.id,
      type: 'SYSTEM',
      content: 'Welcome to your interview! Let\'s begin with the first question.'
    }
  });

  await prisma.chatMessage.create({
    data: {
      candidateId: candidate.id,
      type: 'QUESTION',
      content: createdQuestions[0].text,
      questionId: createdQuestions[0].id,
      difficulty: createdQuestions[0].difficulty,
      timeLimit: createdQuestions[0].timeLimit
    }
  });

  console.log('✅ Created sample chat messages');
  console.log('🎉 Database seeding completed successfully!');
  
  console.log('\n📋 Default Login Credentials:');
  console.log('Admin: admin@demo.com / password123');
  console.log('Interviewer: interviewer@demo.com / password123');
  console.log('Interviewee: interviewee@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
