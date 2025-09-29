import React from 'react';
import { Card, Space, Typography, Tag, Progress, Button } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import './InterviewStyles.css';

const { Title, Text } = Typography;

// Demo data for the completion screen
const demoCandidate = {
  id: 'demo-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  currentQuestionIndex: 6,
  answers: [
    {
      questionId: '1',
      question: 'What is JavaScript?',
      answer: 'JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification. JavaScript has curly-bracket syntax, dynamic typing, prototype-based object-orientation, and first-class functions.',
      timeSpent: 45,
      difficulty: 'easy' as const,
    },
    {
      questionId: '2',
      question: 'Explain the difference between let, const, and var.',
      answer: 'var has function scope and is hoisted, let has block scope and is not hoisted, const is like let but cannot be reassigned after declaration.',
      timeSpent: 18,
      difficulty: 'easy' as const,
    },
    {
      questionId: '3',
      question: 'What is React and why use it?',
      answer: 'React is a JavaScript library for building user interfaces, particularly web applications. It allows developers to create reusable UI components and efficiently update and render components when data changes using a virtual DOM.',
      timeSpent: 72,
      difficulty: 'medium' as const,
    },
    {
      questionId: '4',
      question: 'Explain React hooks.',
      answer: 'React hooks are functions that let you use state and other React features in functional components. Common hooks include useState for state management, useEffect for side effects, and useContext for context consumption.',
      timeSpent: 58,
      difficulty: 'medium' as const,
    },
    {
      questionId: '5',
      question: 'Design a scalable web application architecture.',
      answer: 'I would use microservices architecture with load balancers, API gateways, containerization with Docker, database sharding, caching layers like Redis, CDN for static assets, and monitoring systems.',
      timeSpent: 115,
      difficulty: 'hard' as const,
    },
    {
      questionId: '6',
      question: 'Implement a distributed system with fault tolerance.',
      answer: '', // Unanswered question
      timeSpent: 120,
      difficulty: 'hard' as const,
    },
  ],
  finalScore: 78,
  summary: 'Strong performance overall with good technical knowledge.',
  status: 'completed' as const,
  startTime: Date.now() - 1000 * 60 * 18, // 18 minutes ago
  endTime: Date.now(),
  isPaused: false,
};

const demoQuestions = [
  {
    id: '1',
    text: 'What is JavaScript?',
    difficulty: 'easy' as const,
    timeLimit: 60,
    category: 'JavaScript Fundamentals',
  },
  {
    id: '2',
    text: 'Explain the difference between let, const, and var.',
    difficulty: 'easy' as const,
    timeLimit: 60,
    category: 'JavaScript Fundamentals',
  },
  {
    id: '3',
    text: 'What is React and why use it?',
    difficulty: 'medium' as const,
    timeLimit: 90,
    category: 'React Basics',
  },
  {
    id: '4',
    text: 'Explain React hooks.',
    difficulty: 'medium' as const,
    timeLimit: 90,
    category: 'React Hooks',
  },
  {
    id: '5',
    text: 'Design a scalable web application architecture.',
    difficulty: 'hard' as const,
    timeLimit: 120,
    category: 'System Design',
  },
  {
    id: '6',
    text: 'Implement a distributed system with fault tolerance.',
    difficulty: 'hard' as const,
    timeLimit: 120,
    category: 'System Design',
  },
];

const CompletionDemo: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Thank You Header */}
      <Card 
        className="completion-card thank-you-header"
        style={{ 
          marginBottom: '24px',
          textAlign: 'center',
          border: '2px solid #1890ff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(24, 144, 255, 0.12)',
          position: 'relative'
        }}
      >
        <div className="completion-confetti">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <Space direction="vertical" size="large" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <TrophyOutlined className="trophy-glow" style={{ fontSize: '64px', color: '#faad14', marginBottom: '16px' }} />
            <Title level={2} style={{ margin: 0, color: '#1890ff', fontWeight: 'bold' }}>
              🎉 Interview Completed Successfully!
            </Title>
          </div>
          <div>
            <Title level={3} style={{ color: '#52c41a', margin: '16px 0' }}>
              Thank You, {demoCandidate.name}!
            </Title>
            <Text style={{ fontSize: '18px', color: '#666', display: 'block', marginBottom: '8px' }}>
              We appreciate the time and effort you've put into this interview.
            </Text>
            <Text style={{ fontSize: '16px', color: '#888' }}>
              We will review your responses and reach out to you soon with the next steps.
            </Text>
          </div>
          <div className="final-score-badge pulse-animation" style={{
            background: 'rgba(82, 196, 26, 0.1)',
            border: '2px solid #52c41a',
            borderRadius: '12px',
            padding: '20px',
            display: 'inline-block'
          }}>
            <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
              Final Score: {demoCandidate.finalScore}/100
            </Text>
          </div>
        </Space>
      </Card>

      {/* Detailed Scorecard */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrophyOutlined style={{ color: '#1890ff' }} />
            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>Interview Scorecard</span>
          </div>
        }
        style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
      >
        {/* Interview Summary Stats */}
        <div style={{ marginBottom: '24px' }}>
          <Space size="large" wrap>
            <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {demoQuestions.length}
              </div>
              <Text type="secondary">Questions</Text>
            </div>
            <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {demoCandidate.answers.filter(a => a.answer.trim().length > 0).length}
              </div>
              <Text type="secondary">Answered</Text>
            </div>
            <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {Math.round(demoCandidate.answers.reduce((acc, answer) => acc + answer.timeSpent, 0) / 60)}m
              </div>
              <Text type="secondary">Total Time</Text>
            </div>
            <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {demoCandidate.startTime && demoCandidate.endTime ? 
                  Math.round((demoCandidate.endTime - demoCandidate.startTime) / 1000 / 60) : 0}m
              </div>
              <Text type="secondary">Session Time</Text>
            </div>
          </Space>
        </div>

        {/* Performance by Difficulty */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
            Performance by Difficulty
          </Title>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['easy', 'medium', 'hard'].map(difficulty => {
              const difficultyAnswers = demoCandidate.answers.filter(a => a.difficulty === difficulty);
              const answered = difficultyAnswers.filter(a => a.answer.trim().length > 0).length;
              const total = difficultyAnswers.length;
              const percentage = total > 0 ? (answered / total) * 100 : 0;
              
              return (
                <div key={difficulty} className={`performance-card difficulty-${difficulty}`} style={{
                  flex: 1,
                  minWidth: '200px',
                  border: '1px solid',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <Tag 
                    className={`difficulty-${difficulty}`}
                    style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    {difficulty.toUpperCase()}
                  </Tag>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {answered}/{total}
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Questions Completed
                  </Text>
                  <Progress 
                    percent={percentage} 
                    size="small" 
                    showInfo={false}
                    strokeColor={difficulty === 'easy' ? '#52c41a' : difficulty === 'medium' ? '#faad14' : '#ff4d4f'}
                    style={{ marginTop: '8px' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* What's Next Section */}
        <div style={{ 
          marginTop: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
          border: '1px solid #91d5ff',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Title level={4} style={{ color: '#1890ff', marginBottom: '12px' }}>
            What's Next?
          </Title>
          <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '8px' }}>
            🔍 Our team will carefully review your responses and technical approach
          </Text>
          <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '8px' }}>
            📧 You'll receive an email with feedback and next steps within 2-3 business days
          </Text>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            💼 Thank you for your interest in joining our team!
          </Text>
        </div>
      </Card>
      
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Button type="primary" size="large" onClick={() => window.location.reload()}>
          Start New Interview
        </Button>
      </div>
    </div>
  );
};

export default CompletionDemo;
