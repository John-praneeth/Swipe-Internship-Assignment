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

  // Create sample questions
    const sampleQuestions = [
    {
      text: 'Tell me about yourself and your background.',
      difficulty: 'EASY' as const,
      timeLimit: 300,
      category: 'General'
    },
    {
      text: 'What are your greatest strengths and how do they apply to this role?',
      difficulty: 'EASY' as const,
      timeLimit: 240,
      category: 'General'
    },
    {
      text: 'Describe a challenging project you worked on and how you overcame obstacles.',
      difficulty: 'MEDIUM' as const,
      timeLimit: 480,
      category: 'Experience'
    },
    {
      text: 'How do you handle working under pressure and tight deadlines?',
      difficulty: 'MEDIUM' as const,
      timeLimit: 300,
      category: 'Behavioral'
    },
    {
      text: 'Describe a complex technical problem you solved recently.',
      difficulty: 'HARD' as const,
      timeLimit: 600,
      category: 'Technical'
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
