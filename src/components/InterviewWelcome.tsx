import React from 'react';
import { Card, Button, Steps, Typography, Space } from 'antd';
import {
  UploadOutlined,
  UserOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  CodeOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface InterviewWelcomeProps {
  onStartInterview?: () => void;
  onUploadResume?: () => void;
  showUploadButton?: boolean;
}

const InterviewWelcome: React.FC<InterviewWelcomeProps> = ({
  onStartInterview,
  onUploadResume,
  showUploadButton = true
}) => {
  return (
    <div style={{
      padding: '40px 24px',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 30px rgba(24, 144, 255, 0.3)'
        }}>
          <TrophyOutlined style={{ fontSize: '36px', color: 'white' }} />
        </div>

        <Title level={1} style={{ marginBottom: '16px' }}>
          Welcome to AI Interview Platform
        </Title>

        <Paragraph style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          Experience the future of technical interviews with our AI-powered platform.
          Get personalized questions based on your resume and showcase your skills in both
          conversational and coding formats.
        </Paragraph>
      </div>

      {/* Prominent CTA Button */}
      <div style={{ marginBottom: '40px' }}>
        <Button
          type="primary"
          size="large"
          icon={<UploadOutlined />}
          onClick={onUploadResume}
          style={{
            height: '56px',
            fontSize: '18px',
            fontWeight: 'bold',
            minWidth: '280px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
            border: 'none',
            boxShadow: '0 6px 20px rgba(24, 144, 255, 0.4)',
          }}
        >
          Start Interview Process
        </Button>
      </div>

      <Card style={{ marginBottom: '32px', textAlign: 'left' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '24px' }}>
          How It Works
        </Title>

        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: 'Upload Your Resume',
              description: 'Upload your PDF or DOCX resume. Our AI will extract your information, projects, and skills automatically.',
              icon: <UploadOutlined />,
            },
            {
              title: 'Review Information',
              description: 'Verify the extracted information and provide any missing details like name, email, or phone number.',
              icon: <UserOutlined />,
            },
            {
              title: 'Start AI Interview',
              description: 'Begin your personalized interview with questions tailored to your background and projects.',
              icon: <PlayCircleOutlined />,
            },
            {
              title: 'Complete Assessment',
              description: 'Answer questions about your experience, projects, and take coding challenges if applicable.',
              icon: <CodeOutlined />,
            },
            {
              title: 'Get Results',
              description: 'Receive detailed feedback, scores, and recommendations based on your performance.',
              icon: <TrophyOutlined />,
            },
          ]}
        />
      </Card>

      <div style={{ marginBottom: '32px' }}>
        <Title level={3} style={{ marginBottom: '24px' }}>
          What Makes Our Platform Special?
        </Title>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
            <Title level={4}>Smart Resume Parsing</Title>
            <Text>Automatically extracts projects, skills, and experience from your resume</Text>
          </Card>

          <Card size="small" style={{ textAlign: 'center' }}>
            <UserOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
            <Title level={4}>Personalized Questions</Title>
            <Text>Questions tailored to your specific background and project experience</Text>
          </Card>

          <Card size="small" style={{ textAlign: 'center' }}>
            <CodeOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
            <Title level={4}>Multi-Format Assessment</Title>
            <Text>Combines conversational AI with hands-on coding challenges</Text>
          </Card>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%)',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '32px'
      }}>
        <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
          Ready to Get Started?
        </Title>
        <Paragraph style={{ marginBottom: '20px' }}>
          Upload your resume to begin your AI-powered interview experience.
          The entire process typically takes 20-30 minutes.
        </Paragraph>

        <Space>
          {onStartInterview && (
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={onStartInterview}
            >
              Start Interview Now
            </Button>
          )}
          {showUploadButton && onUploadResume && (
            <Button
              type="primary"
              size="large"
              icon={<UploadOutlined />}
              onClick={onUploadResume}
            >
              Upload Resume
            </Button>
          )}
          <Button size="large" icon={<FileTextOutlined />}>
            Learn More
          </Button>
        </Space>
      </div>

      <div style={{ color: '#666', fontSize: '14px' }}>
        <Text>
          💡 <strong>Tip:</strong> Make sure your resume includes detailed project descriptions
          and technologies used for the best personalized experience.
        </Text>
      </div>
    </div>
  );
};

export default InterviewWelcome;